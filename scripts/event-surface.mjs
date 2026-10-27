#!/usr/bin/env node
// 事件面报表：把 `window.addEventListener / dispatchEvent` 与**元素级自定义事件**的使用面
// 汇总成可复现的数字——事件名清单、add/remove 计数、自定义事件、死事件、内联匿名监听。
//
// 口径由 `scripts/lib/scan.mjs` 单一持有（`windowEventSurfaceOf` / `scanAddListenerCalls` /
// `ELEMENT_EVENT_RE`），台账的 `window-custom-events` / `unremovable-listeners` 轴与之同源。
//
// 用法：node scripts/event-surface.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	NATIVE_EVENTS,
	ELEMENT_EVENT_RE,
	scanAddListenerCalls,
	scriptOnly,
	stripComments,
	windowEventSurfaceOf
} from './lib/scan.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = [join('packages', 'editor', 'src'), join('packages', 'ui-kit', 'src')];
const EXCLUDE_RE = /(?:\.spec\.ts$|\.d\.ts$|\/__tests__\/|\.demo\.vue$)/;
// 浏览器原生事件（其余视为应用自定义事件）—— 口径**只维护一份**：`scripts/lib/scan.mjs`。
// 2026-09-21 之前本文件自带一份逐字相同的 `NATIVE` 集合；两份列表一分叉，
// 报表的「自定义事件」数字就会与门禁对不上。

function collectFiles() {
	const files = [];
	for (const dir of SCAN_DIRS) {
		const base = join(ROOT, dir);
		let entries = [];
		try {
			entries = readdirSync(base);
		} catch {
			continue;
		}
		const walk = (p) => {
			for (const entry of entries.length === 0 ? readdirSync(p) : readdirSync(p)) {
				const full = join(p, entry);
				if (statSync(full).isDirectory()) {
					if (entry !== 'node_modules') walk(full);
				} else if (/\.(ts|vue)$/.test(entry)) {
					const rel = relative(ROOT, full).replace(/\\/g, '/');
					if (!EXCLUDE_RE.test(rel)) files.push({ full, rel });
				}
			}
		};
		walk(base);
	}
	return files;
}

/**
 * 口径全部 import 自 `scripts/lib/scan.mjs`：
 *   · `scanAddListenerCalls` —— 匿名/具名、once/非 once 的判定（台账 `unremovable-listeners` 同源）
 *   · `windowEventSurfaceOf` —— window 上的派发/监听集合（台账 `window-custom-events` 同源）
 *   · `ELEMENT_EVENT_RE` + `scriptOnly` —— 元素级自定义事件（事件名在字符串里，不能用 codeOnly）
 * 本文件**不再持有第二份正则**：历史教训是同一概念写两份实现，分叉之后没有任何东西会发现。
 */

function main() {
	const files = collectFiles();
	const listeners = new Map(); // name -> Set<rel>
	const dispatchers = new Map();
	const elementEvents = new Map(); // 元素级自定义事件：name -> 处数
	let adds = 0;
	let removes = 0;
	let inlineAnonymous = 0;
	const inlineFiles = [];
	const vueUnpaired = [];
	let mittUse = 0;
	let useEventListener = 0;
	let windowOn = 0;

	const add = (map, name, rel) => {
		if (!map.has(name)) map.set(name, new Set());
		map.get(name).add(rel);
	};

	for (const { full, rel } of files) {
		const src = readFileSync(full, 'utf8');
		const addMatches = src.match(/window\.addEventListener\(/g) ?? [];
		const remMatches = src.match(/window\.removeEventListener\(/g) ?? [];
		adds += addMatches.length;
		removes += remMatches.length;
		// window 上的派发/监听集合：口径与台账 `window-custom-events` 同源（scan.mjs）。
		// 它认得三种派发形式（直接 new、变量形式、emitCustom 类型化包装）——漏一种，
		// 整批已迁移的事件就会被误判成"派发无监听 / 监听无派发"。
		const surface = windowEventSurfaceOf(src);
		for (const name of surface.emits) add(dispatchers, name, rel);
		for (const name of surface.listens) add(listeners, name, rel);
		// 元素级自定义事件：name 在字符串里 ⇒ 用 scriptOnly + stripComments（不能 codeOnly）。
		for (const m of stripComments(scriptOnly(src)).matchAll(ELEMENT_EVENT_RE)) {
			if (!NATIVE_EVENTS.has(m[1])) {
				elementEvents.set(m[1], (elementEvents.get(m[1]) ?? 0) + 1);
			}
		}
		const calls = scanAddListenerCalls(src);
		// 内联匿名 + 非 once 才是真正的"无法 remove"风险（once 由浏览器自动摘除）
		const inlineRisk = calls.filter((c) => c.inline && !c.once).length;
		inlineAnonymous += inlineRisk;
		if (inlineRisk > 0) inlineFiles.push([rel, inlineRisk]);
		const onceCount = scanAddListenerCalls(src).filter((c) => c.once).length;
		// `{ once: true }` 的监听由浏览器在首次触发后自动摘除 ⇒ 不计入"add 有 remove 无"风险
		if (rel.endsWith('.vue') && addMatches.length - onceCount > 0 && remMatches.length === 0) {
			vueUnpaired.push([rel, addMatches.length - onceCount]);
		}
		mittUse += (src.match(/\bmitt\(/g) ?? []).length;
		useEventListener += (src.match(/useEventListener\(/g) ?? []).length;
		windowOn += (src.match(/\bwindow\.on\(/g) ?? []).length;
	}

	const names = [...new Set([...listeners.keys(), ...dispatchers.keys()])].sort((a, b) =>
		a.localeCompare(b)
	);
	const custom = names.filter((n) => !NATIVE_EVENTS.has(n));
	// 只对**自定义**事件判定"单侧"（原生事件本就由浏览器派发或在别处派发，不构成问题）
	const deadCustom = custom.filter(
		(n) => (listeners.get(n)?.size ?? 0) === 0 || (dispatchers.get(n)?.size ?? 0) === 0
	);

	console.log('窗口事件面报表（window.addEventListener / dispatchEvent）');
	console.log(`  扫描文件：${files.length}；add ${adds} 处 / remove ${removes} 处`);
	console.log(`  事件名：${names.length} 个（其中自定义 ${custom.length} 个）`);
	console.log(`  自定义事件：${custom.join(', ')}`);
	console.log(
		`  自定义事件中"单侧"的（派发无监听 / 监听无派发）：${deadCustom.length > 0 ? deadCustom.join(', ') : '(无)'}`
	);
	for (const name of deadCustom) {
		const l = listeners.get(name)?.size ?? 0;
		const d = dispatchers.get(name)?.size ?? 0;
		console.log(`    - ${name}：监听 ${l} 文件 / 构造派发 ${d} 文件`);
	}
	console.log(
		`  内联匿名监听（无法 remove）：${inlineAnonymous} 处 / ${inlineFiles.length} 文件`
	);
	for (const [rel, n] of inlineFiles.sort((a, b) => b[1] - a[1]).slice(0, 5))
		console.log(`    - ${n} 处 ${rel}`);
	console.log(`  .vue 内 add 有、remove 无：${vueUnpaired.length} 个文件`);
	for (const [rel, n] of vueUnpaired) console.log(`    - ${n} 处 add ${rel}`);
	const elementRanked = [...elementEvents.entries()].sort((a, b) => b[1] - a[1]);
	const elementTotal = elementRanked.reduce((sum, [, n]) => sum + n, 0);
	console.log(
		`  元素级自定义事件构造：${elementTotal} 处 / ${elementRanked.length} 个名字（应改 defineEmits / v-model）`
	);
	for (const [name, n] of elementRanked.slice(0, 8)) console.log(`    - ${name}: ${n} 处`);
	console.log(
		`  替代品使用：mitt( ${mittUse} 处、useEventListener( ${useEventListener} 处、window.on( ${windowOn} 处`
	);
}

main();
