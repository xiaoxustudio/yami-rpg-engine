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

let locale = 'en-US';
const flatMessages: Record<string, FlatMessages> = {};
const loadedLocaleData: Record<string, LocaleData> = {};
let loadPromise: Promise<string> | null = null;

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
	messageResolver: resolveFlat as never
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
				const data = await loadLanguage(entry.filename);
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
