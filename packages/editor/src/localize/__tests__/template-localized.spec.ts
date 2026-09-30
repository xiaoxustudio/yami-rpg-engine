import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { localizeDomComponents } from '../dom-localizer.ts';
import { templateLocalizedKeys } from '../template-localized.ts';

/**
 * `template-localized.ts` 是**生成物**，本 spec 从源码反推同一集合与之比对（防漂移）；
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
	// editor 的 SelectBox 包装器自己按 `components.<id>.options` 生成选项名；
	// 该通用逻辑存在时，`<SelectBox id="<键>">` 的 options 由宿主组件承担（与生成器同源）。
	const selectBoxSrc = readFileSync(join(SRC, 'components/common/SelectBox.vue'), 'utf8');
	const selectBoxGeneric = selectBoxSrc.includes('components.${id}.options');

	// 倒排索引：一次扫描建「id → 文件」「components.<键>. 片段 → 文件」两张表，
	// 避免每个键都对全量 vue 做两次 filter 的 O(键 × 文件 × 长度) 扫描
	// （键集合是 locale 里的 2000+ 条，纯线性化后才不会在全量并发下超时）。
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
		// 同一文件对同一键的多次命中只登记一次（与原 `vues.filter(...).length` 的「按文件」语义一致）。
		const ids = new Set<string>();
		for (const m of v.src.matchAll(/id="([^"]*)"/g)) ids.add(m[1]);
		for (const id of ids) push(idCarriers, id, v);
		const messages = new Set<string>();
		for (const m of v.src.matchAll(/components\.([^.]+)\./g)) messages.add(m[1]);
		for (const key of messages) push(messageCarriers, key, v);
	}
	// 模块侧同理：`applyLocalizedTip(el, '<键>')` 的单引号字面量集合，
	// 以及 `applyLocalizedItems('<键>', …)` 的键集合。键不含 `.`/引号，故按字面量精确入表。
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
		// 元素由 ui-kit 组件内部持有 id 的键（`<YMRename>` 之类）没有 `id="<键>"`
		// 承载者；判据放宽为「唯一引用该键消息的 SFC」，多文件引用时仍要求含 id（与生成器同源）。
		const byMessage = messageCarriers.get(key) ?? [];
		const effective = carriers.length > 0 ? carriers : byMessage.length === 1 ? byMessage : [];
		// `save` 不算需要在 SFC 里承担的显示字段：它是 `#别名` 的注册项，
		// 由 `localizeDomComponents` 按**全表**建索引（见 dom-localizer.ts 与 save-alias.spec.ts）。
		const fields = Object.keys(item).filter((field) => field !== 'save');
		// 模块侧 tooltip 路径：`applyLocalizedTip(el, '<键>')`（元素由模板之外持有的键）
		const moduleCarriesTip = tipLiteralKeys.has(key);
		// 只有在"需要 SFC 承担某些字段"时才强制要求承载者存在（与生成器同源）
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
									// 选项名走 useLocalizedOptions('<键>', …)（响应式 t()）
									v.src.includes(`useLocalizedOptions('${key}'`) ||
									// 模块侧走 applyLocalizedItems('<键>', …)（订阅语言切换事件重挂）
									localizedItemsKeys.has(key) ||
									// 宿主组件按约定承担
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
	// 这条会遍历整个 editor 源码树反推键集合：早先是「每个键全表 filter」的
	// O(键 × 文件 × 长度) 扫描，随文件数增长后在全量并发下会超过超时而偶发红。
	// 现改为一次扫描建倒排索引（id → 文件、components.<键>. → 文件、模块字面量集合），
	// 复杂度降到近线性；超时仍保留一个宽松值以防机器极慢。
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
