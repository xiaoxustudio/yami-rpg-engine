// F.5 / E.3 / M4 / L1 / S1 真机冒烟驱动（CDP over WebSocket，Node >=22 全局 WebSocket）。
// 前提：editor 已构建（pnpm -F @yami/editor build:all）并以如下方式启动：
//   electron --remote-debugging-port=9223 <packages/editor>（home 需有最近项目 game.yamirpg 可打开）
// 用法: node scripts/smoke-layout.mjs <phase> [port] [args…]
// phase: debug | open-project | mode2-directory | roundtrip-scene | mode0-control
//        | drag-mode0 | drag-mode2 | drag-here | drag-scene | drag-region
//        | drag-region-edge <left|right|top|bottom> [pick=a|b]      ← L1：region 四方向
//        | drag-region-all [<方向>] [pick=…]                        （drag-region-edge 的别名）
//        | tree-windows keys=F3,F6,… | ids=<窗口 id,…> [interact=1]  ← S1：数据绑定型窗口
//        | menu-windows index=5,6                                    ← S1：走「窗口」菜单的条目
// L1 的稳妥做法：**每个方向重启一次 app**（layout 是会话态），顺序为
//   open-project → drag-region-edge <方向> pick=a → drag-region-edge <方向> pick=b
// （pick=a：源取最后一个叶子、目标取第一个；pick=b 反之——两个都跑，才能区分"设计内的相邻 no-op"
//   与"方向没实现"。S1 的 `interact=1` 会在核对行数后追加交互链路：选中 → 折叠 → 展开 → F2。）
import { writeFileSync } from 'node:fs';

const port = Number(process.argv.slice(3).find((a) => /^\d+$/.test(a)) || 9223);
const phase = process.argv[2];
// 方向参数（仅在 drag-region-edge / drag-region-all 用）：left|right|top|bottom，
// 允许与端口号以任意顺序出现——早先按固定位置取 argv[3] 会把方向当成端口（PORT=NaN → 连不上）。
const edgeArg = String(
	process.argv.slice(3).find((a) => /^(left|right|top|bottom)$/i.test(a)) ?? 'right'
).toLowerCase();
// 源/目标选择（同样是位置无关的参数）：pick=a → 源取最后一个叶子、目标取第一个叶子；
// pick=b → 反过来。同一方向跑两次，避免"源本来就紧邻目标"导致设计内的 no-op 被误读成失败。
const pickArg = String(process.argv.slice(3).find((a) => /^pick=[ab]$/i.test(a)) ?? 'pick=a')
	.split('=')[1]
	.toLowerCase();
// S1 的 `interact=1`：核对行数后再跑一遍交互链路（选中 → 折叠 → 展开 → F2）
const interact = process.argv.slice(3).includes('interact=1');
if (!phase) {
	console.error('usage: node scripts/smoke-layout.mjs <phase> [port] [edge]');
	process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.error('[smoke]', ...a);

async function listTargets() {
	for (let i = 0; i < 40; i++) {
		try {
			const res = await fetch(`http://127.0.0.1:${port}/json/list`);
			if (res.ok) return await res.json();
		} catch {}
		await sleep(250);
	}
	throw new Error('CDP endpoint not reachable');
}

async function connect() {
	const targets = await listTargets();
	const page = targets.find(
		(t) => t.type === 'page' && (t.url.startsWith('file:') || t.url.includes('localhost:5173'))
	);
	if (!page)
		throw new Error('no page target: ' + JSON.stringify(targets.map((t) => ({ t: t.type, u: t.url }))));
	log('page target:', page.url);
	const ws = new WebSocket(page.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		ws.addEventListener('open', resolve, { once: true });
		ws.addEventListener('error', (e) => reject(new Error('ws error ' + (e.message ?? ''))), { once: true });
	});
	let seq = 0;
	const pending = new Map();
	ws.addEventListener('message', (ev) => {
		let msg;
		try {
			msg = JSON.parse(ev.data);
		} catch {
			return;
		}
		if (msg.id && pending.has(msg.id)) {
			const { resolve, reject } = pending.get(msg.id);
			pending.delete(msg.id);
			if (msg.error) reject(new Error(JSON.stringify(msg.error)));
			else resolve(msg.result);
		}
	});
	const send = (method, params = {}) =>
		new Promise((resolve, reject) => {
			const id = ++seq;
			// 超时兜底：页内被节流的 await 会让 CDP 永不回包（实测卡死过一次），
			// 没有这一层的话整个 phase 会挂到人工 Ctrl-C。
			const timer = setTimeout(() => {
				if (pending.has(id)) {
					pending.delete(id);
					reject(new Error(`CDP ${method} timed out after 30s`));
				}
			}, 30000);
			pending.set(id, {
				resolve: (value) => {
					clearTimeout(timer);
					resolve(value);
				},
				reject: (error) => {
					clearTimeout(timer);
					reject(error);
				}
			});
			ws.send(JSON.stringify({ id, method, params }));
		});
	return { ws, send };
}

async function evaluate(send, expression) {
	const result = await send('Runtime.evaluate', {
		expression,
		returnByValue: true,
		awaitPromise: true
	});
	if (result.exceptionDetails) {
		throw new Error(
			'eval failed: ' +
				JSON.stringify(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
		);
	}
	return result.result?.value;
}

// 等待一律走「Node 侧 CDP 轮询」：Chromium 会节流隐藏窗口的页内 setTimeout/setInterval，
// 页内轮询会假超时（2026-09-09 实测：mode2 首载 33s，页内 30s 轮询先耗尽）。
const waitForSelector = async (send, selector, ms = 15000) => {
	const deadline = Date.now() + ms;
	for (;;) {
		// oxlint-disable-next-line no-await-in-loop
		const found = await evaluate(send, `!!document.querySelector(${JSON.stringify(selector)})`);
		if (found) return true;
		if (Date.now() >= deadline) return false;
		// oxlint-disable-next-line no-await-in-loop
		await sleep(250);
	}
};

const out = (name, value) => {
	const line = JSON.stringify({ phase, name, value });
	console.log(line);
	writeFileSync(`scripts/smoke-report-${phase}.json`, line + '\n');
};

const SNAPSHOT = `(() => {
	const ws = document.getElementById('workspace-page-manager');
	const report = { home: null, workspace: null, leaves: [] };
	if (!ws) return report;
	report.home = !!document.querySelector('#workspace-page-manager > .page-frame[value="home"]');
	const activeFrame = [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
	report.workspace = activeFrame?.getAttribute('value') ?? null;
	const root = activeFrame ? [...activeFrame.children].find((c) => c.classList.contains('group')) : null;
	if (!root) return report;
	const walk = (node, depth) => {
		if (node.classList.contains('group') && node.split === undefined) {
			const nav = node.nav;
			const manager = node.manager;
			report.leaves.push({
				depth,
				tabs: node.tabs ? [...node.tabs] : null,
				navValues: nav ? [...nav.children].map((n) => n.getAttribute('value')) : null,
				managerPages: manager
					? [...manager.children]
							.filter((c) => c.classList.contains('page-frame'))
							.map((p) => ({ value: p.getAttribute('value'), visible: p.classList.contains('visible') }))
					: null,
				activeTab: manager?.active ?? null
			});
			return;
		}
		for (const child of [...node.children]) {
			if (child.classList && child.classList.contains('group')) walk(child, depth + 1);
		}
	};
	walk(root, 0);
	return report;
})()`;

const waitActive = async (send, workspace, ms = 15000) => {
	const selector = `.page-frame[value="${workspace}"].visible`;
	const deadline = Date.now() + ms;
	for (;;) {
		// oxlint-disable-next-line no-await-in-loop
		const ok = await evaluate(send, `!!document.querySelector(${JSON.stringify(selector)})`);
		if (ok) return true;
		if (Date.now() >= deadline) return false;
		// oxlint-disable-next-line no-await-in-loop
		await sleep(250);
	}
};

// 等待任一非 home 工作区激活，并返回其 value
const waitForActiveWorkspace = async (send, ms = 15000) => {
	const expression = `(() => {
		const ws = document.getElementById('workspace-page-manager');
		const frame = ws && [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
		return frame ? frame.getAttribute('value') : null;
	})()`;
	const deadline = Date.now() + ms;
	for (;;) {
		// oxlint-disable-next-line no-await-in-loop
		const value = await evaluate(send, expression);
		if (value) return value;
		if (Date.now() >= deadline) return null;
		// oxlint-disable-next-line no-await-in-loop
		await sleep(250);
	}
};

async function openRecentProject(send) {
	await waitForSelector(send, '#home-recent-list .home-recent-item', 25000);
	let ok = false;
	let lastState = null;
	for (let attempt = 0; attempt < 2 && !ok; attempt++) {
		const clicked = await evaluate(
			send,
			`(() => {
				const item = [...document.querySelectorAll('#home-recent-list .home-recent-item')].find(
					(el) => /game\\.yamirpg/.test(el.textContent || '')
				);
				if (!item) return 'no-item';
				item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
				item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
				item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
				return 'clicked';
			})()`
		);
		await sleep(3000);
		// mode2（Teleport）首载含 Vue 组树挂载 + 整壳 Teleport 落位，实测可达 30s 量级
		ok = await waitActive(send, 'directory', 90000);
		lastState = clicked;
		if (!ok) {
			log('open attempt', attempt, 'failed, state:', await evaluate(
				send,
				`(() => {
					const ws = document.getElementById('workspace-page-manager');
					const active = ws ? [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home') : null;
					return active?.getAttribute('value') ?? null;
				})()`
			));
		}
	}
	if (!ok) throw new Error('open recent project failed (last click: ' + lastState + ')');
}

async function switchTo(send, value) {
	await evaluate(
		send,
		`document.getElementById('workspace-page-manager').switch(${JSON.stringify(value)})`
	);
	await waitActive(send, value, 20000);
	await sleep(1200);
}

async function runPhase(phaseFn) {
	try {
		await phaseFn();
		log('phase done');
	} catch (e) {
		console.error(JSON.stringify({ phase, error: String(e?.stack ?? e) }));
		// 出错路径上 phase 内部的 `ws.close()` 不会执行，而打开的 WebSocket 会让事件循环
		// 一直活着 ⇒ 命令挂到人工 Ctrl-C（实测踩过两次）。报错即退出。
		process.exit(1);
	}
}

async function debug() {
	const { ws, send } = await connect();
	await send('Runtime.enable');
	const state = await evaluate(
		send,
		`(() => ({
			title: document.title,
			hasApp: !!document.getElementById('app'),
			workspaceManager: !!document.getElementById('workspace-page-manager'),
			bodyHead: document.body?.innerText?.slice(0, 300) ?? null,
			readyState: document.readyState,
			// 页面上的运行时单例（脚手架能不能直接驱动 layout 就看这里）
			globals: ['Layout', 'Window', 'Editor', 'File', 'Data', 'Path', 'Log', 'GUID'].filter(
				(k) => k in window
			),
			layoutKeys: 'Layout' in window && window.Layout ? Object.keys(window.Layout).length : 0
		}))()`
	);
	out('state', state);
	ws.close();
}

async function openProject() {
	const { ws, send } = await connect();
	await send('Runtime.enable');
	await openRecentProject(send);
	const state = await evaluate(
		send,
		`(() => {
			const ws = document.getElementById('workspace-page-manager');
			const activeFrame = [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
			return {
				workspace: activeFrame?.getAttribute('value') ?? null,
				groups: document.querySelectorAll('#workspace-page-manager .group').length,
				groupManagers: document.querySelectorAll('#workspace-page-manager .group-manager').length
			};
		})()`
	);
	out('open', state);
	ws.close();
}

async function mode2Directory() {
	const { ws, send } = await connect();
	await send('Runtime.enable');
	await evaluate(
		send,
		`localStorage.setItem('YM_LAYOUT_VUE_RENDER', '2'); location.reload(); true`
	);
	await sleep(3000);
	await openRecentProject(send);
	const snap = await evaluate(send, SNAPSHOT);
	const extra = await evaluate(
		send,
		`(() => {
			const ws = document.getElementById('workspace-page-manager');
			const inManager = [...ws.querySelectorAll('.group-manager > .page-frame')].length;
			const selectedNav = [...ws.querySelectorAll('.nav-item.selected')].length;
			const visiblePages = [...ws.querySelectorAll('.page-frame.visible')].map((p) => p.getAttribute('value'));
			const bodyHiddenHosts = [...document.body.children]
				.filter((el) => el.id && el.id.startsWith('layout-palette'))
				.map((el) => el.id);
			return { inManager, selectedNav, visiblePages, bodyHiddenHosts };
		})()`
	);
	out('snapshot', { snap, extra });
	ws.close();
}

async function roundtripScene() {
	const { ws, send } = await connect();
	await send('Runtime.enable');
	await waitActive(send, 'directory', 20000);
	await switchTo(send, 'scene');
	const sceneProbe = await evaluate(
		send,
		`(() => {
			const ws = document.getElementById('workspace-page-manager');
			const frame = [...ws.children].find((c) => c.getAttribute('value') === 'scene');
			const groups = frame ? frame.querySelectorAll('.group').length : 0;
			const canvases = frame ? frame.querySelectorAll('canvas').length : -1;
			const bodyIds = frame ? [...frame.querySelectorAll('[id$="-body"]')].map((b) => b.id) : [];
			return { groups, canvases, bodyIds };
		})()`
	);
	const identityBefore = await evaluate(
		send,
		`(() => {
			window.__smokeSceneFrames = [...document.querySelectorAll('#workspace-page-manager .group-manager > .page-frame')];
			return window.__smokeSceneFrames.map((f) => ({ value: f.getAttribute('value'), parent: f.parentNode?.className ?? null }));
		})()`
	);
	await switchTo(send, 'directory');
	const identityAfter = await evaluate(
		send,
		`window.__smokeSceneFrames.map((f) => ({
			value: f.getAttribute('value'),
			connected: f.isConnected,
			parent: f.parentNode ? f.parentNode.className : null,
			visible: f.classList.contains('visible')
		}))`
	);
	out('roundtrip', { sceneProbe, identityBefore, identityAfter });
	ws.close();
}

async function mode0Control() {
	const { ws, send } = await connect();
	await send('Runtime.enable');
	await evaluate(
		send,
		`localStorage.setItem('YM_LAYOUT_VUE_RENDER', '0'); location.reload(); true`
	);
	await sleep(3000);
	await openRecentProject(send);
	const snap = await evaluate(send, SNAPSHOT);
	const extra = await evaluate(
		send,
		`(() => {
			const ws = document.getElementById('workspace-page-manager');
			const inManager = [...ws.querySelectorAll('.group-manager > .page-frame')].length;
			const palettePages = document.querySelectorAll('#layout-content .page-frame').length;
			return { inManager, palettePages };
		})()`
	);
	out('snapshot', { snap, extra });
	ws.close();
}

// 真机拖拽探针（M4）：
// - dragend 统一派发到「存活 nav 集合」（结构折叠后原 item 可能已脱离可冒泡容器，见 2026-09-09 记录）
// - 场景自适应：优先同组重排；若活动工作区无多页签叶子，先跨组合并再造多页签叶，再同组重排
async function dragReorderPhase() {
	const { ws, send } = await connect();
	await send('Runtime.enable');
	await waitForActiveWorkspace(send, 20000);
	const probe = async (expression) => {
		const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
		if (r.exceptionDetails)
			throw new Error(
				'probe failed: ' +
					JSON.stringify(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
			);
		return r.result?.value;
	};
	const before = await probe(`(() => {
		const ws = document.getElementById('workspace-page-manager');
		const frame = [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
		const navs = frame ? [...frame.querySelectorAll('.nav-bar')] : [];
		return {
			workspace: frame?.getAttribute('value') ?? null,
			navs: navs.map((n) => [...n.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value')))
		};
	})()`);
	let drag;
	try {
		drag = await probe(`(() => {
		const ws = document.getElementById('workspace-page-manager');
		const frame = [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
		const navs = () => frame ? [...frame.querySelectorAll('.nav-bar')] : [];
		const values = (n) => [...n.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value'));
		const log = [];
		const cleanup = () => {
			for (const n of navs()) {
				n.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true }));
			}
		};
		const fire = (el, type, dt) => {
			const e = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt });
			el.dispatchEvent(e);
			log.push(type + ':' + (e.defaultPrevented ? 'prevented' : 'ok'));
		};
		const dt = new DataTransfer();
		cleanup(); // 清残留 dragging
		let multi = navs().find((n) => values(n).length >= 2);
		let merged = false;
		if (!multi && navs().length >= 2) {
			// 跨组合并：第一组唯一页签 append 进第二组，造出多页签叶
			const a = navs()[0];
			const b = navs()[1];
			const item = a.querySelector('.nav-item');
			if (!item) return { error: 'source leaf has no nav-item', navs: navs().map(values), log };
			log.push('cross:' + item.getAttribute('value') + '->' + values(b).join(','));
			fire(item, 'dragstart', dt);
			fire(b, 'dragenter', dt);
			fire(b, 'dragover', dt);
			fire(b, 'drop', dt);
			cleanup();
			merged = true;
			multi = navs().find((n) => values(n).length >= 2) ?? null;
		}
		if (!multi) return { error: 'no drag target after merge', navs: navs().map(values), log };
		// 同组重排：末位页签拖到首位页签前
		const list = values(multi);
		const lastItem = multi.querySelector('.nav-item[value="' + list[list.length - 1] + '"]');
		const firstItem = multi.querySelector('.nav-item[value="' + list[0] + '"]');
		if (!lastItem || !firstItem) return { error: 'merged leaf items missing', navs: navs().map(values), log };
		fire(lastItem, 'dragstart', dt);
		fire(firstItem, 'dragenter', dt);
		fire(firstItem, 'dragover', dt);
		fire(multi, 'drop', dt);
		cleanup();
		return { merged, log, dragValue: list[list.length - 1], anchor: list[0] };
	})()`);
	} catch (error) {
		drag = { error: String(error?.message ?? error) };
	}
	await sleep(500);
	if (drag.error) {
		out('drag', { before, drag });
		ws.close();
		return;
	}
	const after = await probe(`(() => {
		const ws = document.getElementById('workspace-page-manager');
		const frame = [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
		const navs = frame ? [...frame.querySelectorAll('.nav-bar')] : [];
		const root = frame ? frame.querySelector(':scope > .group, .group') : null;
		return {
			navs: navs.map((n) => [...n.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value'))),
			groups: frame ? frame.querySelectorAll('.group').length : 0,
			rootTabs: root && root.tabs ? [...root.tabs] : null,
			firstGroupIsLeaf: !!(root && root.manager),
			staleRegions: document.querySelectorAll('group-region').length
		};
	})()`);
	// 完整性探针：拖拽后切页签往返仍正常
	const integrity = await probe(`(() => {
		const ws = document.getElementById('workspace-page-manager');
		const frame = [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
		const navs = frame ? [...frame.querySelectorAll('.nav-bar')] : [];
		const leafNav = navs.find((n) => [...n.children].filter((c) => c.classList.contains('nav-item')).length >= 2) ?? navs[0];
		const items = [...leafNav.children].filter((c) => c.classList.contains('nav-item'));
		if (items.length < 2) return { skipped: true };
		const first = items[0].getAttribute('value');
		const second = items[1].getAttribute('value');
		const click = (v) => {
			const el = leafNav.querySelector('.nav-item[value="' + v + '"]');
			if (!el) return 'missing:' + v;
			el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
			el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
			return 'ok';
		};
		const r1 = click(second);
		const r2 = click(first);
		const mgr = leafNav.parentNode.querySelector('.group-manager');
		return {
			clicks: [r1, r2],
			selectedAfter: leafNav.querySelector('.nav-item.selected')?.getAttribute('value') ?? null,
			visible: mgr ? [...mgr.children].filter((c) => c.classList.contains('visible')).map((c) => c.getAttribute('value')) : null
		};
	})()`);
	out('drag', { before, drag, after, integrity });
	ws.close();
}

async function dragMode0() {
	await evaluateMode(0);
	await dragReorderPhase();
}

async function dragMode2() {
	await evaluateMode(2);
	await dragReorderPhase();
}

async function evaluateMode(mode) {
	const { ws, send } = await connect();
	await send('Runtime.enable');
	await evaluate(
		send,
		`localStorage.setItem('YM_LAYOUT_VUE_RENDER', '${mode}'); location.reload(); true`
	);
	await sleep(3000);
	await openRecentProject(send);
	ws.close();
}

async function dragHere() {
	await dragReorderPhase();
}

// 切到 scene 工作区后跑拖拽探针（directory 的持久化 scheme 可能为空时用）
async function dragScene() {
	const { ws, send } = await connect();
	await send('Runtime.enable');
	await evaluate(send, `document.getElementById('workspace-page-manager').switch('scene')`);
	await waitActive(send, 'scene', 30000);
	ws.close();
	await dragReorderPhase();
}

// region 边缘拖拽（M4 几何用例）：把叶子 A 的唯一页签拖到叶子 B 的 region 左缘，
// 期望产生左/右分割（结构性变更）并由 M4-2 rebuild 收敛。
async function dragRegionPhase() {
	const { ws, send } = await connect();
	await send('Runtime.enable');
	await waitForActiveWorkspace(send, 20000);
	const probe = async (expression) => {
		const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
		if (r.exceptionDetails)
			throw new Error(
				'probe failed: ' +
					JSON.stringify(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
			);
		return r.result?.value;
	};
	const before = await probe(`(() => {
		const ws = document.getElementById('workspace-page-manager');
		const frame = [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
		const navs = frame ? [...frame.querySelectorAll('.nav-bar')] : [];
		return {
			workspace: frame?.getAttribute('value') ?? null,
			navs: navs.map((n) => [...n.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value'))),
			groups: frame ? frame.querySelectorAll('.group').length : 0
		};
	})()`);
	let drag;
	try {
		drag = await probe(`(() => {
			const ws = document.getElementById('workspace-page-manager');
			const frame = [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
			const navs = [...frame.querySelectorAll('.nav-bar')];
			const values = (n) => [...n.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value'));
			const srcNav = navs.find((n) => values(n).length === 1);
			const dstNav = navs.find((n) => values(n).length >= 1 && n !== srcNav);
			if (!srcNav || !dstNav) return { error: 'need two leaves', navs: navs.map(values) };
			const item = srcNav.querySelector('.nav-item');
			const dt = new DataTransfer();
			const log = [];
			const fire = (el, type, init) => {
				const e = new DragEvent(type, Object.assign({ bubbles: true, cancelable: true, dataTransfer: dt }, init || {}));
				el.dispatchEvent(e);
				log.push(type + ':' + (e.defaultPrevented ? 'prevented' : 'ok'));
			};
			fire(item, 'dragstart');
			const region = dstNav.parentNode.querySelector('group-region');
			if (!region) return { error: 'no group-region (navDragstart 未注册)', navs: navs.map(values), log };
			const rect = region.getBoundingClientRect();
			const y = Math.round(rect.top + rect.height / 2);
			const xLeft = Math.round(rect.left + 2);
			fire(region, 'dragover', { clientX: xLeft, clientY: y });
			fire(region, 'drop', { clientX: xLeft, clientY: y });
			for (const n of [...frame.querySelectorAll('.nav-bar')]) {
				n.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true }));
			}
			return { log, dragged: item.getAttribute('value'), regionRect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height } };
		})()`);
	} catch (error) {
		drag = { error: String(error?.message ?? error) };
	}
	await sleep(1200);
	const after = await probe(`(() => {
		const ws = document.getElementById('workspace-page-manager');
		const frame = [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
		const navs = frame ? [...frame.querySelectorAll('.nav-bar')] : [];
		const root = frame ? frame.querySelector(':scope > .group, .group') : null;
		return {
			navs: navs.map((n) => [...n.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value'))),
			groups: frame ? frame.querySelectorAll('.group').length : 0,
			rootSplit: root && root.split ? root.split : null,
			rootTabs: root && root.tabs ? [...root.tabs] : null,
			staleRegions: document.querySelectorAll('group-region').length
		};
	})()`);
	out('region', { before, drag, after });
	ws.close();
}

async function dragRegion() {
	await evaluateMode(2);
	await dragRegionPhase();
}

// 布局树（叶子 = 带 tabs 的 .group）：给四方向 region 走查做前后对照
const LAYOUT_TREE = `(() => {
	const ws = document.getElementById('workspace-page-manager');
	const frame = ws && [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
	if (!frame) return { workspace: null };
	const root = [...frame.children].find((c) => c.classList.contains('group'));
	const navValues = (node) =>
		node && node.nav
			? [...node.nav.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value'))
			: null;
	const walk = (node, depth) => ({
		depth,
		split: node.split ?? null,
		end: typeof node.end === 'number' ? Number(node.end.toFixed(4)) : null,
		tabs: node.tabs ? [...node.tabs] : null,
		nav: navValues(node),
		children: [...node.children]
			.filter((c) => c.classList && c.classList.contains('group'))
			.map((c) => walk(c, depth + 1))
	});
	return {
		workspace: frame.getAttribute('value'),
		tree: root ? walk(root, 0) : null
	};
})()`;

// L1：region 四方向真机走查（left/right/top/bottom）。每个方向跑之前由外部脚本把 layout 还原，
// 因此本 phase 只做「一次拖拽 + 前后快照」——不做回滚，相邻方向的 no-op 判定也照实记录。
async function dragRegionEdge() {
	const edge = edgeArg;
	if (!['left', 'right', 'top', 'bottom'].includes(edge)) {
		throw new Error('edge must be one of left|right|top|bottom');
	}
	const { ws, send } = await connect();
	await send('Runtime.enable');
	const workspace = await waitForActiveWorkspace(send, 20000);
	const before = await evaluate(send, LAYOUT_TREE);
	const drag = await evaluate(
		send,
		`(() => {
			const edge = ${JSON.stringify(edge)};
			const pick = ${JSON.stringify(pickArg)};
			const ws = document.getElementById('workspace-page-manager');
			const frame = [...ws.children].find((c) => c.classList.contains('visible') && c.getAttribute('value') !== 'home');
			const leaves = [...frame.querySelectorAll('.group')].filter((g) => g.tabs && g.tabs.length > 0);
			const navs = [...frame.querySelectorAll('.nav-bar')];
			const values = (n) => [...n.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value'));
			// pick=a：源 = 最后一个叶子，目标 = 第一个叶子（两者在树里通常不相邻 ⇒ 结构性 drop 可观测）
			// pick=b：反过来
			const ordered = pick === 'b' ? [...leaves].reverse() : leaves;
			const srcLeaf = ordered[ordered.length - 1];
			const dstLeaf = ordered[0];
			const srcNav = srcLeaf?.nav;
			const dstNav = dstLeaf?.nav;
			if (!srcNav || !dstNav || srcNav === dstNav) {
				return { error: 'need two leaves', leaves: leaves.length, navs: navs.map(values) };
			}
			const item = srcNav.querySelector('.nav-item');
			const dt = new DataTransfer();
			const log = [];
			const fire = (el, type, init) => {
				const e = new DragEvent(type, Object.assign({ bubbles: true, cancelable: true, dataTransfer: dt }, init || {}));
				el.dispatchEvent(e);
				log.push(type + ':' + (e.defaultPrevented ? 'prevented' : 'ok'));
			};
			fire(item, 'dragstart');
			const region = dstNav.parentNode.querySelector('group-region');
			if (!region) return { error: 'no group-region (navDragstart 未注册)', log };
			const rect = region.getBoundingClientRect();
			const cx = Math.round(rect.left + rect.width / 2);
			const cy = Math.round(rect.top + rect.height / 2);
			const point = {
				left: { clientX: Math.round(rect.left + 2), clientY: cy },
				right: { clientX: Math.round(rect.right - 2), clientY: cy },
				top: { clientX: cx, clientY: Math.round(rect.top + 2) },
				bottom: { clientX: cx, clientY: Math.round(rect.bottom - 2) }
			}[edge];
			fire(region, 'dragover', point);
			fire(region, 'drop', point);
			for (const n of navs) n.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true }));
			return {
				edge,
				pick,
				log,
				dragged: item.getAttribute('value'),
				from: values(srcNav),
				to: values(dstNav),
				point,
				regionRect: { x: Math.round(rect.left), y: Math.round(rect.top), w: Math.round(rect.width), h: Math.round(rect.height) }
			};
		})()`
	);
	await sleep(1500);
	const after = await evaluate(send, LAYOUT_TREE);
	out('edge', { edge, pick: pickArg, workspace, before, drag, after });
	ws.close();
}

async function dragRegionAll() {
	await dragRegionEdge();
}

// S1：数据绑定型窗口逐窗冒烟。两条真实入口都支持：
//   ① `keys=F3,F6,…`：派发真实加速键（`registerWindowKeydown('menubar')` → 模块的 `open()`，
//      数据由模块自己加载——这是"有效数据"的唯一来源）
//   ② `ids=variable,enum,…`：调窗口管理器 `Window.open(id)`（只开窗、不加载数据，用于可达性核对）
// 行高固定 20px（YMTreeList 的 spacer 就是 `行数 * 20`），故绑定行数 = (上下 spacer 高)/20 + 渲染行数。
const PROBE_TREE = (idExpr) => `(() => {
	const frame = document.getElementById(${idExpr});
	if (!frame) return { found: false };
	const list = frame.querySelector('.tree-list');
	const top = list?.querySelector('.scroll-spacer.top');
	const bottom = list?.querySelector('.scroll-spacer.bottom');
	const rows = list ? [...list.querySelectorAll('.node-item')] : [];
	const h = (el) => (el ? Math.round(parseFloat(el.style.height) || 0) : 0);
	const bound = list ? Math.round((h(top) + h(bottom)) / 20) + rows.length : 0;
	return {
		found: true,
		open: frame.classList.contains('open'),
		hasTree: !!list,
		bound,
		rendered: rows.length,
		texts: rows.slice(0, 3).map((r) => (r.querySelector('.node-text')?.textContent ?? '').trim().slice(0, 18)),
		hasMarker: rows.some((r) => r.querySelector('.folder-mark'))
	};
})()`;

// S1 的交互链路：选中 → 折叠 → 展开 → F2 重命名（重命名框 = `.node-list-text-box-input`）。
// **每一步都是独立的一次 evaluate，等待放在 Node 侧**——页内 `await sleep()` 会被 Chromium
// 对隐藏窗口的定时器节流拖死（实测：`menu-windows interact=1` 因此卡到超时）。
const treeExpr = (idExpr, body) => `(() => {
	const frame = document.getElementById(${idExpr});
	if (!frame) return 'no-frame';
	const list = frame.querySelector('.tree-list');
	if (!list) return 'no-tree';
	${body}
})()`;

const ROW_COUNT = `return list.querySelectorAll('.node-item').length;`;
const SELECTED_COUNT = `return list.querySelectorAll('.node-item.selected').length;`;
const SELECT_FIRST = `const first = list.querySelector('.node-item');
	if (!first) return 'no-rows';
	const box = first.getBoundingClientRect();
	for (const type of ['pointerdown', 'pointerup']) {
		first.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0, clientX: box.left + 4, clientY: box.top + 4 }));
	}
	return 'selected';`;
// 折叠把手走的是 pointerdown（见 tree-api 的 pointerdown 分支），不是 click
const TOGGLE_FIRST_MARKER = `const marker = list.querySelector('.node-item .folder-mark');
	if (!marker) return 'no-marker';
	for (const type of ['pointerdown', 'pointerup']) {
		marker.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0 }));
	}
	return 'toggled';`;
const PRESS_F2 = `list.dispatchEvent(new KeyboardEvent('keydown', { code: 'F2', key: 'F2', bubbles: true, cancelable: true }));
	return 'f2';`;

async function interactTree(send, idExpr) {
	const step = (body) => evaluate(send, treeExpr(idExpr, body));
	const before = await step('return list.querySelectorAll(".node-item").length;');
	const select = await step(SELECT_FIRST);
	await sleep(500);
	const selected = await step(SELECTED_COUNT);
	const hasMarker = await step('return !!list.querySelector(".node-item .folder-mark");');
	let folded = null;
	let unfolded = null;
	if (hasMarker === true) {
		const first = await step(TOGGLE_FIRST_MARKER);
		await sleep(600);
		folded = await step(ROW_COUNT);
		const second = await step(TOGGLE_FIRST_MARKER);
		await sleep(600);
		unfolded = await step(ROW_COUNT);
		if (first !== 'toggled' || second !== 'toggled') folded = `marker:${first}/${second}`;
	}
	await step(PRESS_F2);
	await sleep(600);
	const renameInput = await step('return !!frame.querySelector(".node-list-text-box-input");');
	const after = await step(ROW_COUNT);
	return { before, select, selected, folded, unfolded, renameInput, after };
}

async function treeWindows() {
	const keysArg = process.argv.slice(3).find((a) => a.startsWith('keys=')) ?? '';
	const idsArg = process.argv.slice(3).find((a) => a.startsWith('ids=')) ?? '';
	const keys = keysArg
		.slice(5)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	const ids = idsArg
		.slice(4)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	if (keys.length === 0 && ids.length === 0) {
		throw new Error('usage: node scripts/smoke-layout.mjs tree-windows keys=F3,F6 | ids=a,b');
	}
	const { ws, send } = await connect();
	await send('Runtime.enable');
	const results = [];
	for (const key of keys) {
		const before = await evaluate(
			send,
			`[...document.querySelectorAll('.window-frame.open')].map((f) => f.id)`
		);
		await evaluate(
			send,
			`(() => {
				const event = new KeyboardEvent('keydown', { code: ${JSON.stringify(key)}, key: ${JSON.stringify(key)}, bubbles: true, cancelable: true });
				window.dispatchEvent(event);
				return true;
			})()`
		);
		await sleep(2500);
		const opened = await evaluate(
			send,
			`[...document.querySelectorAll('.window-frame.open')].map((f) => f.id).filter((id) => !${JSON.stringify(before)}.includes(id))`
		);
		const id = opened[0] ?? null;
		// oxlint-disable-next-line no-await-in-loop
		const probe = id ? await evaluate(send, PROBE_TREE(JSON.stringify(id))) : null;
		const chain =
			interact && id !== null && probe?.hasTree
				? // oxlint-disable-next-line no-await-in-loop
					await interactTree(send, JSON.stringify(id))
				: null;
		results.push({ key, before, opened, id, probe, chain });
		if (id !== null) {
			await evaluate(send, `window.Window && window.Window.close && window.Window.close(${JSON.stringify(id)})`);
			await sleep(600);
		}
	}
	for (const id of ids) {
		const open = await evaluate(
			send,
			`(() => {
				try {
					if (!('Window' in window) || typeof window.Window.open !== 'function') return 'no-api';
					window.Window.open(${JSON.stringify(id)});
					return 'called';
				} catch (error) {
					return 'throw: ' + String(error && error.message);
				}
			})()`
		);
		await sleep(900);
		// oxlint-disable-next-line no-await-in-loop
		const probe = await evaluate(send, PROBE_TREE(JSON.stringify(id)));
		results.push({ id, open, probe });
	}
	out('tree-windows', { results });
	ws.close();
}

// S1 续：没有加速键的数据绑定窗口（过渡 / 队伍…）走**真实菜单路径**——点「窗口」菜单 →
// 点弹层里的对应条目（按 0 基下标定位，跑完打印弹层标签供人工核对）。
async function menuWindows() {
	const idxArg = process.argv.slice(3).find((a) => a.startsWith('index=')) ?? '';
	const indices = idxArg
		.slice(6)
		.split(',')
		.map((s) => Number(s.trim()))
		.filter((n) => Number.isInteger(n));
	if (indices.length === 0) throw new Error('usage: node scripts/smoke-layout.mjs menu-windows index=5,6');
	const { ws, send } = await connect();
	await send('Runtime.enable');
	const results = [];
	for (const index of indices) {
		const labels = await evaluate(
			send,
			`(() => {
				const trigger = document.getElementById('menu-window');
				trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, cancelable: true }));
				const popup = document.querySelector('.menu-list, .menu, .popup');
				return popup ? [...popup.children].map((li) => (li.textContent || '').trim()) : ['<no-popup>'];
			})()`
		);
		const before = await evaluate(
			send,
			`[...document.querySelectorAll('.window-frame.open')].map((f) => f.id)`
		);
		const clicked = await evaluate(
			send,
			`(() => {
				const popup = document.querySelector('.menu-list, .menu, .popup');
				const li = popup?.children[${index}];
				if (!li) return 'no-item';
				li.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, cancelable: true }));
				li.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, cancelable: true }));
				li.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
				return (li.textContent || '').trim();
			})()`
		);
		await sleep(2200);
		const opened = await evaluate(
			send,
			`[...document.querySelectorAll('.window-frame.open')].map((f) => f.id).filter((id) => !${JSON.stringify(before)}.includes(id))`
		);
		const id = opened[0] ?? null;
		// oxlint-disable-next-line no-await-in-loop
		const probe = id ? await evaluate(send, PROBE_TREE(JSON.stringify(id))) : null;
		const chain =
			interact && id !== null && probe?.hasTree
				? // oxlint-disable-next-line no-await-in-loop
					await interactTree(send, JSON.stringify(id))
				: null;
		results.push({ index, labels, clicked, opened, id, probe, chain });
		await evaluate(send, `document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))`);
		await sleep(400);
		if (id !== null) {
			await evaluate(send, `window.Window && window.Window.close && window.Window.close(${JSON.stringify(id)})`);
			await sleep(600);
		}
	}
	out('menu-windows', { results });
	ws.close();
}

const phases = {
	debug,
	'open-project': openProject,
	'mode2-directory': mode2Directory,
	'roundtrip-scene': roundtripScene,
	'mode0-control': mode0Control,
	'drag-mode0': dragMode0,
	'drag-mode2': dragMode2,
	'drag-here': dragHere,
	'drag-scene': dragScene,
	'drag-region': dragRegion,
	'drag-region-edge': dragRegionEdge,
	'drag-region-all': dragRegionAll,
	'tree-windows': treeWindows,
	'menu-windows': menuWindows
};
await runPhase(phases[phase]);
