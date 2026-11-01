#!/usr/bin/env node
/**
 * 元素契约迁移的「批次清单」：哪些窗口还挂着 registryRef、这些 id 又被谁从全局读。
 *
 * 为什么需要它：迁移的难点不在 `:ref="registryRef(...)"` 本身，而在**这些 id 还有没有
 * 全局消费方**。真正会拦住迁移的只有一种：`composableEls.get('<id>')` /
 * `registryElement(…, '<id>')` 这类**直接按 id 读注册表**的代码。
 *
 * 特别注意 `requestFocus('<id>')` **不是**阻塞项：它把请求写进 `focusTarget`，
 * 由 `vFocus` 指令在元素上按 **DOM id** 匹配（`directives/focus.ts`），全程不碰注册表。
 * 早期把它算成消费方，会把「被卡住」的窗口数虚增一大截。
 *
 * ⚠️ 口径边界（别把「无消费方」当成「可以无脑改」）：本脚本只认**字面量 id**。
 * 动态读取（`els.get(windowId)`、遍历注册表、`windowShellEls` 这类壳注册表）它看不见 ——
 * 所以每个窗口仍要人工确认三件事：
 *   1. 根元素是否已被 `WindowFrame.vue` 自动登记进 `windowShellEls`（那样再写一次是冗余）；
 *   2. 窗口是否靠「壳注册表」被 `Window.open/close/activate` 找到（`windowShellEls` 是查找表）；
 *   3. 该窗口有没有被命令 schema 按 `getElementById` 之外的方式驱动。
 * 用法：
 *   node scripts/contract-inventory.mjs            # 按窗口列出 id 与消费方类型
 *   node scripts/contract-inventory.mjs --json     # 机器可读
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'packages/editor/src');
const AS_JSON = process.argv.includes('--json');

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			if (name === '__tests__' || name === 'node_modules') continue;
			walk(full, out);
		} else if (/\.(ts|vue)$/.test(name)) {
			out.push(full);
		}
	}
	return out;
}

const files = walk(SRC);
const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]));

/** 窗口 → 仍挂在 registryRef 上的 id 列表。 */
const windows = [];
for (const [file, text] of sources) {
	if (!text.includes('registryRef(')) continue;
	const ids = new Set();
	for (const match of text.matchAll(/registryRef\(\s*[\w$.]+,\s*'([^']+)'/g)) ids.add(match[1]);
	if (ids.size === 0) continue;
	windows.push({ file: relative(SRC, file), ids: [...ids] });
}

/** 某个 id 的全局消费方（排除定义它的那个文件）。 */
function consumersOf(id, ownerFile) {
	const consumers = [];
	const quoted = `'${id}'`;
	for (const [file, text] of sources) {
		const rel = relative(SRC, file);
		if (rel === ownerFile || rel.endsWith('.spec.ts') || text.includes(quoted) === false)
			continue;
		if (new RegExp(`composableEls\\.get\\(\\s*${`'${id}'`}`).test(text))
			consumers.push(`${rel}:get`);
		if (new RegExp(`registryElement[\\s\\S]{0,120}?${`'${id}'`}`).test(text)) {
			consumers.push(`${rel}:registryElement`);
		}
		// `requestFocus(id)` 不算消费方：vFocus 按 DOM id 匹配，不读注册表
	}
	return consumers;
}

const report = windows
	.sort((a, b) => a.file.localeCompare(b.file))
	.map((window) => ({
		file: window.file,
		ids: window.ids.map((id) => ({ id, consumers: consumersOf(id, window.file) }))
	}));

if (AS_JSON) {
	console.log(JSON.stringify({ windows: report }, null, 2));
} else {
	const totalWindows = report.length;
	const totalIds = report.reduce((sum, window) => sum + window.ids.length, 0);
	const blocked = report.filter((window) =>
		window.ids.some((entry) => entry.consumers.length > 0)
	);
	console.log(`仍用 registryRef 的窗口：${totalWindows} 个，共 ${totalIds} 个控件 id`);
	console.log(`其中存在「全局消费方」的窗口：${blocked.length} 个（需先接桥再迁 ref）\n`);
	for (const window of report.slice(0, 15)) {
		const flags = window.ids.filter((entry) => entry.consumers.length > 0);
		const mark = flags.length > 0 ? '⚠' : '✓';
		console.log(
			`${mark} ${window.file}（${window.ids.length} 个 id${flags.length ? `，${flags.length} 个有全局消费` : ''}）`
		);
		for (const entry of flags.slice(0, 3))
			console.log(`    ${entry.id} ← ${entry.consumers.join(' / ')}`);
	}
}
