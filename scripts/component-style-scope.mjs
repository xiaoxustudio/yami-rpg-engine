#!/usr/bin/env node
// 组件样式作用域门禁（editor 侧）：组件 `<style>` 块是**全局**的，因此只准写 `#id` 选择器。
//
// ## 为什么要这条门禁
//
// `packages/editor` 的 255 个 `<style>` 块都**不带** scoped / module，是全局样式。约定是
// 「组件只写自己那个唯一 `#id` 的规则，通用类（`.box` / `.text` / `.item` …）一律放进
// `Project/css/*.css`」。2026-10-01 实测全仓 **0 处**违约 —— 也就是说这条约定当前
// **只靠人脑维持**：没有任何工具拦得住下一个人在组件里写 `.my-class { }`。
//
// 裸类选择器一旦写进组件样式就会泄漏到整个应用，而且是**静默**的：Vite 只在组件被加载时
// 把它注入 `document`，永不摘除；同名规则最终谁生效取决于"谁的样式表后插入"，也就是取决于
// 异步 import 顺序 —— 同一个类名在不同次启动里可能表现不同。这类问题不会让任何现有门禁变红。
//
// ## 口径
//
// 只扫 `packages/editor/src/**/*.vue` 里**不带** module / scoped 的 `<style>` 块，逐个选择器
// 判断：以 `#` 开头（可带 `>` / `+` / `~` 前导组合符）⇒ 合规；出现**类**（`.foo`）却
// **不以 `#` 开头** ⇒ 违约。
//
// 刻意不管的（过宽的门禁会被无视，本仓已有「永远红的 format:check」当前车之鉴）：
//   - 元素选择器（`input` / `textarea`）、`:root` / `html` / `body`：本仓在 `#id` 作用域内
//     使用它们，不构成跨组件碰撞；
//   - `ui-kit`：它的样式是 `<style module>`，类选择器天然局部化，`:global(...)` 是有意
//     为之的出口 —— 与 editor 恰好相反，所以不套同一把尺子。
//
// ## 用法
//
//   node scripts/component-style-scope.mjs            校验（违约则退出码 1）
//   node scripts/component-style-scope.mjs --verbose  打印通过项计数
//   node scripts/component-style-scope.mjs --json     机器可读输出
//   node scripts/component-style-scope.mjs --selftest 自证解析口径（正例 / 反例）
//
// 退出码：0 = 无违约；1 = 有违约；2 = 内部错误（扫描面缺失等）。

import { join } from 'node:path';
import { collectFiles, readSource } from './lib/scan.mjs';

const EDITOR_SRC = join('packages', 'editor', 'src');

const STYLE_BLOCK_RE = /<style([^>]*)>([\s\S]*?)<\/style>/g;
const UNSAFE_ATTR_RE = /\b(?:module|scoped)\b/;

/** 行号：把 index 之前出现的换行数 + 1 */
const lineOf = (text, index) => {
	let line = 1;
	for (let i = 0; i < index; i++) if (text[i] === '\n') line++;
	return line;
};

/** 注释 / 字符串统一置成等长空白（保留换行，index 与行号仍然对得上） */
const blank = (s) => s.replace(/[^\n]/g, ' ');

const blankComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, blank);

const blankStrings = (css) => css.replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, blank);

/**
 * 解析一段扁平 CSS，返回违约选择器。
 *
 * 用「前奏 + 花括号深度」的状态机：`{` 之前累积的文本是前奏 —— 以 `@` 开头的是 at 规则
 * （其块内又是一层规则），否则就是选择器，需要判定。本仓 editor 的组件样式是扁平 CSS，
 * 没有 `@media` / `@keyframes` / 嵌套，但状态机仍按通用情形写，免得日后加一条 at 规则就失效。
 *
 * @returns {{ selector: string, index: number }[]}
 */
function findLeakedClasses(css) {
	// 先去掉注释与字符串字面量：`content: "}"` 会让花括号配对错位，
	// `[data-x=".b"]` 里的 `.b` 也不是类选择器。
	const text = blankStrings(blankComments(css));

	const violations = [];
	/** 每一层的类型：'at' = at 规则块，'rule' = 规则块 */
	const stack = [];
	let buffer = '';
	let i = 0;

	while (i < text.length) {
		const ch = text[i];
		if (ch === '{') {
			const prelude = buffer.trim();
			buffer = '';
			if (prelude.startsWith('@')) {
				stack.push('at');
			} else if (stack[stack.length - 1] === 'rule') {
				// 规则块内的 `{`：CSS 嵌套语法。本仓未使用，遇到就整段跳过（不误报）。
				stack.push('nested');
			} else {
				stack.push('rule');
				// 只有「选择器位置的层」才判定：顶层，或 at 规则块内
				if (stack.length === 1 || stack[stack.length - 2] === 'at') {
					const start = i - prelude.length;
					for (const part of splitSelectorList(prelude)) {
						if (isLeakedClass(part)) violations.push({ selector: part, index: start });
					}
				}
			}
			i++;
			continue;
		}
		if (ch === '}') {
			stack.pop();
			buffer = '';
			i++;
			continue;
		}
		buffer += ch;
		i++;
	}
	return violations;

	/** 选择器列表按顶层的 `,` 拆开（`[...]` / `(...)` 里的逗号不算分隔符） */
	function splitSelectorList(prelude) {
		const out = [];
		let depth = 0;
		let current = '';
		for (const ch of prelude) {
			if (ch === '(' || ch === '[') depth++;
			else if (ch === ')' || ch === ']') depth--;
			if (ch === ',' && depth === 0) {
				out.push(current.trim());
				current = '';
				continue;
			}
			current += ch;
		}
		out.push(current.trim());
		return out.filter((s) => s !== '');
	}

	/** 不以 `#` 开头、却出现类（`.foo`）的选择器即为泄漏 */
	function isLeakedClass(selector) {
		const normalized = selector.trim().replace(/^[>+~]\s*/, '');
		if (normalized.startsWith('#')) return false;
		return /\.(?=[A-Za-z_])/.test(normalized);
	}
}

function scan() {
	const files = collectFiles({
		dirs: [EDITOR_SRC],
		excludeRe: /(?:\/__tests__\/|\.spec\.ts$|\.d\.ts$)/
	});
	const violations = [];
	let checkedBlocks = 0;
	let checkedRules = 0;

	for (const { full, rel } of files) {
		const src = readSource(full);
		if (!src.includes('<style')) continue;
		STYLE_BLOCK_RE.lastIndex = 0;
		let m;
		while ((m = STYLE_BLOCK_RE.exec(src)) !== null) {
			const [, attrs, css] = m;
			if (UNSAFE_ATTR_RE.test(attrs)) continue;
			checkedBlocks++;
			checkedRules += (blankStrings(blankComments(css)).match(/\{/g) ?? []).length;
			// style 块内 CSS 起点在 src 中的偏移
			const offset = m.index + m[0].indexOf('>') + 1;
			for (const v of findLeakedClasses(css)) {
				violations.push({
					file: rel,
					line: lineOf(src, offset + v.index),
					selector: v.selector.replace(/\s+/g, ' ').slice(0, 80)
				});
			}
		}
	}
	return { violations, checkedBlocks, checkedRules, files: files.length };
}

// ---------------------------------------------------------------------------
// 自证：门禁必须能对自己举出的反例变红，否则它只是一条永远绿的空检查
// ---------------------------------------------------------------------------

const FIXTURES = [
	{ name: '裸类选择器', css: '.box { color: red }', expect: 1 },
	{ name: '多行选择器列表里的裸类', css: '#a,\n.text { color: red }', expect: 1 },
	{ name: '组合选择器里的裸类（按选择器记 1 处）', css: '.a .b { color: red }', expect: 1 },
	{ name: ':not() 里引用全局类', css: ':not(.a) { color: red }', expect: 1 },
	{ name: 'id 规则', css: '#a { color: red }', expect: 0 },
	{ name: 'id 后代类', css: '#a .box { color: red }', expect: 0 },
	{
		name: 'id 内元素选择器（多行列表）',
		css: '#a input,\n\t#a textarea { color: red }',
		expect: 0
	},
	{ name: ':root', css: ':root { --x: 1px }', expect: 0 },
	{ name: '@media 内的裸类', css: '@media (min-width: 1px) { .box { color: red } }', expect: 1 },
	{
		name: '@keyframes 的百分比与 from/to 不是类',
		css: '@keyframes k { from { opacity: 0 } 50% { opacity: 1 } }',
		expect: 0
	},
	{ name: '注释里的类不计', css: '/* .box { } */ #a { color: red }', expect: 0 },
	{ name: '字符串里的点与花括号不计', css: '#a[data-x=".b"] { content: "}" }', expect: 0 }
];

function selftest() {
	let failed = 0;
	for (const fx of FIXTURES) {
		const got = findLeakedClasses(fx.css);
		const ok = got.length === fx.expect;
		if (!ok) failed++;
		const mark = ok ? '✔' : '✖';
		console.log(
			`${mark} ${fx.name}（期望 ${fx.expect}，实得 ${got.length}${
				got.length ? `: ${got.map((v) => v.selector).join(' | ')}` : ''
			}）`
		);
	}
	// 反向自证：正例解析器若把一切都判成违约，上面也有几条会红；这里再确认
	// 「合规 CSS 一条都不报」不能靠空实现蒙过去。
	if (findLeakedClasses('#a { color: red }').length !== 0) failed++;
	const summary = failed === 0 ? '✔ 口径自证通过' : `✖ 口径自证失败（${failed} 条）`;
	console.log(summary);
	process.exit(failed === 0 ? 0 : 2);
}

const main = () => {
	if (process.argv.includes('--selftest')) return selftest();

	const { violations, checkedBlocks, checkedRules, files } = scan();
	const asJson = process.argv.includes('--json');
	const verbose = process.argv.includes('--verbose');

	if (asJson) {
		console.log(JSON.stringify({ violations, checkedBlocks, checkedRules, files }, null, 2));
	} else if (violations.length === 0) {
		if (verbose) {
			console.log(
				`组件样式作用域：✔ 无违约（${files} 个 .vue，${checkedBlocks} 个全局 style 块，${checkedRules} 条规则）`
			);
		}
	} else {
		console.error(
			`组件样式作用域：✖ ${violations.length} 处裸类选择器泄漏到全局（editor 组件样式不带 scoped/module）\n`
		);
		for (const v of violations) console.error(`  ${v.file}:${v.line}  ${v.selector}`);
		console.error(
			'\n修法：通用类规则放进 packages/editor/Project/css/*.css；' +
				'组件私有规则改用该组件唯一的 #id 作用域。'
		);
	}
	process.exit(violations.length === 0 ? 0 : 1);
};

main();
