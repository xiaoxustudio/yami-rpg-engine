#!/usr/bin/env node
// 一次性 codemod：把 editor 包装层组件的 `attachElementApi(el, {…})` 收窄成
// `setElementCapabilities(el, { enable, disable, getFocus })`。
// 只剩「DOM 型能力」——控件能力已经由 defineExpose 提供，不再挂元素。
// ⚠️ 只能按「一个组件 + 它的元素消费方 + 对应 spec」逐批跑：整目录跑会把
// SliderBox.synchronize、旧式 `el(prefix,id)` 助手、按元素断言的 spec 一起打红。
// 用法：node scripts/oneoff/wrapper-attach-codemod.mjs [--apply]
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');
const DIR = 'packages/editor/src/components/common';

/** `api` 对象形态的包装组件：只登记这三件 DOM 型能力。 */
const API_CAPS = {
	'FileVar.vue': ['enable', 'disable', 'getFocus'],
	'NumberVar.vue': ['enable', 'disable', 'getFocus'],
	'SelectVar.vue': ['enable', 'disable', 'getFocus'],
	'StringVar.vue': ['enable', 'disable', 'getFocus'],
	'TextAreaVar.vue': ['enable', 'disable', 'getFocus'],
	'SliderBox.vue': ['enable', 'disable']
};

/** 固定跳过：另行处理。 */
const SKIP = new Set(['GamepadBox.vue', 'TreeList.vue']);

/** `ONLY=a.vue,b.vue` 只处理这几个文件（按批次跑时用）。 */
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',').map((n) => n.trim())) : null;

const DOM_CAPS = new Set(['enable', 'disable', 'getFocus']);

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (name.endsWith('.vue')) out.push(full);
	}
	return out;
}

/** 从 `open`（指向 `(`）起找到配对的 `)`，跳过字符串与模板串。 */
function matchParen(text, open) {
	let depth = 0;
	for (let i = open; i < text.length; i += 1) {
		const ch = text[i];
		if (ch === '`') {
			i += 1;
			while (i < text.length && text[i] !== '`') {
				if (text[i] === '\\') i += 1;
				i += 1;
			}
		} else if (ch === "'" || ch === '"') {
			const quote = ch;
			i += 1;
			while (i < text.length && text[i] !== quote) {
				if (text[i] === '\\') i += 1;
				i += 1;
			}
		} else if (ch === '(') depth += 1;
		else if (ch === ')') {
			depth -= 1;
			if (depth === 0) return i;
		}
	}
	return -1;
}

/** 取对象字面量的一级键。 */
function keysOf(objText) {
	const keys = [];
	let depth = 0;
	let token = '';
	const flush = () => {
		const t = token.trim();
		if (t) {
			const m = /^([A-Za-z_$][\w$]*)/.exec(t);
			if (m) keys.push(m[1]);
		}
		token = '';
	};
	for (const ch of objText) {
		if ('{[('.includes(ch)) depth += 1;
		if ('}])'.includes(ch)) depth -= 1;
		if (ch === ',' && depth === 0) flush();
		else token += ch;
	}
	flush();
	return keys;
}

/** 删掉因此变空的 `onMounted(() => { … });`，返回新文本。 */
function dropEmptyOnMounted(text) {
	return text.replace(/onMounted\(\(\) => \{\s*\}\);\n?/g, (match) => (match ? '' : match));
}

const files = walk(join(ROOT, DIR));
const report = [];

for (const file of files) {
	const name = file.slice(file.lastIndexOf('\\') + 1);
	if (SKIP.has(name)) continue;
	if (ONLY && !ONLY.has(name)) continue;
	let text = readFileSync(file, 'utf8');
	if (!text.includes('attachElementApi(')) continue;

	const callAt = text.indexOf('attachElementApi(');
	const open = text.indexOf('(', callAt);
	const close = matchParen(text, open);
	if (close < 0) {
		report.push(`! ${name}: 括号不配对，跳过`);
		continue;
	}
	let caps = API_CAPS[name];
	if (!caps) {
		const args = text.slice(open + 1, close);
		// 第一个参数是元素，第二个是成员对象
		const firstComma = args.indexOf(',');
		const memberText = firstComma >= 0 ? args.slice(firstComma + 1) : '';
		const braceOpen = memberText.indexOf('{');
		const braceClose = memberText.lastIndexOf('}');
		const members = braceOpen >= 0 ? keysOf(memberText.slice(braceOpen + 1, braceClose)) : [];
		caps = members.filter((key) => DOM_CAPS.has(key));
	}

	const target = text.slice(open + 1, text.indexOf(',', open)).trim();
	const replacement = caps.length
		? `setElementCapabilities(${target}, { ${caps.join(', ')} })`
		: '';

	// 连同上一个非空行的缩进一起替换：保留行首缩进
	const lineStart = text.lastIndexOf('\n', callAt) + 1;
	const indentMatch = /^[\t ]*/.exec(text.slice(lineStart));
	const indent = indentMatch ? indentMatch[0] : '';
	const statement = replacement ? `${indent}${replacement}` : '';
	text = text.slice(0, lineStart) + statement + text.slice(close + 1);
	// 去掉替换后残留的空行 / 孤立分号（`;` 后面紧跟的换行保留一个）
	text = text.replace(/;;/g, ';');
	text = text.replace(/^[\t ]*;[\t ]*\n/gm, '');
	text = text.replace(/\n[\t ]*\n(\t*\}\);)/g, '\n$1');

	// 去掉 attachElementApi 的 import
	text = text.replace(
		/^[\t ]*import \{ attachElementApi \} from '@app\/utils\/attach-element-api';\n/m,
		''
	);

	if (caps.length > 0) {
		// 把 setElementCapabilities 加进 @ui-kit 的具名 import
		const uiKitImport = /import \{([^}]*)\} from '@ui-kit';/;
		if (uiKitImport.test(text)) {
			text = text.replace(uiKitImport, (match, inner) => {
				if (inner.includes('setElementCapabilities')) return match;
				const cleaned = inner.replace(/\s+$/, '');
				const separator = cleaned.endsWith(',') ? ' ' : ', ';
				return `import {${cleaned}${separator}setElementCapabilities } from '@ui-kit';`;
			});
		} else {
			text = text.replace(
				/(<script setup lang="ts">\n)/,
				`$1import { setElementCapabilities } from '@ui-kit';\n`
			);
		}
	}

	text = dropEmptyOnMounted(text);

	if (APPLY) writeFileSync(file, text);
	report.push(
		`${APPLY ? '✓' : '·'} ${relative(ROOT, file).replace(/\\/g, '/')} → { ${caps.join(', ')} }`
	);
}

console.log(report.join('\n'));
console.log(`\n共 ${report.length} 个文件${APPLY ? '已改写' : '（dry-run，加 --apply 落盘）'}`);
