import { createI18n, type I18n } from 'vue-i18n';
import {
	convertLocaleData,
	flattenProperties,
	type LocaleData,
	type FlatMessages
} from './convert';
import { loadLanguage, loadLanguageList, resolveLanguage } from './loader';
import { localizeDomComponents, type LocalComponentItem } from '@app/legacy/localize/dom-localizer';
import { getLocalStore } from '@app/stores/local';
import { Editor } from '@app/services/project/editor';

// vue-i18n 唯一真源（扁平消息表）。
// 兼容层（legacy Local.get / createGetter / store.getLabel）内部转发到此实例，
// 使既有 1073+ 处调用零改动地消费 vue-i18n；未来迁移完成后移除兼容层即可。

let locale = 'en-US';
let i18nLocal: I18n | null = null;
const flatMessages: Record<string, FlatMessages> = {};
const loadedLocaleData: Record<string, LocaleData> = {};
let loadPromise: Promise<string> | null = null;

// 自定义 messageResolver：按完整点路径键查扁平表（避免嵌套冲突）+ legacy common fallback
function resolveFlat(messages: unknown, key: string): unknown {
	const table = (messages ?? {}) as FlatMessages;
	if (key in table) return table[key];
	const index = key.lastIndexOf('.');
	if (index !== -1) {
		const last = key.slice(index + 1);
		const commonKey = `common.${last}`;
		if (commonKey in table) return table[commonKey];
	}
	return undefined;
}

const i18n: I18n = createI18n({
	legacy: false,
	locale,
	fallbackLocale: 'en-US',
	missingWarn: false,
	fallbackWarn: false,
	messageResolver: resolveFlat as never
});
i18nLocal = i18n;

// 由 legacy Local 语言加载流程调用：把语言 JSON 喂给 i18n（唯一真源）
export function applyLocaleData(lang: string, data: LocaleData): void {
	if (!i18nLocal?.global) return;
	loadedLocaleData[lang] = data;
	const messages = convertLocaleData(data);
	flatMessages[lang] = messages;
	(
		i18nLocal.global as unknown as { setLocaleMessage(l: string, m: unknown): void }
	).setLocaleMessage(lang, messages);
	(i18nLocal.global.locale as { value: string }).value = lang;
	locale = lang;
}

// 已加载的原始语言 JSON（loader 或 legacy Local 任一方加载后均可用，避免重复读文件）
export function getLoadedLocaleData(lang: string): LocaleData | undefined {
	return loadedLocaleData[lang];
}

// 应用初始化：注册到 App（legacy Local 加载完成后会经 applyLocaleData 填充）
export function initYamiI18n(options?: { autoLoad?: boolean; language?: string }): I18n {
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
				(i18nLocal!.global.locale as { value: string }).value = entry.key;
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

export function getYamiI18n(): I18n {
	return i18n;
}

// 启动初始化：注册 confirm/cancel hotkey → 加载语言 → 显示主菜单
export async function initI18n(): Promise<string> {
	for (const button of document.getElementsByName('confirm')) {
		button.setAttribute('hotkey', 'Ctrl+Enter');
	}
	for (const button of document.getElementsByName('cancel')) {
		button.setAttribute('hotkey', 'Escape');
	}
	const language = await loadI18n(Editor.config?.language ?? '');
	const menu = document.getElementById('menu');
	if (menu) menu.classList.add('visible');
	return language;
}

// 兼容层：legacy 旧接口转发到 i18n 真源
export function t(key: string): string {
	if (!i18nLocal?.global) return key;
	const value = (i18nLocal.global as unknown as { t: (k: string) => string }).t(key);
	if (value && value !== key) return value;
	return key;
}

// 兼容 createGetter：前缀 + key → t
export function createGetter(path: string): (key: string) => string {
	const prefix = path ? `${path}.` : '';
	return (key: string) => t(prefix + key);
}

// 兼容 components 段：components.<id>.label
export function getLabel(id: string): string {
	return t(`components.${id}.label`);
}

export function getTip(id: string): string {
	return t(`components.${id}.tip`);
}

export function getContent(id: string): string {
	return t(`components.${id}.content`);
}
