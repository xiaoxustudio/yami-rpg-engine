#!/usr/bin/env node
/**
 * 真机端到端冒烟（E2E）—— 启动真正的 Electron 编辑器，走一遍黄金路径。
 *
 * 为什么要有它：`src/**` 的 418 个 spec 全在 jsdom / node 里跑，CI 也从不启动 Electron。
 * 而 2026-10 连续修的那批 bug（懒挂载窗口首次打开丢数据、`copyProgress` 二次打开崩溃、
 * inspector 晚初始化、共享分组没进当前页）**只在真机时序下复现**，jsdom 兜不住。
 * 这里覆盖的正是那类「装得起来≠跑得起来」的失败：
 *
 *   ① 主进程能起来、渲染进程能拿到 CDP target（打包产物 + preload + IPC 全链路活着）；
 *   ② 首页能渲染出最近项目卡片（配置读取 + i18n + 布局管理器就位）；
 *   ③ 能真正打开一份工程并切到 directory 工作区（文件树 / manifest / store 初始化全跑通）；
 *   ④ 两个**懒挂载**工具窗口首次打开后控件已接线（历史崩溃点，见 CONTRIBUTING 检查清单）；
 *   ⑤ 启动时间线有界（挂死检测，同时把 `__BOOT_MARKS__` 打进报告做趋势）；
 *   ⑥ 页面没有未捕获异常（`Uncaught` / `Unhandled` / `TypeError` / `ENOENT`）。
 *
 * 用法：
 *   pnpm e2e                     # 先 build:vite 再跑（CI 用这条）
 *   pnpm e2e --no-build          # 复用现有 dist/（本地迭代最快）
 *   pnpm e2e --keep              # 保留临时 HOME/工程，失败排查用
 *   pnpm e2e --timeout=180000    # 整体超时（默认 120s）
 *
 * 为什么不引 Playwright：见 CONTRIBUTING「端到端（E2E）与截图对比：当前不进 CI」——
 * 本机与 CI 都没有 `@playwright/test` 与浏览器二进制，装不上会把流水线拖红。
 * Electron 二进制随 `pnpm install` 就有了，所以这条路零额外依赖。
 * 也正因为它有「起真机」的成本，它**不进 `.github/workflows/ci.yml` 的必跑门禁**，
 * 而是独立的 `.github/workflows/e2e.yml`（可手动触发），与上面的既定约定一致。
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { connect, sleep } from './lib/cdp.mjs';
import { getFreePort, prepareWorkspace, REPO_ROOT } from './lib/fixture.mjs';
import { launchEditor } from './lib/launch.mjs';

const EDITOR_DIR = path.join(REPO_ROOT, 'packages/editor');
const ARTIFACT_DIR = path.join(REPO_ROOT, 'scripts/e2e/.artifacts');
/** 挂死阈值：不是性能门槛，只是「启动没卡死」的兜底。真实耗时进报告看趋势。 */
const BOOT_CEILING_MS = 30000;

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name, fallback) => {
	const hit = argv.find((arg) => arg.startsWith(`--${name}=`));
	return hit ? hit.slice(name.length + 3) : fallback;
};

const options = {
	build: !flag('no-build'),
	keep: flag('keep'),
	timeoutMs: Number(value('timeout', 120000)),
	openTimeoutMs: Number(value('open-timeout', 90000)),
	// 自测：故意造一个打不开的工程，断言本脚本会红。门禁不能自证就是摆设。
	selftest: flag('selftest')
};

const results = [];
let failed = false;

function log(message) {
	console.log(message);
}

async function step(name, fn) {
	const started = Date.now();
	try {
		const detail = await fn();
		const ms = Date.now() - started;
		results.push({ name, ok: true, ms, detail });
		log(`  ✓ ${name}（${ms}ms）${detail ? ` — ${detail}` : ''}`);
		return true;
	} catch (error) {
		failed = true;
		const ms = Date.now() - started;
		results.push({ name, ok: false, ms, error: String(error?.message ?? error) });
		log(`  ✗ ${name}（${ms}ms）— ${error?.message ?? error}`);
		return false;
	}
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

async function ensureBuild() {
	if (!options.build) return '跳过（--no-build）';
	const started = Date.now();
	const run = spawnSync('pnpm', ['-F', '@yami/editor', 'build:vite'], {
		cwd: REPO_ROOT,
		stdio: 'inherit',
		shell: process.platform === 'win32'
	});
	assert(run.status === 0, `build:vite 失败（退出码 ${run.status}）`);
	return `${Math.round((Date.now() - started) / 1000)}s`;
}

async function ensureArtifacts() {
	for (const relative of [
		'dist/index.html',
		'dist-electron/main.js',
		'dist-electron/preload.js'
	]) {
		const target = path.join(EDITOR_DIR, relative);
		await fs.access(target).catch(() => {
			throw new Error(
				`缺少构建产物 packages/editor/${relative}；先跑 \`pnpm -F @yami/editor build:vite\` 或去掉 --no-build`
			);
		});
	}
}

/** 页面里的「工程是否已切到工作区」探针：页面切换由布局管理器控制，没有路由可查。 */
const ACTIVE_WORKSPACE = `(() => {
	const manager = document.getElementById('workspace-page-manager');
	if (!manager) return null;
	const frame = [...manager.children].find(
		(child) => child.classList.contains('visible') && child.getAttribute('value') !== 'home'
	);
	return frame ? frame.getAttribute('value') : null;
})()`;

/** 懒挂载窗口「控件已接线」的判据与 deferred-window-smoke.spec.ts 保持同一份类名清单。 */
const CONTROL_CLASSES =
	'.select-box,.custom-box,.text-box,.number-box,.text-area,.check-box,.radio-box,.page-manager,.common-list,.color-box,.slider-box';

async function main() {
	const startedAt = Date.now();
	await fs.mkdir(ARTIFACT_DIR, { recursive: true });

	log('');
	log('Yami RPG Editor — 真机 E2E 冒烟');
	log(`  平台 ${process.platform} / Electron 真机 / 零额外依赖`);
	log('');

	const workspace = await prepareWorkspace({
		keep: options.keep,
		sabotage: options.selftest
	});
	const port = await getFreePort();
	let editor = null;
	let cdp = null;

	const hardTimeout = setTimeout(async () => {
		log(`\n✗ 整体超时（${options.timeoutMs}ms），强制收摊`);
		await editor?.stop();
		process.exit(1);
	}, options.timeoutMs);
	hardTimeout.unref?.();

	try {
		await step('构建产物就位', async () => {
			const built = await ensureBuild();
			await ensureArtifacts();
			return built;
		});

		await step('启动 Electron（隔离 HOME）', async () => {
			editor = await launchEditor({
				home: workspace.home,
				workspaceRoot: workspace.root,
				port
			});
			return `pid=${editor.child.pid} port=${port}`;
		});
		if (failed) return;

		await step('接入渲染进程（CDP）', async () => {
			cdp = await connect(port, { timeoutMs: 60000 });
			return cdp.page.url.replace(/^.*packages[\\/]editor[\\/]/, '');
		});
		if (failed) return;

		await step('首页就绪（启动时间线 home-visible）', async () => {
			const ready = await cdp.waitFor(
				`Array.isArray(window.__BOOT_MARKS__) && window.__BOOT_MARKS__.some((mark) => mark.name === 'home-visible')`,
				{ timeoutMs: 60000 }
			);
			assert(ready, '启动 60s 内没有出现 home-visible 打点（主进程或渲染进程挂死）');
			return 'home-visible';
		});

		await step('最近项目卡片渲染', async () => {
			const count = await cdp.waitFor(
				`document.querySelectorAll('#home-recent-list .home-recent-item').length || false`,
				{ timeoutMs: 30000 }
			);
			assert(count, '首页没有渲染出最近项目卡片（config.json 读取或 home 组件失败）');
			return `${count} 张卡片`;
		});

		await step('打开工程 → directory 工作区', async () => {
			const clicked = await cdp.evaluate(`(() => {
				const items = [...document.querySelectorAll('#home-recent-list .home-recent-item')];
				const item = items.find((el) => (el.textContent || '').includes('e2e-fixture')) ?? items[0];
				if (!item) return 'no-item';
				item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
				item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
				item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
				return 'clicked';
			})()`);
			assert(clicked === 'clicked', '找不到可点击的最近项目卡片');

			const workspaceName = await cdp.waitFor(`(${ACTIVE_WORKSPACE}) === 'directory'`, {
				timeoutMs: options.openTimeoutMs
			});
			const actual = await cdp.evaluate(ACTIVE_WORKSPACE);
			assert(
				workspaceName,
				`工程没有切到 directory 工作区（当前：${actual ?? '仍在 home / 未渲染'}）`
			);

			const tree = await cdp.evaluate(
				`document.querySelectorAll('#workspace-page-manager .group').length`
			);
			assert(tree > 0, 'directory 工作区没有渲染出任何分组（布局壳没起来）');
			return `groups=${tree}`;
		});

		/**
		 * 懒挂载窗口：首次打开时控件 API 才接线，这是本仓 2026-10 反复出事的点。
		 * 断言「窗口开了 + 控件真的挂上了」——只断言 `.open` 类名会被空壳骗过。
		 */
		await step('懒挂载工具窗口首次打开（command / attribute）', async () => {
			const opened = [];
			for (const id of ['command', 'attribute']) {
				await cdp.evaluate(`window.Window.open(${JSON.stringify(id)}); true`);
				const appeared = await cdp.waitFor(
					`[...document.querySelectorAll('.window-frame.open')].map((frame) => frame.id).includes(${JSON.stringify(id)})`,
					{ timeoutMs: 20000 }
				);
				assert(appeared, `窗口 ${id} 打开后没有出现 .window-frame.open`);

				const probe = await cdp.evaluate(`(() => {
					const frame = [...document.querySelectorAll('.window-frame.open')].find(
						(el) => el.id === ${JSON.stringify(id)}
					);
					if (!frame) return null;
					return {
						title: (frame.querySelector('.title-bar')?.textContent ?? '').trim(),
						controls: frame.querySelectorAll('${CONTROL_CLASSES}').length,
						nodes: frame.querySelectorAll('*').length
					};
				})()`);
				assert(probe, `窗口 ${id} 的 DOM 消失了`);
				assert(probe.nodes > 20, `窗口 ${id} 只挂了个空壳（${probe.nodes} 个节点）`);
				assert(
					probe.controls > 0,
					`窗口 ${id} 挂载后没有接线任何控件（疑似懒挂载竞态，见 CONTRIBUTING 检查清单第 2 条）`
				);
				opened.push(`${id}(${probe.controls} 控件)`);

				await cdp.evaluate(`window.Window.close(${JSON.stringify(id)}); true`);
			}
			return opened.join(' + ');
		});

		await step('启动时间线有界', async () => {
			const marks = await cdp.evaluate(
				`JSON.stringify((window.__BOOT_MARKS__ ?? []).map((mark) => ({ name: mark.name, ms: Math.round(mark.ms) })))`
			);
			const parsed = JSON.parse(marks ?? '[]');
			assert(parsed.length > 0, '页面里没有 __BOOT_MARKS__ 打点');
			const homeVisible = parsed.find((mark) => mark.name === 'home-visible');
			assert(homeVisible, '启动时间线缺 home-visible');
			assert(
				homeVisible.ms < BOOT_CEILING_MS,
				`home-visible 用了 ${homeVisible.ms}ms，超过挂死阈值 ${BOOT_CEILING_MS}ms`
			);
			return `home-visible=${homeVisible.ms}ms`;
		});

		await step('页面无未捕获异常', async () => {
			// 给异步副作用一点时间落地（工程打开后的懒加载）
			await sleep(1200);
			const fatal = /Uncaught|Unhandled|TypeError|ENOENT|is not a function|Cannot read/;
			const bad = cdp.consoleErrors.filter((line) => fatal.test(line));
			const forwarded = (editor?.text() ?? '')
				.split('\n')
				.filter((line) => line.startsWith('[renderer:error]') && fatal.test(line));
			const all = [...bad, ...forwarded];
			assert(
				all.length === 0,
				`捕获到 ${all.length} 条致命错误：\n    ${all.slice(0, 5).join('\n    ')}`
			);
			return '0 条';
		});
	} finally {
		clearTimeout(hardTimeout);

		if (failed) {
			await captureArtifacts(cdp, editor, workspace).catch(() => undefined);
		}
		cdp?.close();
		await editor?.stop();
		await workspace.cleanup();
	}

	const ok = results.every((entry) => entry.ok);
	const summary = {
		ok,
		selftest: options.selftest,
		platform: process.platform,
		durationMs: Date.now() - startedAt,
		steps: results
	};
	await fs.writeFile(
		path.join(ARTIFACT_DIR, 'e2e-report.json'),
		JSON.stringify(summary, null, 2)
	);

	log('');
	if (options.selftest) {
		// 反例模式：工程数据被删 ⇒ 必须红。红了才算自测通过；绿了说明这条门禁是瞎的。
		const failedSteps = results.filter((entry) => !entry.ok);
		const reachedOpen = failedSteps.some((entry) => entry.name.startsWith('打开工程'));
		log(
			ok
				? '✗ 自测失败：反例工程照样"通过"了 —— 这条门禁抓不住打不开的工程'
				: `✓ 自测通过：反例工程已变红（首个失败步骤：${failedSteps[0]?.name}）`
		);
		if (!reachedOpen && !ok) {
			log('  · 注意：红点没有落在「打开工程」这一步，反例可能被更早的步骤拦下了');
		}
		process.exit(ok ? 1 : 0);
	}

	log(`结果：${ok ? '通过' : '失败'}（${(summary.durationMs / 1000).toFixed(1)}s）`);
	if (options.keep) log(`临时工作区已保留：${workspace.root}`);
	process.exit(ok ? 0 : 1);
}

/** 失败现场：截图 + 主进程日志尾部，放到 .artifacts 供 CI 上传。 */
async function captureArtifacts(cdp, editor, workspace) {
	if (cdp) {
		try {
			const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
			await fs.writeFile(
				path.join(ARTIFACT_DIR, 'failure.png'),
				Buffer.from(shot.data, 'base64')
			);
		} catch {
			/* 截图失败不影响结论 */
		}
		const html = await cdp
			.evaluate(`document.body ? document.body.innerHTML.slice(0, 200000) : ''`)
			.catch(() => '');
		await fs.writeFile(path.join(ARTIFACT_DIR, 'failure.html'), html ?? '');
	}
	if (editor) {
		await fs.writeFile(path.join(ARTIFACT_DIR, 'main-process.log'), editor.text());
	}
	const config = path.join(workspace.home, '.openyami', 'config.json');
	await fs.copyFile(config, path.join(ARTIFACT_DIR, 'config.json')).catch(() => undefined);
}

main().catch(async (error) => {
	console.error('E2E 异常退出：', error);
	process.exit(1);
});
