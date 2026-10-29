/**
 * 启动/关闭真正的 Electron 编辑器进程（E2E 用）。
 *
 * 三个必须处理的坑（都实测踩过，别再踩一遍）：
 *
 * 1. `ELECTRON_RUN_AS_NODE=1`。某些工具链会把它写进环境变量，Electron 会退化成纯 Node，
 *    表现为 `dist-electron/main.js` 里 `ipcMain` undefined、进程立刻退出、CDP 端口永远不出现。
 *    启动前必须摘掉，而不是"设成 0"。
 * 2. Windows 上用 `spawn` 起的 electron 会带一串子进程（GPU / utility），`child.kill()`
 *    只能杀掉根进程，渲染/GPU 进程会变成孤儿并占着调试端口。必须 `taskkill /T /F`。
 * 3. 隔离 HOME 时 APPDATA / LOCALAPPDATA / TEMP 也必须指向已存在的目录，
 *    只改 HOME 会让 Electron 在启动阶段直接崩（退出码 0x80000003，无任何输出）。
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import { REPO_ROOT } from './fixture.mjs';

const EDITOR_DIR = path.join(REPO_ROOT, 'packages/editor');

/** `require('electron')` 在 Node 侧返回二进制路径（不是 API 对象）。 */
function resolveElectronBinary() {
	const require = createRequire(path.join(EDITOR_DIR, 'package.json'));
	const binary = require('electron');
	if (typeof binary !== 'string') {
		throw new Error(
			'无法解析 electron 二进制路径（拿到的是 ' +
				typeof binary +
				'）。请先执行 `pnpm install`。'
		);
	}
	return binary;
}

async function prepareIsolatedEnv(home, workspaceRoot) {
	const appData = path.join(home, 'AppData', 'Roaming');
	const localAppData = path.join(home, 'AppData', 'Local');
	const temp = path.join(workspaceRoot, 'temp');
	await Promise.all([
		fs.mkdir(appData, { recursive: true }),
		fs.mkdir(localAppData, { recursive: true }),
		fs.mkdir(temp, { recursive: true })
	]);
	const env = {
		...process.env,
		HOME: home,
		USERPROFILE: home,
		APPDATA: appData,
		LOCALAPPDATA: localAppData,
		TEMP: temp,
		TMP: temp
	};
	delete env.ELECTRON_RUN_AS_NODE;
	// 关掉 Chromium 的崩溃上报与首次运行提示，减少 CI 噪声
	env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
	return env;
}

/**
 * @param {{ home: string, workspaceRoot: string, port: number, extraArgs?: string[] }} options
 */
export async function launchEditor({ home, workspaceRoot, port, extraArgs = [] }) {
	const binary = resolveElectronBinary();
	const env = await prepareIsolatedEnv(home, workspaceRoot);
	const args = [EDITOR_DIR, `--remote-debugging-port=${port}`, '--disable-gpu', ...extraArgs];
	if (process.platform === 'linux') {
		// GitHub Actions 的 runner 没有 user namespace，Chromium 沙箱起不来
		args.push('--no-sandbox', '--disable-dev-shm-usage');
	}

	const child = spawn(binary, args, {
		cwd: EDITOR_DIR,
		env,
		stdio: ['ignore', 'pipe', 'pipe'],
		detached: process.platform !== 'win32'
	});

	// 只保留尾部：日志量大时不要无限增长（一次启动可能几万行）
	const output = { stdout: [], stderr: [] };
	const keep = (bucket) => (chunk) => {
		bucket.push(chunk.toString());
		if (bucket.length > 400) bucket.splice(0, bucket.length - 400);
	};
	child.stdout.on('data', keep(output.stdout));
	child.stderr.on('data', keep(output.stderr));

	let exited = false;
	const exitPromise = new Promise((resolve) => {
		child.once('exit', (code, signal) => {
			exited = true;
			resolve({ code, signal });
		});
	});
	child.once('error', (error) => {
		exited = true;
		throw error;
	});

	const text = () => [...output.stdout, ...output.stderr].join('');

	const stop = async () => {
		if (exited) return;
		if (process.platform === 'win32') {
			await new Promise((resolve) => {
				const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
					stdio: 'ignore'
				});
				killer.once('exit', resolve);
				killer.once('error', resolve);
			});
		} else {
			const pid = child.pid;
			try {
				if (typeof pid === 'number') process.kill(-pid, 'SIGKILL');
				else child.kill('SIGKILL');
			} catch {
				child.kill('SIGKILL');
			}
		}
		await Promise.race([exitPromise, new Promise((resolve) => setTimeout(resolve, 5000))]);
	};

	return { child, stop, text, exitPromise, output, exited: () => exited };
}
