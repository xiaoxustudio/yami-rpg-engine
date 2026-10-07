import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { localizeDomComponents } from '../dom-localizer.ts';
import { templateLocalizedKeys } from '../template-localized.ts';

const ROOT = join(__dirname, '../../..');
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
	const selectBoxSrc = readFileSync(join(SRC, 'components/common/SelectBox.vue'), 'utf8');
	const selectBoxGeneric = selectBoxSrc.includes('components.${id}.options');

	const push = (
		map: Map<string, { f: string; src: string }[]>,
		key: string,
		v: { f: string; src: string }
	): void => {
		const arr = map.get(key);
		if (arr) arr.push(v);
		else map.set(key, [v]);
	};
	const idCarriers = new Map<string, { f: string; src: string }[]>();
	const messageCarriers = new Map<string, { f: string; src: string }[]>();
	for (const v of vues) {
		const ids = new Set<string>();
		for (const m of v.src.matchAll(/id="([^"]*)"/g)) ids.add(m[1]);
		for (const id of ids) push(idCarriers, id, v);
		const messages = new Set<string>();
		for (const m of v.src.matchAll(/components\.([^.]+)\./g)) messages.add(m[1]);
		for (const key of messages) push(messageCarriers, key, v);
	}
	const tipLiteralKeys = new Set<string>();
	const localizedItemsKeys = new Set<string>();
	for (const m of modules) {
		if (m.src.includes('applyLocalizedTip(')) {
			for (const mm of m.src.matchAll(/'([^'\n]*)'/g)) tipLiteralKeys.add(mm[1]);
		}
		for (const mm of m.src.matchAll(/applyLocalizedItems\('([^'\n]+)'/g))
			localizedItemsKeys.add(mm[1]);
	}

	const out: string[] = [];
	for (const [key, item] of Object.entries(components)) {
		if (key === '[comment]' || key[0] === '[') continue;
		const carriers = idCarriers.get(key) ?? [];
		const byMessage = messageCarriers.get(key) ?? [];
		const effective = carriers.length > 0 ? carriers : byMessage.length === 1 ? byMessage : [];
		const fields = Object.keys(item).filter((field) => field !== 'save');
		const moduleCarriesTip = tipLiteralKeys.has(key);
		if (
			effective.length === 0 &&
			!(fields.length > 0 && fields.every((f) => f === 'tip' && moduleCarriesTip))
		)
			continue;
		const ok = fields.every((field) =>
			field === 'tip' && moduleCarriesTip
				? true
				: effective.some((v) =>
						field === 'tip'
							? v.src.includes(`v-tip="t('components.${key}.tip')"`) ||
								new RegExp(`t\\(['"]components\\.${esc(key)}\\.tip['"]`).test(v.src)
							: field === 'options'
								? new RegExp(`t\\(['"]components\\.${esc(key)}\\.options\\.`).test(
										v.src
									) ||
									v.src.includes(`useLocalizedOptions('${key}'`) ||
									localizedItemsKeys.has(key) ||
									(selectBoxGeneric &&
										new RegExp(`<SelectBox[^>]*\\bid="${esc(key)}"`).test(
											v.src
										))
								: new RegExp(
										`t\\(['"]components\\.${esc(key)}\\.${esc(field)}['"]`
									).test(v.src)
					)
		);
		if (ok) out.push(key);
	}
	return out.sort();
};

describe('模板已承担键集合（template-localized.ts）', () => {
	it('与源码反推的集合一致（防漂移：改动模板请重新生成本文件）', { timeout: 60_000 }, () => {
		const derived = deriveKeys();
		const declared = [...templateLocalizedKeys].sort();
		expect(declared.length).toBeGreaterThan(0);
		expect(declared).toEqual(derived);
	});

	it('集合中的键都不是 [name] 选择器键（选择器键仍由本地化器处理）', () => {
		for (const key of templateLocalizedKeys) expect(key.startsWith('[')).toBe(false);
	});
});

describe('本地化器跳过模板已承担的键', () => {
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
