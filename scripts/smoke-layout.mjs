// F.5 / E.3 / M4 布局真机冒烟驱动（CDP over WebSocket，Node >=22 全局 WebSocket）。
// 前提：editor 已构建（pnpm -F @yami/editor build:all）并以如下方式启动：
//   electron --remote-debugging-port=9223 <packages/editor>（home 需有最近项目 game.yamirpg 可打开）
// 用法: node scripts/smoke-layout.mjs <phase> [port]
// phase: debug | open-project | mode2-directory | roundtrip-scene | mode0-control
//        | drag-mode0 | drag-mode2
import { writeFileSync } from 'node:fs';

const port = Number(process.argv[3] || 9223);
const phase = process.argv[2];
if (!phase) {
	console.error('usage: node scripts/smoke-layout.mjs <phase> [port]');
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
			pending.set(id, { resolve, reject });
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
		process.exitCode = 1;
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
			readyState: document.readyState
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

const phases = {
	debug,
	'open-project': openProject,
	'mode2-directory': mode2Directory,
	'roundtrip-scene': roundtripScene,
	'mode0-control': mode0Control,
	'drag-mode0': dragMode0,
	'drag-mode2': dragMode2,
	'drag-here': dragHere,
	'drag-scene': dragScene
};
await runPhase(phases[phase]);
