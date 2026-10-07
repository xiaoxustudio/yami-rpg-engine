import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import SceneRegionPage from '@app/components/inspector/SceneRegionPage.vue';

const ROOT = join(__dirname, '..', '..', '..');

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) walk(p, out);
		else if (entry.name.endsWith('.vue')) out.push(p);
	}
	return out;
}

const BUILTIN = new Set([
	'template',
	'slot',
	'component',
	'Transition',
	'TransitionGroup',
	'KeepAlive',
	'Teleport',
	'Suspense',
	'Fragment'
]);

/** 取出 SFC 顶层的 `<template>` 块（按 `<template` / `</template>` 配对，兼容内部具名 `<template #slot>`）。 */
function templateOf(text: string): string {
	const start = text.indexOf('<template');
	if (start === -1) return '';
	const tag = /<\/?template\b[^>]*>/g;
	tag.lastIndex = start;
	let depth = 0;
	let match: RegExpExecArray | null;
	while ((match = tag.exec(text)) !== null) {
		if (match[0].startsWith('</')) {
			depth--;
			if (depth === 0) return text.slice(start, match.index + match[0].length);
		} else {
			depth++;
		}
	}
	return text.slice(start);
}

/** `detail-box` → `DetailBox` */
const pascal = (name: string): string =>
	name
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');

/**
 * 名字在 `<script>` 里是否有**真实绑定**。
 *
 * 只认 `import X from` / `import { X }` / `import * as X` / `const|let|var|function|class X`——
 * 刻意**不**用「出现过就算」：那样一处注释里提到名字就能让本用例对真实漏导入失效（假绿）。
 */
function hasBinding(script: string, name: string): boolean {
	const n = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return (
		new RegExp(`import\\s+${n}\\s+from`).test(script) ||
		new RegExp(`import\\s*\\{[^}]*\\b${n}\\b[^}]*\\}`).test(script) ||
		new RegExp(`import\\s*\\*\\s*as\\s+${n}\\b`).test(script) ||
		new RegExp(`(?:const|let|var|function|class)\\s+${n}\\b`).test(script)
	);
}

describe('模板组件解析完整性（防漏导入组件）', () => {
	it('所有模板里用到的 PascalCase 组件在 <script> 中都有绑定（或为文件名自引用）', () => {
		const files = walk(join(ROOT, 'src'));
		expect(files.length, '审计面不能为空（否则本用例会静默变成空转）').toBeGreaterThan(300);

		const missing: string[] = [];
		for (const file of files) {
			const text = readFileSync(file, 'utf8');
			const template = templateOf(text);
			if (template === '') continue;
			const script = text.replace(template, '');
			const selfName = basename(file, '.vue');

			const used = new Set<string>();
			for (const match of template.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) used.add(match[1]);
			for (const match of template.matchAll(/<([a-z][a-z0-9]*(?:-[a-z0-9]+)+)\b/g))
				used.add(pascal(match[1]));

			for (const name of used) {
				if (BUILTIN.has(name)) continue;
				if (name === selfName) continue;
				if (hasBinding(script, name)) continue;
				missing.push(`${relative(ROOT, file)}: ${name}`);
			}
		}
		expect(missing, '这些 SFC 用了组件但没导入，模板会退化成同名原生元素').toEqual([]);
	});

	it('运行时：代表性页面把 DetailBox / DetailSummary 解析成真实组件（无 Failed to resolve 警告）', async () => {
		setActivePinia(createPinia());
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const wrapper = mount(SceneRegionPage, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		const unresolved = warn.mock.calls
			.map((call) => String(call[0]))
			.filter((text) => text.includes('Failed to resolve component'));
		warn.mockRestore();

		expect(unresolved).toEqual([]);
		expect(
			wrapper.findComponent({ name: 'YMDetailBox' }).exists(),
			'DetailBox 应解析为组件'
		).toBe(true);
		expect(
			wrapper.findComponent({ name: 'YMDetailSummary' }).exists(),
			'DetailSummary 应解析为组件'
		).toBe(true);

		wrapper.unmount();
	});
});
