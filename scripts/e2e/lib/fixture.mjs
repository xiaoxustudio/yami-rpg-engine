/**
 * E2E 工作区准备：一个全新的 HOME + 一份最小可打开的工程。
 *
 * 为什么必须隔离 HOME：编辑器把「最近项目 / 主题 / 语言 / 对话框目录」写在
 * `os.homedir()/.openyami/config.json`（见 src/utils/config.ts），
 * 直接跑会污染开发者本机的最近项目列表，CI 上又会因为"没有最近项目"而无法开始。
 *
 * 为什么要提交一份 fixture 工程而不是现场组装模板：`packages/template-arpg` 的
 * 组装产物约 426MB（Assets 占 417MB），在 CI 里复制/提交都不现实。
 * `fixture/` 只保留打开工程必需的数据（Data/*.json + game.yamirpg + 空资产目录），
 * 约 300KB。fixture 的 Data 取自模板的 zh-CN 组装产物（1.0.147 数据 schema），
 * 模板数据 schema 变更时随 `pnpm pack:resources` 一起更新它。
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, '../../..');
export const FIXTURE_DIR = path.join(REPO_ROOT, 'scripts/e2e/fixture');

/** 取一个空闲端口（避免与开发者本机正在跑的调试端口撞车）。 */
export async function getFreePort() {
	const { createServer } = await import('node:net');
	return new Promise((resolve, reject) => {
		const server = createServer();
		server.unref();
		server.on('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const { port } = server.address();
			server.close(() => resolve(port));
		});
	});
}

/**
 * 建临时工作区：
 *   <tmp>/home/.openyami/config.json   ← 编辑器配置（recent 指向 fixture 工程）
 *   <tmp>/project/                    ← fixture 工程的副本（测试会写它，所以必须复制）
 */
export async function prepareWorkspace({ keep = false, sabotage = false } = {}) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'yami-e2e-'));
	const home = path.join(root, 'home');
	const project = path.join(root, 'project');

	await fs.mkdir(path.join(home, '.openyami'), { recursive: true });
	await fs.mkdir(home, { recursive: true });
	await fs.cp(FIXTURE_DIR, project, { recursive: true });

	if (sabotage) {
		// 自测专用：把工程数据删掉，让「打开工程」必然失败（game.yamirpg 仍存在，
		// 首页卡片照常渲染 ⇒ 红点落在「打开工程」这一步，而不是前面几步）。
		await fs.rm(path.join(project, 'Data', 'config.json'), { force: true });
	}

	const projectFile = path.join(project, 'game.yamirpg');
	const config = {
		theme: 'dark',
		language: 'zh-CN',
		project: '',
		// 打开工程走首页「最近项目」卡片；不预填 project 是因为启动流程总是先落回 home
		// （src/main/initialize.ts 里 Layout.manager.switch('home')），预填只会让人误解。
		recent: [{ name: 'e2e-fixture', path: projectFile, date: new Date().toISOString() }],
		dialogs: { new: home, open: home, deploy: home, import: home, export: home },
		zoom: 1
	};
	await fs.writeFile(
		path.join(home, '.openyami', 'config.json'),
		JSON.stringify(config, null, 2)
	);

	const cleanup = async () => {
		if (keep) return;
		await fs.rm(root, { recursive: true, force: true }).catch(() => undefined);
	};

	return { root, home, project, projectFile, cleanup };
}
