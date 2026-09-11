import { createI18n, type I18nOptions } from 'vue-i18n';
import {
	convertLocaleData,
	flattenProperties,
	type LocaleData,
	type FlatMessages
} from './convert';
import { loadLanguage, loadLanguageList, resolveLanguage } from './loader';
import { localizeDomComponents, type LocalComponentItem } from '@app/localize/dom-localizer';
import { getLocalStore } from '@app/stores/local';
import { Editor } from '@app/services/project/editor';

// vue-i18n 唯一真源（扁平消息表）。
// 组件内使用 useI18n()，非组件代码使用 getYamiI18n().global.t 访问全局 Composer。

let locale = 'en-US';
const flatMessages: Record<string, FlatMessages> = {};
const loadedLocaleData: Record<string, LocaleData> = {};
let loadPromise: Promise<string> | null = null;

// 自定义 messageResolver：按完整点路径键查扁平表（避免嵌套冲突）+ legacy common fallback
function resolveFlat(messages: unknown, key: string): unknown {
	const table = (messages ?? {}) as FlatMessages;
	if (key in table) return table[key];
	// 嵌套对象读取：t('languages') 返回 languages.* 的嵌套对象（如 {en, zh-CN}）
	const prefix = `${key}.`;
	let nested: Record<string, unknown> | null = null;
	for (const flatKey of Object.keys(table)) {
		if (flatKey.startsWith(prefix)) {
			if (!nested) nested = {};
			const parts = flatKey.slice(prefix.length).split('.');
			let node = nested;
			for (let i = 0; i < parts.length - 1; i++) {
				const part = parts[i];
				if (!(part in node) || typeof node[part] !== 'object') node[part] = {};
				node = node[part] as Record<string, unknown>;
			}
			node[parts[parts.length - 1]] = table[flatKey];
		}
	}
	if (nested) {
		return nested;
	}
	const index = key.lastIndexOf('.');
	if (index !== -1) {
		const last = key.slice(index + 1);
		const commonKey = `common.${last}`;
		if (commonKey in table) return table[commonKey];
	}
	return undefined;
}

const options = {
	legacy: false,
	locale,
	fallbackLocale: 'en-US',
	missingWarn: false,
	fallbackWarn: false,
	messageResolver: resolveFlat as never
} satisfies I18nOptions;

const i18n = createI18n<false, typeof options>(options);

// 由 legacy Local 语言加载流程调用：把语言 JSON 喂给 i18n（唯一真源）
export function applyLocaleData(lang: string, data: LocaleData): void {
	if (!i18n) return;
	loadedLocaleData[lang] = data;
	const messages = convertLocaleData(data);
	flatMessages[lang] = messages;
	i18n.global.setLocaleMessage(lang, messages);
	i18n.global.locale.value = lang;
	locale = lang;
}

// 已加载的原始语言 JSON（loader 或 legacy Local 任一方加载后均可用，避免重复读文件）
export function getLoadedLocaleData(lang: string): LocaleData | undefined {
	return loadedLocaleData[lang];
}

// 应用初始化：注册到 App（legacy Local 加载完成后会经 applyLocaleData 填充）
export function initYamiI18n(options?: { autoLoad?: boolean; language?: string }) {
	if (options?.autoLoad) {
		loadI18n(options.language).catch(() => undefined);
	}
	return i18n;
}

// i18n 独立加载语言文件（不依赖 legacy Local）：读列表 → 解析当前语言 → 读取 JSON → 喂 i18n
export async function loadI18n(language?: string): Promise<string> {
	if (loadPromise) {
		return loadPromise.then(() => loadI18n(language));
	}
	const promise = (async () => {
		try {
			const languages = await loadLanguageList();
			let requested = language;
			if (requested && !languages.some((l) => l.key === requested)) {
				requested = '';
			}
			const key = resolveLanguage(languages, requested);
			const entry = languages.find((l) => l.key === key);
			if (!entry) return '';
			if (!flatMessages[key]) {
				const data = await loadLanguage(entry.filename);
				applyLocaleData(entry.key, data);
			} else {
				// messages 已存在（如启动 autoLoad 已加载）——仍需切换 locale，否则 t() 用旧语言
				i18n.global.locale.value = entry.key;
				locale = entry.key;
			}
			const data = getLoadedLocaleData(key);
			if (data) {
				const store = getLocalStore();
				store.setLanguage(entry.key);
				store.setActive(entry.filename);
				store.setLanguages(languages);
				store.properties = flattenProperties(data.properties ?? {});
				store.components = data.components ?? {};
				localizeDomComponents(
					data.components as unknown as Record<string, LocalComponentItem>
				);
			}
			if (requested !== undefined && Editor.config) {
				Editor.config.language = requested;
			}
			window.dispatchEvent(new Event('localize'));
			return entry.key;
		} finally {
			loadPromise = null;
		}
	})();
	loadPromise = promise;
	return promise;
}

export function getYamiI18n() {
	return i18n;
}

// 启动初始化：加载语言 → 标记本地化就绪（主菜单由 AppShell 依 store 状态显示）
// 说明：confirm/cancel 的 hotkey 已改为在 YMFormButtons.vue 模板里声明，不再启动时扫 DOM；
// 主菜单可见性同理改由 stores/local 的 ready 驱动（原实现给 #menu 加 .visible）。
export async function initI18n(): Promise<string> {
	const language = await loadI18n(Editor.config?.language ?? '');
	getLocalStore().setReady(true);
	return language;
}
