import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { localizeDomComponents } from '../dom-localizer.ts';
import { templateLocalizedKeys } from '../template-localized.ts';

/**
 * R2b：`template-localized.ts` 是**生成物**，本 spec 从源码反推同一集合与之比对（防漂移）；
 * 并验证本地化器对这些键**真的跳过 DOM 查询**。
 */
const ROOT = join(__dirname, '../../..'); // packages/editor
const SRC = join(ROOT, 'src');

const readVues = (): { f: string; src: string }[] => {
	const out: { f: string; src: string }[] = [];
	const walk = (p: string): void => {
		for (const e of readdirSync(p)) {
			const full = join(p, e);
			if (statSync(full).isDirectory()) {
				if (e !== 'node_modules' && e !== '__tests__') walk(full);
			} else if (e.endsWith('.vue'))
				out.push({ f: full, src: readFileSync(full, 'utf8').replace(/\uFEFF/g, '') });
		}
	};
	walk(SRC);
	return out;
};

/** 模块侧（元素工厂/数据模块）：与生成器同源——`applyLocalizedItems` 也算"代码已承担" */
const readModules = (): { f: string; src: string }[] => {
	const out: { f: string; src: string }[] = [];
	const walk = (p: string): void => {
		for (const e of readdirSync(p)) {
			const full = join(p, e);
			if (statSync(full).isDirectory()) {
				if (e !== 'node_modules' && e !== '__tests__') walk(full);
			} else if (e.endsWith('.ts') && !e.endsWith('.d.ts'))
				out.push({ f: full, src: readFileSync(full, 'utf8').replace(/\uFEFF/g, '') });
		}
	};
	walk(SRC);
	return out;
};

const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const deriveKeys = (): string[] => {
	const vues = readVues();
	const modules = readModules();
	const components = JSON.parse(
		readFileSync(join(ROOT, 'Project/Locales/en-US.English.json'), 'utf8')
	).components as Record<string, Record<string, unknown>>;
	// R2b 迁移⑮：editor 的 SelectBox 包装器自己按 `components.<id>.options` 生成选项名；
	// 该通用逻辑存在时，`<SelectBox id="<键>">` 的 options 由宿主组件承担（与生成器同源）。
	const selectBoxSrc = readFileSync(
		join(SRC, 'components/common/SelectBox.vue'),
		'utf8'
	);
	const selectBoxGeneric = selectBoxSrc.includes('components.${id}.options');
	const out: string[] = [];
	for (const [key, item] of Object.entries(components)) {
		if (key === '[comment]' || key[0] === '[') continue;
		if (item.save !== undefined) continue;
		const carriers = vues.filter((v) => v.src.includes(`id="${key}"`));
		// R2b 迁移⑩：元素由 ui-kit 组件内部持有 id 的键（`<YMRename>` 之类）没有 `id="<键>"`
		// 承载者；判据放宽为「唯一引用该键消息的 SFC」，多文件引用时仍要求含 id（与生成器同源）。
		const byMessage = vues.filter((v) => v.src.includes(`components.${key}.`));
		const effective = carriers.length > 0 ? carriers : byMessage.length === 1 ? byMessage : [];
		if (effective.length === 0) continue;
		const ok = Object.keys(item).every((field) =>
			effective.some((v) =>
				field === 'tip'
					? v.src.includes(`v-tip="t('components.${key}.tip')"`) ||
						new RegExp(`t\\(['"]components\\.${esc(key)}\\.tip['"]`).test(v.src)
					: field === 'options'
						? new RegExp(`t\\(['"]components\\.${esc(key)}\\.options\\.`).test(v.src) ||
							// R2b 迁移⑦：选项名走 useLocalizedOptions('<键>', …)（响应式 t()）
							v.src.includes(`useLocalizedOptions('${key}'`) ||
							// R2b 迁移⑭：模块侧走 applyLocalizedItems('<键>', …)（订阅语言切换事件重挂）
							modules.some((m) => m.src.includes(`applyLocalizedItems('${key}'`)) ||
							// R2b 迁移⑮：宿主组件按约定承担
							(selectBoxGeneric &&
								new RegExp(`<SelectBox[^>]*\\bid="${esc(key)}"`).test(v.src))
						: new RegExp(`t\\(['"]components\\.${esc(key)}\\.${esc(field)}['"]`).test(
								v.src
							)
			)
		);
		if (ok) out.push(key);
	}
	return out.sort();
};

describe('R2b 模板已承担键集合（template-localized.ts）', () => {
	it('与源码反推的集合一致（防漂移：改动模板请重新生成本文件）', () => {
		const derived = deriveKeys();
		const declared = [...templateLocalizedKeys].sort();
		expect(declared.length).toBeGreaterThan(0);
		expect(declared).toEqual(derived);
	});

	it('集合中的键都不是 [name] 选择器键（选择器键仍由本地化器处理）', () => {
		for (const key of templateLocalizedKeys) expect(key.startsWith('[')).toBe(false);
	});
});

describe('R2b 本地化器跳过模板已承担的键', () => {
	it('对跳过集合里的键不做 getElementById', () => {
		const spy = vi.spyOn(document, 'getElementById');
		const sample = [...templateLocalizedKeys].slice(0, 5);
		const components = Object.fromEntries(sample.map((k) => [k, { content: 'x' }]));
		localizeDomComponents(components);
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it('不在集合里的键仍会被处理（对照组）', () => {
		const el = document.createElement('div');
		el.id = 'not-migrated-probe';
		document.body.appendChild(el);
		localizeDomComponents({ 'not-migrated-probe': { content: 'Changed' } });
		expect(el.textContent).toBe('Changed');
		el.remove();
	});
});
