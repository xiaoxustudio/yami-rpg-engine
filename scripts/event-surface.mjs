#!/usr/bin/env node
// 窗口事件面报表（E1 的度量来源）：把 `window.addEventListener / dispatchEvent` 的使用面
// 汇总成可复现的数字——事件名清单、add/remove 计数、自定义事件、死事件、内联匿名监听。
//
// 用法：node scripts/event-surface.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NATIVE_EVENTS } from './lib/scan.mjs';

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
 * 逐条取出 `window.addEventListener(...)` 的整段调用文本（按括号配对），
 * 判断该监听是否是**内联匿名**、以及是否带 `{ once: true }`（浏览器会在首次触发后自动摘除，
 * 因此不算"没有 remove"的生命周期风险——E1 早期度量把它们误记为风险点）。
 */
function scanAddListenerCalls(rawSrc) {
	// 先去掉注释：注释与字符串里也会出现 `window.addEventListener(`，按原文扫描会把整段
	// 无关代码当成一次调用（E1 早期版本就因此把"内联匿名监听"数高估了）。
	const src = rawSrc.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
	const calls = [];
	const marker = 'window.addEventListener(';
	let index = src.indexOf(marker);
	while (index !== -1) {
		let depth = 0;
		let i = index + marker.length - 1;
		let text = '';
		for (; i < src.length; i++) {
			const ch = src[i];
			text += ch;
			if (ch === '(') depth++;
			else if (ch === ')') {
				depth--;
				if (depth === 0) break;
			}
		}
		calls.push({
			once: /\bonce\s*:\s*true\b/.test(text),
			// text 从调用自身的 `(` 开始 ⇒ 实参要从下标 1 起算
			inline: /^\s*['"][\w:-]+['"]\s*,\s*(?:\(|function\s*\()/.test(text.slice(1))
		});
		index = src.indexOf(marker, i);
	}
	return calls;
}

function main() {
	const files = collectFiles();
	const listeners = new Map(); // name -> Set<rel>
	const dispatchers = new Map();
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
		for (const m of src.matchAll(/window\.addEventListener\(\s*['"]([\w:-]+)['"]/g))
			add(listeners, m[1], rel);
		// 派发只统计**落在 window 上**的两种写法：
		//   ① `window.dispatchEvent(new Event('x'))`
		//   ② `const e = new Event('x'); …; window.dispatchEvent(e)`（变量形式）
		for (const m of src.matchAll(
			/window\.dispatchEvent\(\s*new\s+\w*Event\(\s*['"]([\w:-]+)['"]/g
		)) {
			add(dispatchers, m[1], rel);
		}
		const constructed = new Map();
		for (const m of src.matchAll(
			/(?:const|let|var)\s+([\w$]+)\s*=\s*new\s+\w*Event\(\s*['"]([\w:-]+)['"]/g
		)) {
			constructed.set(m[1], m[2]);
		}
		for (const m of src.matchAll(/window\.dispatchEvent\(\s*([\w$]+)\s*\)/g)) {
			const name = constructed.get(m[1]);
			if (name !== undefined) add(dispatchers, name, rel);
		}
		// P4b/E1：自定义事件在 2026-09-12 之后走**类型化通道** `emitCustom` / `onCustom`
		// （`events/custom-events.ts`：名册 + 载荷形状集中成一张表，内部仍是 window 事件）。
		// 这两行只是让本报表认得它们——否则整批已迁移的事件会被误判成"派发无监听 / 监听无派发"。
		for (const m of src.matchAll(/\bemitCustom\(\s*['"]([\w:-]+)['"]/g))
			add(dispatchers, m[1], rel);
		for (const m of src.matchAll(/\bonCustom\(\s*['"]([\w:-]+)['"]/g))
			add(listeners, m[1], rel);
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
	console.log(
		`  替代品使用：mitt( ${mittUse} 处、useEventListener( ${useEventListener} 处、window.on( ${windowOn} 处`
	);
}

main();
