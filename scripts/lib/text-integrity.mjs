// 「文本污染」扫描口径 —— 被 `scripts/check-text-integrity.mjs`（CLI）与
// `scripts/lib/self-test.mjs`（自证）共用。
//
// ## 这个模块守的是什么
//
// 2026-09-21 在本仓实测到一族**语法合法**的写坏：某个写文件的通道把文本里的
// `\a` `\b` `\e` `\t` `\n` 当成了**转义序列**解释，于是
//
//   - 单词首字母被换成控制字符：`as` → `0x07` + `s`、`bindInput` → `0x08` + `indInput`、
//     `textarea` → TAB + `extarea`、`editor` → `0x1B` + `ditor`；
//   - 整行代码被吞进 `//` 注释：`…（如 scrollLeft/hover）\n\tfor (const m of …)`
//     变成**字面量** `\n` 文本，两条真代码从此成了注释（`scripts/audit-ui-slots.mjs:64`）；
//   - 注释体里又开了一个块注释起始符，把整整 9 行原样重复一遍
//     （`src/inspector/element-registry.ts`，由 `cdfc80e9` 的批量改写引入）。
//
// 这三类**全部通过了 `tsc` / `oxlint` / `oxfmt` / vitest** —— 没有任何既有门禁看得见它们。
// 所以必须专门量。这也是本仓反复强调的「仪器要自证」：本文件的口径由
// `self-test.mjs` 用**故意写坏**的样本逐条验证。
//
// ## 为什么不用「一切可疑字符都报」
//
// 每条规则都在**当前全仓（1577 文件）实测过零误报**，取舍逐条记在规则上。
// 过宽的规则会被无视（本仓已有先例：一条永远红的 `format:check` 教人忽略门禁）。

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/** 扫描面：源码 + 脚手架。刻意**不含** `Project/Templates`（第三方产物）与 `dist/build`。 */
export const TEXT_SCAN_DIRS = [
	join('packages', 'editor', 'src'),
	join('packages', 'ui-kit', 'src'),
	join('packages', 'editor', 'main'),
	'scripts'
];

export const TEXT_SCAN_EXTENSIONS = new Set([
	'.ts',
	'.tsx',
	'.vue',
	'.mjs',
	'.js',
	'.json',
	'.md',
	'.html'
]);

/** 与台账同一套排除口径：测试文件**也扫**（测试里的注释同样会被写坏）。 */
const EXCLUDE_RE = /(?:^|\/)(?:node_modules|dist|dist-electron|build|out|jsons)\//;

/** 注释行判定（`*` 续行 / `//` 行注释 / `/*` 起始行）。 */
export const COMMENT_LINE_RE = /^\s*(?:\*|\/\/|\/\*)/;

/**
 * 合法控制字符：`\t` `\n` `\r`。其余 C0 与 DEL 一律算污染。
 *
 * 这条规则**必须**在正则里写出控制字符的码点范围 —— 它抓的就是控制字符本身。
 * 因此这里是有理由地关掉 `no-control-regex`（而不是放宽这条规则）。
 */
export const ILLEGAL_CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/; // oxlint-disable-line eslint/no-control-regex -- 本规则的目的就是匹配控制字符

/**
 * 中日韩文字/全角标点**紧跟** TAB。
 *
 * 为什么不报「中文 + 空格」而只报 TAB：`内部 textarea` 是正常写法，
 * 被写坏的是 `内部<TAB>extarea`。中文与全角标点之后**从不**合法地跟一个制表符。
 */
export const CJK_THEN_TAB_RE = /[\u3000-\u303F\u4E00-\u9FFF\uFF00-\uFFEF]\t/;

/**
 * `//` 行注释里出现**字面量** `\n` 转义文本，且其后紧跟一条语句关键字或另一条 `//`。
 *
 * 这是「两条语句被粘进一条注释」的签名（`audit-ui-slots.mjs:64` 就是这么坏的）。
 * 为什么不报所有含 `\n` 的注释：本仓合法地存在 3 处（注释里解释 `'\n};'`、
 * `null as\n\t\t| …` 之类的代码样例），报它们会让规则失去可信度。
 */
export const GLUED_STATEMENT_RE =
	/\\n[ \t]*(?:\/\/|for\b|if\b|else\b|const\b|let\b|var\b|return\b|import\b|export\b|function\b|class\b|await\b|try\b|switch\b|while\b)/;

/** 注释体里又出现块注释起始符，且**位于行尾**（写坏时的形态正是「…：`/**」）。 */
export const NESTED_COMMENT_OPENER_RE = /^\s*\*.*\/\*\*\s*$/;

/**
 * 规则表。`id` 稳定、可用于白名单与自测；`match(line, ctx)` 返回 `null` 或一段细节说明。
 *
 * `ctx` = `{ lines, index, isComment }`，供需要跨行判断的规则使用。
 */
export const TEXT_RULES = [
	{
		id: 'control-char',
		label: '非法控制字符（C0 / DEL）',
		why: '写文件通道把 \\a \\b \\e 之类的转义解释掉了，单词首字母被换成不可见字符',
		match(line) {
			const m = ILLEGAL_CONTROL_RE.exec(line);
			if (m === null) return null;
			const cp = m[0].charCodeAt(0);
			return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}（第 ${m.index + 1} 列）`;
		}
	},
	{
		id: 'replacement-char',
		label: 'Unicode 替换字符 U+FFFD（某个字解码失败留下的坑）',
		why:
			'编解码事故：一个中文字被解不出来，被替换成 `\\uFFFD`（常常还多带一个 `?`）。' +
			'实测 15 处（`printer.ts` 的参数说明、`apk.ts` 的字段注释等），' +
			'全是**只影响注释**的历史事故 —— 但它在阅读时是纯粹的噪音，而且会一直传下去',
		match(line) {
			const at = line.indexOf('\uFFFD');
			if (at < 0) return null;
			return `第 ${at + 1} 列起（共 ${line.split('\uFFFD').length - 1} 处）`;
		}
	},
	{
		id: 'cjk-then-tab',
		label: '中文/全角标点后紧跟 TAB',
		why: '写文件通道把 \\t 解释成了真正的制表符，吃掉了后面单词的首字母',
		match(line) {
			const m = CJK_THEN_TAB_RE.exec(line);
			if (m === null) return null;
			return `「${m[0][0]}」后是 TAB（第 ${m.index + 2} 列）`;
		}
	},
	{
		id: 'mid-line-tab',
		label: '行中间出现 TAB（TAB 只应作行首缩进）',
		why:
			'写文件通道把 \\t 解释成了真正的制表符：代码行里它吃掉了相邻单词的首字母（' +
			'`内部 textarea` → `内部<TAB>extarea`），或把两条语句粘成一行',
		match(line, ctx) {
			// 唯一的豁免：注释行里**紧跟注释标记**的那个 TAB —— 那是合法地在注释里排代码样例
			// （如 ` * \t[k: string]: any;`）。注释里**正文之后**再出现 TAB 就是污染。
			const body = line.replace(/^\s*(?:\*|\/\/|\/\*)\s?/, '');
			const bodyStart = line.length - body.length;
			for (let i = 1; i < line.length; i++) {
				if (line[i] !== '\t' || line[i - 1] === '\t') continue;
				const isSampleIndent = ctx.isComment && /^[\t ]*$/.test(line.slice(bodyStart, i));
				if (isSampleIndent) return null;
				return `第 ${i + 1} 列（前一字符 ${JSON.stringify(line[i - 1])}，后一字符 ${JSON.stringify(line[i + 1] ?? '')}）`;
			}
			return null;
		}
	},
	{
		id: 'nested-comment-opener',
		label: '注释体内出现块注释起始符',
		why: '批量改写把一整段注释复制进了自己（`cdfc80e9` 在 inspector/element-registry.ts 上就是这样）',
		match(line) {
			return NESTED_COMMENT_OPENER_RE.test(line) ? line.trim().slice(-30) : null;
		}
	},
	{
		id: 'glued-statement',
		label: '行注释里粘进了下一条语句',
		why: '字面量 \\n 没有解码，后面的真代码从此成了注释（永远不会执行）',
		match(line, _ctx) {
			if (!/^\s*\/\//.test(line)) return null;
			const m = GLUED_STATEMENT_RE.exec(line);
			return m === null
				? null
				: `第 ${m.index + 1} 列起：${line.slice(m.index, m.index + 24)}…`;
		}
	},
	{
		id: 'duplicated-comment-block',
		label: '连续 3 行注释在 60 行内被逐字重复',
		why: '整段注释被复制了一遍（写坏的另一种形态，nested-comment-opener 只覆盖其中一种）',
		match(line, ctx) {
			const { lines, index, isComment } = ctx;
			if (!isComment[index]) return null;
			const norm = (i) => lines[i].replace(/^\s*(?:\*|\/\/)\s?/, '').trim();
			const anchor = norm(index);
			if (anchor.length < 8) return null;
			for (let k = index + 3; k < Math.min(index + 60, lines.length - 2); k++) {
				if (!isComment[k] || norm(k) !== anchor) continue;
				if (!isComment[k + 1] || norm(k + 1) !== norm(index + 1)) continue;
				if (!isComment[k + 2] || norm(k + 2) !== norm(index + 2)) continue;
				return `与第 ${k + 1} 行起的三行逐字相同`;
			}
			return null;
		}
	}
];

/** 按规则表检查一段文本，返回问题列表（行号 1 基、列号 1 基由规则自己写在 detail 里）。 */
export function checkTextIntegrity(text) {
	const lines = text.split('\n');
	const isComment = lines.map((l) => COMMENT_LINE_RE.test(l));
	const issues = [];
	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		for (const rule of TEXT_RULES) {
			const detail = rule.match(line, { lines, index, isComment });
			if (detail !== null && detail !== undefined) {
				issues.push({ rule: rule.id, line: index + 1, detail: String(detail) });
			}
		}
	}
	return issues;
}

/** 收集扫描面内的文件（相对 ROOT 的 posix 路径 + 绝对路径）。 */
export function collectTextFiles(root) {
	const out = [];
	const walk = (abs) => {
		let entries;
		try {
			entries = readdirSync(abs);
		} catch {
			return;
		}
		for (const entry of entries) {
			const full = join(abs, entry);
			if (statSync(full).isDirectory()) {
				walk(full);
				continue;
			}
			const dot = entry.lastIndexOf('.');
			if (dot < 0 || !TEXT_SCAN_EXTENSIONS.has(entry.slice(dot))) continue;
			const rel = relative(root, full).replace(/\\/g, '/');
			if (EXCLUDE_RE.test(`/${rel}`)) continue;
			out.push({ full, rel });
		}
	};
	for (const dir of TEXT_SCAN_DIRS) walk(join(root, dir));
	out.sort((a, b) => a.rel.localeCompare(b.rel));
	return out;
}

/** 全量扫描：返回 `{ files, issues }`，issues 已按文件/行排序。 */
export function scanTextIntegrity(root) {
	const files = collectTextFiles(root);
	const issues = [];
	for (const { full, rel } of files) {
		for (const issue of checkTextIntegrity(readFileSync(full, 'utf8'))) {
			issues.push({ rel, ...issue });
		}
	}
	return { files, issues };
}
