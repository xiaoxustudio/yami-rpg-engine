import { createI18n, type I18n } from 'vue-i18n';
import { useLocalStore } from '@app/stores/local';

// vue-i18n 官方接口（渐进迁移目标）。
// 双接口策略：legacy Local.get / useLocalStore().getLabel 保留不动；
// 本模块从同一数据源（stores/local 的 properties + components）构建 vue-i18n messages，
// 使新增组件可用 useI18n().t() 读取既有翻译键，且无需改动既有语言文件。

// 递归展开嵌套对象为点路径键（与 legacy Local.setProperties 展平逻辑一致）
function flatten(obj: unknown, prefix: string, out: Record<string, unknown>): void {
	if (obj === null || typeof obj !== 'object') return;
	for (const key of Object.keys(obj as Record<string, unknown>)) {
		const path = prefix ? `${prefix}.${key}` : key;
		const value = (obj as Record<string, unknown>)[key];
		if (value !== null && typeof value === 'object') {
			flatten(value, path, out);
		} else {
			out[path] = value;
		}
	}
}

// components 段（{ id: { label/tip/content/options } }）展平为
// components.<id>.label / components.<id>.options.<k>.name 点路径
function flattenComponents(
	components: Record<
		string,
		{ label?: string; tip?: string; content?: string; options?: Record<string, unknown> }
	>,
	out: Record<string, unknown>
): void {
	flatten(components, 'components', out);
	for (const id of Object.keys(components)) {
		const comp = components[id];
		if (comp?.label !== undefined) out[`components.${id}.label`] = comp.label;
		if (comp?.tip !== undefined) out[`components.${id}.tip`] = comp.tip;
		if (comp?.content !== undefined) out[`components.${id}.content`] = comp.content;
		if (comp?.options) {
			for (const optKey of Object.keys(comp.options)) {
				const opt = comp.options[optKey] as { name?: string; tip?: string } | undefined;
				if (opt?.name !== undefined) {
					out[`components.${id}.options.${optKey}.name`] = opt.name;
					out[`components.${id}.options.${optKey}.label`] = opt.name;
				}
				if (opt?.tip !== undefined) out[`components.${id}.options.${optKey}.tip`] = opt.tip;
			}
		}
	}
}

// 展平结果（点路径键）转嵌套对象，供 vue-i18n t('a.b.c') 使用
function nest(flat: Record<string, unknown>): Record<string, unknown> {
	const root: Record<string, unknown> = {};
	for (const key of Object.keys(flat)) {
		const parts = key.split('.');
		let node = root;
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			if (!(part in node) || typeof node[part] !== 'object') {
				node[part] = {};
			}
			node = node[part] as Record<string, unknown>;
		}
		node[parts[parts.length - 1]] = flat[key];
	}
	return root;
}

let locale = 'en-US';
let i18nLocal: I18n | null = null;

function setMessages(lang: string, flat: Record<string, unknown>): void {
	locale = lang;
	if (!i18nLocal?.global) return;
	(
		i18nLocal.global as unknown as { setLocaleMessage(l: string, m: unknown): void }
	).setLocaleMessage(lang, nest(flat));
	(i18nLocal.global.locale as { value: string }).value = lang;
}

function rebuildMessages(store: ReturnType<typeof useLocalStore>): void {
	const lang = store.language ?? 'en-US';
	const flat: Record<string, unknown> = {};
	flatten(store.properties, '', flat);
	flattenComponents(store.components as never, flat);
	setMessages(lang, flat);
}

const i18n: I18n = createI18n({
	legacy: false,
	locale,
	fallbackLocale: 'en-US',
	// 双接口兜底：缺失键由 legacy Local/components 数据源兜底，关闭 intlify 默认警告避免控制台噪音
	missingWarn: false,
	fallbackWarn: false
});
i18nLocal = i18n;

// 由 legacy Local 的语言加载流程驱动：首次构建
export function initYamiI18n(): I18n {
	const store = useLocalStore();
	rebuildMessages(store);
	store.$subscribe(() => {
		rebuildMessages(store);
	});
	// legacy Local 语言包加载完成后派发 window 'localize'，同步重建
	window.addEventListener('localize', () => {
		rebuildMessages(useLocalStore());
	});
	return i18n;
}

export function getYamiI18n(): I18n {
	return i18n;
}
