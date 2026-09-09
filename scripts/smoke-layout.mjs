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

const withTimeout = (p, ms, label) =>
	Promise.race([
		p,
		new Promise((_, rej) => setTimeout(() => rej(new Error('timeout: ' + label)), ms))
	]);

const waitForSelector = async (send, selector, ms = 15000) => {
	await withTimeout(
		evaluate(
			send,
			`new Promise((r) => {
				if (document.querySelector(${JSON.stringify(selector)})) return r(true);
				let n = 0;
				const iv = setInterval(() => {
					if (document.querySelector(${JSON.stringify(selector)})) { clearInterval(iv); r(true); }
					else if (++n > ${Math.ceil(ms / 100)}) { clearInterval(iv); r(false); }
				}, 100);
			})`
		),
		ms + 5000,
		'wait ' + selector
	);
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
	const activeFrame = [...ws.children].find((c) => c.classList.contains('visible'));
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
	await withTimeout(
		evaluate(
			send,
			`new Promise((r) => {
				let n = 0;
				const check = () => {
					const ws = document.getElementById('workspace-page-manager');
					const f = ws && [...ws.children].find((c) => c.classList.contains('visible'));
					if (f?.getAttribute('value') === ${JSON.stringify(workspace)}) return r(true);
					if (++n > ${Math.ceil(ms / 100)}) return r(false);
					setTimeout(check, 100);
				};
				check();
			})`
		),
		ms + 5000,
		'active ' + workspace
	);
};

async function openRecentProject(send) {
	await waitForSelector(send, '#home-recent-list .home-recent-item', 20000);
	const clicked = await evaluate(
		send,
		`(() => {
			const item = [...document.querySelectorAll('#home-recent-list .home-recent-item')].find(
				(el) => /game\\.yamirpg/.test(el.textContent || '')
			);
			if (!item) return false;
			item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
			return true;
		})()`
	);
	if (!clicked) throw new Error('no recent project item found');
	await waitActive(send, 'directory', 25000);
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
			const activeFrame = [...ws.children].find((c) => c.classList.contains('visible'));
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

async function dragReorderPhase() {
	const { ws, send } = await connect();
	await send('Runtime.enable');
	await waitActive(send, 'directory', 20000);
	const before = await evaluate(
		send,
		`(() => {
			const ws = document.getElementById('workspace-page-manager');
			const frame = [...ws.children].find((c) => c.getAttribute('value') === 'directory');
			const navs = [...frame.querySelectorAll('.nav-bar')];
			return navs.map((n) => [...n.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value')));
		})()`
	);
	const drag = await evaluate(
		send,
		`(() => {
			const ws = document.getElementById('workspace-page-manager');
			const frame = [...ws.children].find((c) => c.getAttribute('value') === 'directory');
			const navs = [...frame.querySelectorAll('.nav-bar')];
			const values = (n) => [...n.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value'));
			const multi = navs.find((n) => values(n).length >= 2);
			let item, trigger, dropTarget;
			if (multi) {
				// 同组重排：拖最后一个页签到第一个页签之前
				const list = values(multi);
				item = multi.querySelector('.nav-item[value="' + list[list.length - 1] + '"]');
				trigger = multi.querySelector('.nav-item[value="' + list[0] + '"]');
				dropTarget = multi;
			} else if (navs.length >= 2) {
				// 跨组搬入：把第一个组唯一页签 append 到第二个组 nav
				const a = navs[0];
				const b = navs[1];
				item = a.querySelector('.nav-item');
				trigger = b;
				dropTarget = b;
			} else {
				return { error: 'no drag target', values: navs.map(values) };
			}
			const log = [];
			const fire = (el, type, dt) => {
				const e = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt });
				el.dispatchEvent(e);
				log.push(type + ':' + (e.defaultPrevented ? 'prevented' : 'ok'));
			};
			const dt = new DataTransfer();
			fire(item, 'dragstart', dt);
			fire(trigger, 'dragenter', dt);
			fire(trigger, 'dragover', dt);
			fire(dropTarget, 'drop', dt);
			fire(item, 'dragend', dt);
			return { log, item: item.getAttribute('value') };
		})()`
	);
	await sleep(400);
	const after = await evaluate(
		send,
		`(() => {
			const ws = document.getElementById('workspace-page-manager');
			const frame = [...ws.children].find((c) => c.getAttribute('value') === 'directory');
			const navs = [...frame.querySelectorAll('.nav-bar')];
			const root = frame.querySelector(':scope > .group, .group');
			return {
				navs: navs.map((n) => [...n.children].filter((c) => c.classList.contains('nav-item')).map((c) => c.getAttribute('value'))),
				groups: frame.querySelectorAll('.group').length,
				rootTabs: root && root.tabs ? [...root.tabs] : null,
				firstGroupIsLeaf: !!(root && root.manager)
			};
		})()`
	);
	// 完整性探针：拖拽后切页签往返仍正常（检测 Vue/命令式 DOM 是否失配）
	const integrity = await evaluate(
		send,
		`(() => {
			const ws = document.getElementById('workspace-page-manager');
			const frame = [...ws.children].find((c) => c.getAttribute('value') === 'directory');
			const navs = [...frame.querySelectorAll('.nav-bar')];
			const leafNav = navs.find((n) => [...n.children].filter((c) => c.classList.contains('nav-item')).length >= 2) ?? navs[0];
			const items = [...leafNav.children].filter((c) => c.classList.contains('nav-item'));
			const first = items[0].getAttribute('value');
			const second = items[1] ? items[1].getAttribute('value') : null;
			const click = (v) => {
				const el = leafNav.querySelector('.nav-item[value="' + v + '"]');
				if (!el) return 'missing:' + v;
				el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
				el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
				return 'ok';
			};
			const r1 = click(second ?? first);
			const r2 = click(first);
			const mgr = leafNav.parentNode.querySelector('.group-manager');
			return {
				clicks: [r1, r2],
				selectedAfter: leafNav.querySelector('.nav-item.selected')?.getAttribute('value') ?? null,
				visible: mgr ? [...mgr.children].filter((c) => c.classList.contains('visible')).map((c) => c.getAttribute('value')) : null
			};
		})()`
	);
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

const phases = {
	debug,
	'open-project': openProject,
	'mode2-directory': mode2Directory,
	'roundtrip-scene': roundtripScene,
	'mode0-control': mode0Control,
	'drag-mode0': dragMode0,
	'drag-mode2': dragMode2,
	'drag-here': dragHere
};
await runPhase(phases[phase]);
