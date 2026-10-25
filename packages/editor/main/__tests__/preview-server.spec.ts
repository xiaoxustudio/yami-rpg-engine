// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';

vi.mock('electron', () => ({
	ipcMain: { handle: vi.fn(), on: vi.fn() }
}));

const { startServer, stopServer, getServerState } = await import('../services/server.ts');

const tempDirs: string[] = [];

interface RawResponse {
	status: number;
	headers: http.IncomingHttpHeaders;
	body: Buffer;
}

/**
 * 裸 HTTP 请求，直接给 `path` 字符串。
 *
 * 两处都不能用 `fetch`：
 * 1. undici 按 Fetch 规范处理 304 —— 条件请求没有对应的已缓存响应时会被改写，
 *    量不出服务端真实发出的状态码；
 * 2. `fetch`/`new URL` 会先把 `..` 归一化掉，路径穿越用例根本到不了服务端。
 */
const rawGet = (
	base: string,
	rawPath: string,
	headers: Record<string, string> = {}
): Promise<RawResponse> =>
	new Promise((resolve, reject) => {
		const { hostname, port } = new URL(base);
		const request = http.request(
			{
				hostname,
				port: Number(port),
				path: rawPath,
				method: 'GET',
				// 每条请求独占一条 TCP 连接：`freePort()` 归还的端口会被后面的用例重新绑到
				// 同一个号上，而 Node 19+ 的全局 agent 默认 keep-alive，会把上一条连接留给
				// 下一个（已经换了实现的）服务器。CI 上实测过一次 `Parse Error: Expected
				// HTTP/, RTSP/ or ICE/`——客户端在旧连接上读到了半截残留字节。
				agent: false,
				headers: { connection: 'close', ...headers }
			},
			(response) => {
				const chunks: Buffer[] = [];
				response.on('data', (chunk: Buffer) => chunks.push(chunk));
				response.on('end', () =>
					resolve({
						status: response.statusCode ?? 0,
						headers: response.headers,
						body: Buffer.concat(chunks)
					})
				);
			}
		);
		request.on('error', reject);
		request.end();
	});

/**
 * 每个用例都用**本轮还没用过的**端口。
 *
 * 早先的实现是「listen(0) 探一个空闲端口、关掉再绑」，于是相邻用例经常拿到同一个号：
 * 上一条用例留下的 keep-alive 连接还挂在这个号上，而下一条用例的服务器是全新的 Koa 实例，
 * 客户端就可能复用旧连接读到半截字节。CI（Linux）上真红过一次——
 * `Parse Error: Expected HTTP/, RTSP/ or ICE/`。改成单调递增后，同一个端口在整轮测试里
 * 只会被绑定一次，这类残留连接在结构上就不存在了。
 */
let portCursor = 20000 + Math.floor(Math.random() * 20000);

/**
 * 起一个真实的预览服务器，返回基址、`.preview` 根目录与工程目录。
 *
 * `config.path` 是**工程文件**的路径（真实调用点传的是 `Editor.config.project`，
 * 见 `src/services/ipc/webserver.ts`），服务端取它的 dirname 再拼 `.preview`。
 */
const serve = async (
	files: Record<string, string | Buffer>
): Promise<{ base: string; root: string; dir: string }> => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'yami-preview-'));
	tempDirs.push(dir);
	const root = path.join(dir, '.preview');
	fs.mkdirSync(root, { recursive: true });
	for (const [name, content] of Object.entries(files)) {
		const target = path.join(root, name);
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, content);
	}
	const startPath = path.join(dir, 'project.yami');
	for (let attempt = 0; attempt < 20; attempt++) {
		const port = portCursor++;
		// oxlint-disable-next-line no-await-in-loop
		const started = await startServer({} as never, { path: startPath, port });
		if (started) {
			return { base: `http://127.0.0.1:${port}`, root, dir };
		}
	}
	throw new Error('预览服务器未能绑定端口');
};

afterEach(() => {
	stopServer();
	for (const dir of tempDirs.splice(0)) {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

describe('预览服务器（Koa）', () => {
	it('根路径返回 index.html，带正确 Content-Type 与 Content-Length', async () => {
		const { base } = await serve({ 'index.html': '<h1>hi</h1>' });
		const response = await rawGet(base, '/');
		expect(response.status).toBe(200);
		expect(response.headers['content-type']).toContain('text/html');
		expect(response.headers['content-length']).toBe('11');
		expect(response.body.toString()).toBe('<h1>hi</h1>');
	});

	it('普通文件按扩展名给 Content-Type', async () => {
		const { base } = await serve({ 'a.txt': 'hello' });
		const response = await rawGet(base, '/a.txt');
		expect(response.status).toBe(200);
		expect(response.headers['content-type']).toContain('text/plain');
		expect(response.headers['content-length']).toBe('5');
		expect(response.body.toString()).toBe('hello');
	});

	it('大二进制文件流式传输后内容与 Content-Length 都正确', async () => {
		const payload = Buffer.alloc(2 * 1024 * 1024);
		for (let i = 0; i < payload.length; i++) payload[i] = i % 251;
		const { base } = await serve({ 'big.bin': payload });
		const response = await rawGet(base, '/big.bin');
		expect(response.status).toBe(200);
		expect(Number(response.headers['content-length'])).toBe(payload.length);
		expect(response.body.length).toBe(payload.length);
		expect(response.body.equals(payload)).toBe(true);
	});

	it('子目录请求回 404 而不是抛错或列目录', async () => {
		const { base } = await serve({ 'sub/inner.txt': 'x' });
		expect((await rawGet(base, '/sub')).status).toBe(404);
	});

	it('不存在的文件回 404', async () => {
		const { base } = await serve({ 'a.txt': 'hello' });
		expect((await rawGet(base, '/nope.txt')).status).toBe(404);
	});

	it('404 与 400 分支带正确的 HTTP 状态码', async () => {
		const { base } = await serve({ 'a.txt': 'hello' });
		expect((await rawGet(base, '/nope.txt')).status).toBe(404);
		expect((await rawGet(base, '/%E0%A4%A')).status).toBe(400);
	});

	it('路径穿越被拦截（不回 previewRoot 之外的文件）', async () => {
		const { base, dir } = await serve({ 'a.txt': 'hello' });
		fs.writeFileSync(path.join(dir, 'secret.txt'), 'TOP-SECRET');
		expect(fs.existsSync(path.join(dir, 'secret.txt'))).toBe(true);
		const attempts = [
			'/../secret.txt',
			'/..%2Fsecret.txt',
			'/%2e%2e%2fsecret.txt',
			'/sub/../../secret.txt',
			'/%2e%2e/secret.txt'
		];
		const responses = await Promise.all(attempts.map((attempt) => rawGet(base, attempt)));
		for (const [index, response] of responses.entries()) {
			expect(response.status, `越权路径未被拦截: ${attempts[index]}`).toBe(404);
			expect(response.body.toString(), `越权内容被返回: ${attempts[index]}`).not.toContain(
				'TOP-SECRET'
			);
		}
	});

	it('带 If-Modified-Since 的重复请求回 304 且不带响应体', async () => {
		const { base } = await serve({ 'a.txt': 'hello' });
		const first = await rawGet(base, '/a.txt');
		expect(first.status).toBe(200);
		const lastModified = first.headers['last-modified'];
		expect(lastModified).toBeTruthy();

		const second = await rawGet(base, '/a.txt', { 'if-modified-since': lastModified! });
		expect(second.status).toBe(304);
		expect(second.body.length).toBe(0);
	});

	it('文件更新后 If-Modified-Since 不再命中缓存', async () => {
		const { base, root } = await serve({ 'a.txt': 'hello' });
		const stale = new Date(Date.now() - 60_000).toUTCString();
		expect((await rawGet(base, '/a.txt')).status).toBe(200);

		fs.writeFileSync(path.join(root, 'a.txt'), 'hello-v2');
		const second = await rawGet(base, '/a.txt', { 'if-modified-since': stale });
		expect(second.status).toBe(200);
		expect(second.body.toString()).toBe('hello-v2');
	});

	it('startServer 会把服务状态置为 true，stopServer 复位', async () => {
		expect(getServerState()).toBe(false);
		const { base } = await serve({ 'a.txt': 'hello' });
		expect(getServerState()).toBe(true);
		expect((await rawGet(base, '/a.txt')).status).toBe(200);
		stopServer();
		expect(getServerState()).toBe(false);
	});
});
