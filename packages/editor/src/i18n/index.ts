import { createI18n, type I18nOptions } from 'vue-i18n';
import {
	convertLocaleData,
	flattenProperties,
	type LocaleData,
	type FlatMessages
} from './convert';
import { loadLanguageBundle, loadLanguageList, resolveLanguage } from './loader';
import { recordMissingKey, resetMissingKeys } from './missing-keys';
import { localizeDomComponents, type LocalComponentItem } from '@app/localize/dom-localizer';
import { getLocalStore } from '@app/stores/local';
import { Editor } from '@app/services/project/editor';

let locale = 'en-US';
const flatMessages: Record<string, FlatMessages> = {};
const loadedLocaleData: Record<string, LocaleData> = {};
let loadPromise: Promise<string> | null = null;

/**
 * 语言包按组件命名空间拆分（`Project/Locales/<lang>/components.<ns>.json`），但**加载时一次性合并**。
 *
 * 为什么不做逐片懒加载：vue-i18n 的消息表是全局响应式的，任何一次 `mergeLocaleMessage` 都会让
 * 所有调用过 `t()` 的组件重渲染。项目打开后同时挂着 250+ 窗口，逐命名空间合并（哪怕攒成小批）
 * 会变成上百轮全量重渲染——实测把渲染进程 CPU 跑满且界面无响应。分片的收益在**文件布局**
 * （按组件收敛、diff 小），不在运行期；加载时并行读盘、在内存里合并一次，与单文件语言包等价。
 */
function resolveFlat(messages: unknown, key: string): unknown {
	const table = (messages ?? {}) as FlatMessages;
	if (key in table) return table[key];
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
	messageResolver: resolveFlat as never,
	// 动态 key（`t('components.' + x)`）静态门禁看不见；运行期把受管命名空间的缺失记下来，
	// 由真机 E2E 断言为空（见 @app/i18n/missing-keys）。
	missing: (_locale: string, key: string) => recordMissingKey(key)
} satisfies I18nOptions;

const i18n = createI18n<false, typeof options>(options);

export function applyLocaleData(lang: string, data: LocaleData): void {
	if (!i18n) return;
	loadedLocaleData[lang] = data;
	const messages = convertLocaleData(data);
	flatMessages[lang] = messages;
	i18n.global.setLocaleMessage(lang, messages);
	i18n.global.locale.value = lang;
	locale = lang;
}

export function getLoadedLocaleData(lang: string): LocaleData | undefined {
	return loadedLocaleData[lang];
}

export function initYamiI18n(options?: { autoLoad?: boolean; language?: string }) {
	if (options?.autoLoad) {
		loadI18n(options.language).catch(() => undefined);
	}
	return i18n;
}

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
				// 入口 + 全部分片一次读完（并行），只 set 一次消息表：避免任何运行期二次 merge。
				const data = await loadLanguageBundle(entry.filename, entry.key);
				applyLocaleData(entry.key, data);
			} else {
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
				localizeDomComponents(data.components as Record<string, LocalComponentItem>);
			}
			if (requested !== undefined && Editor.config) {
				Editor.config.language = requested;
			}
			window.dispatchEvent(new Event('localize'));
			// 语言包就位之前 home 已经在渲染，期间的 `t()` 必然 miss（启动顺序如此，不是缺陷）。
			// 清一次，只保留「加载完成后仍然查不到」的 key —— 那才是真缺口。
			resetMissingKeys();
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

export async function initI18n(): Promise<string> {
	const language = await loadI18n(Editor.config?.language ?? '');
	getLocalStore().setReady(true);
	return language;
}
