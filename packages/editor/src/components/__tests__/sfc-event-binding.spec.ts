import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const BASELINE = resolve(process.cwd(), '../../scripts/migration-ledger-baseline.json');
const SRC_ROOTS = [resolve(process.cwd(), 'src'), resolve(process.cwd(), '../ui-kit/src')];

const LOCAL_LISTEN_RE =
	/((?:this\s*\.\s*)?[A-Za-z_$][\w$]*(?:\s*(?:\?\.|\.)\s*[A-Za-z_$][\w$]*|\s*\[\s*['"`]?[\w$-]+['"`]?\s*\]|\s*\?\.\s*\[[^\]]*\]|\s*\?\s*)*)\s*\.addEventListener\s*(?:\?\.\s*)?\(/g;

const GLOBAL_OBJECTS = new Set([
	'window',
	'document',
	'global',
	'body',
	'head',
	'documentElement',
	'location',
	'navigator',
	'screen'
]);

/**
 * 与台账同一前提：**先剥离注释与字符串**再计数。
 *
 * 不剥的话，谁在注释里提一句 `el.addEventListener` 就会把这个 spec 弄红，而实际债务没变——
 * 那种红会训练人「看到红就改基线」，正是门禁失效的开始。
 *
 * 这里是 `codeOnly()` 的**等价近似**（模板段跳过 + 块注释 + 行注释 + 字符串字面量），
 * 只覆盖本判定用得到的形态；差异由「独立计数 == 基线」断言兜住。
 */
function codeOnly(source: string): string {
	const blank = (m: string): string => m.replace(/[^\n]/g, ' ');
	let text = source;
	if (/<template[\s>]/.test(text) || /<style[\s>]/.test(text)) {
		text = text
			.replace(/<template[\s\S]*?<\/template>/g, blank)
			.replace(/<style[\s\S]*?<\/style>/g, blank);
	}
	text = text.replace(/<!--[\s\S]*?-->/g, blank);
	text = text.replace(/\/\*[\s\S]*?\*\//g, blank);
	text = text.replace(/\/\/[^\n]*/g, '');
	text = text.replace(/'[^'\n]*'|"[^"\n]*"|`[^`]*`/g, blank);
	return text;
}

/** 谓词：源码的 `<script>` 段里是否存在绑定在自有元素上的 `addEventListener`。 */
function wiresLocalListener(source: string): boolean {
	const script = codeOnly(source);
	LOCAL_LISTEN_RE.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = LOCAL_LISTEN_RE.exec(script)) !== null) {
		const object = match[1].replace(/\s+/g, '');
		const leaf =
			object
				.replace(/^(?:this\.)?/, '')
				.split(/[.?[]/)
				.pop() ?? object;
		if (!GLOBAL_OBJECTS.has(object) && !GLOBAL_OBJECTS.has(leaf)) return true;
	}
	return false;
}

interface Baseline {
	axes: Record<string, { value: { total: number; files: number } }>;
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8')) as Baseline;

/** 递归列出 `.vue` 文件（跳过 `__tests__` / `node_modules`）。 */
function vueFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...vueFiles(full));
		else if (entry.name.endsWith('.vue')) out.push(full);
	}
	return out;
}

/** 当前两包内「自有元素监听」的处数与违规文件。 */
function scanLocalListeners(): { total: number; files: string[] } {
	let total = 0;
	const files: string[] = [];
	for (const root of SRC_ROOTS) {
		for (const file of vueFiles(root)) {
			const source = readFileSync(file, 'utf8');
			const script = codeOnly(source);
			LOCAL_LISTEN_RE.lastIndex = 0;
			let count = 0;
			let match: RegExpExecArray | null;
			while ((match = LOCAL_LISTEN_RE.exec(script)) !== null) {
				const object = match[1].replace(/\s+/g, '');
				const leaf =
					object
						.replace(/^(?:this\.)?/, '')
						.split(/[.?[]/)
						.pop() ?? object;
				if (!GLOBAL_OBJECTS.has(object) && !GLOBAL_OBJECTS.has(leaf)) count++;
			}
			if (count === 0) continue;
			total += count;
			files.push(`${file.replace(root, '')}（${count} 处）`);
		}
	}
	return { total, files };
}

describe('SFC 的事件必须走 Vue 绑定', () => {
	it('谓词：自有元素命中，window/document 不命中，模板不计', () => {
		expect(wiresLocalListener("el.addEventListener('click', f);")).toBe(true);
		expect(wiresLocalListener("root.value?.addEventListener('click', f);")).toBe(true);
		expect(wiresLocalListener("this.input.addEventListener('input', f);")).toBe(true);
		expect(wiresLocalListener("tb.input.addEventListener('keydown', f);")).toBe(true);
		expect(wiresLocalListener("window.addEventListener('resize', f);")).toBe(false);
		expect(wiresLocalListener("document.addEventListener('keydown', f);")).toBe(false);
		expect(
			wiresLocalListener(
				'<template><div @click="x" /></template>\n<script setup>const a = 1;</script>'
			)
		).toBe(false);
	});

	it('独立计数必须等于台账基线（口径漂移即报错）', () => {
		const expected = baseline.axes['vue-local-listeners'].value.total;
		const { total, files } = scanLocalListeners();
		expect(
			total,
			`本 spec 计数 ${total} 与基线 ${expected} 不一致。若刚做了迁移，先跑 pnpm migration:baseline 刷新基线；` +
				`若是新增了监听，请改模板 @ 绑定（全局监听改 useEventListener）。当前违规文件：\n  ${files.join('\n  ')}`
		).toBe(expected);
	});

	it('基线里必须有本轴（否则上面的期望值会读到 undefined，守卫静默失效）', () => {
		expect(Object.keys(baseline.axes)).toContain('vue-local-listeners');
		expect(typeof baseline.axes['vue-local-listeners'].value.total).toBe('number');
	});
});
