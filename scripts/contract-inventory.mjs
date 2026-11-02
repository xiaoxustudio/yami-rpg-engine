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
			if (name === 'node_modules') continue;
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
		// 两条口径都必须宽一点，否则漏报（都实测踩过）：
		// ① 注册表名不能写死成 composableEls —— `titleEls.get('export-apk')` 也是消费方
		//    （menu-bar.ts 就这么读窗口里的元素；只认 composableEls 时这些窗口被误判成 clean）；
		// ② 链式写法常被格式化成 `<reg>\n\t.get('x')`，`\s*` 是必须的 ——
		//    `useSetAnimationComponentCommandSchema` 就是这样漏掉的，迁移后单测才红。
		if (new RegExp(`\\w*Els\\s*\\.\\s*get\\(\\s*${`'${id}'`}`).test(text))
			consumers.push(`${rel}:get`);
		if (new RegExp(`registryElement[\\s\\S]{0,120}?${`'${id}'`}`).test(text)) {
			consumers.push(`${rel}:registryElement`);
		}
		// `requestFocus(id)` 不算消费方：vFocus 按 DOM id 匹配，不读注册表
	}
	return consumers;
}

/**
 * 「被 spec 结构性守着」的命令窗口：某个 spec 既 import 了 `<Name>.vue`，又读
 * `composableEls`，就说明它断言的是「按 id 驱动控件」的契约（典型是
 * `command-write-loop-registry.spec`：schema 的 write 循环按 `${name}-${domId}` 拼 id）。
 * 这类窗口即使源码里没有字面量消费方，也不能改成局部 ref —— 实测迁移后 3 个用例全红。
 */
function specGuardedWindows() {
	const flagged = new Set();
	for (const [file, text] of sources) {
		const rel = relative(SRC, file);
		if (!rel.endsWith('.spec.ts') || !text.includes('composableEls')) continue;
		for (const match of text.matchAll(
			/import\s+(\w+)\s+from\s+'@app\/components\/commands\/\w+\.vue';/g
		)) {
			flagged.add(match[1].charAt(0).toLowerCase() + match[1].slice(1));
		}
	}
	return flagged;
}

const dynamicWindows = specGuardedWindows();
const report = windows
	.sort((a, b) => a.file.localeCompare(b.file))
	.map((window) => {
		const base =
			window.file
				.split(/[\\/]/)
				.pop()
				?.replace(/\.vue$/, '') ?? '';
		const windowName = base.charAt(0).toLowerCase() + base.slice(1);
		const schemaDynamic = dynamicWindows.has(windowName);
		return {
			file: window.file,
			schemaDynamic,
			ids: window.ids.map((id) => ({
				id,
				consumers: consumersOf(id, window.file),
				schemaDynamic
			}))
		};
	});

const isBlocked = (window) =>
	window.schemaDynamic || window.ids.some((entry) => entry.consumers.length > 0);

if (AS_JSON) {
	console.log(JSON.stringify({ windows: report }, null, 2));
} else {
	const totalWindows = report.length;
	const totalIds = report.reduce((sum, window) => sum + window.ids.length, 0);
	const blocked = report.filter(isBlocked);
	console.log(`仍用 registryRef 的窗口：${totalWindows} 个，共 ${totalIds} 个控件 id`);
	console.log(
		`其中「有全局消费方 / schema 动态读」的窗口：${blocked.length} 个（需先接桥或改测试）\n`
	);
	for (const window of report.slice(0, 15)) {
		const flaggedIds = window.ids.filter((entry) => entry.consumers.length > 0);
		const mark = flaggedIds.length > 0 || window.schemaDynamic ? '⚠' : '✓';
		const note = window.schemaDynamic
			? `，schema 有动态读`
			: flaggedIds.length
				? `，${flaggedIds.length} 个有全局消费`
				: '';
		console.log(`${mark} ${window.file}（${window.ids.length} 个 id${note}）`);
		for (const entry of flaggedIds.slice(0, 3)) {
			console.log(`    ${entry.id} ← ${entry.consumers.join(' / ')}`);
		}
	}
}
