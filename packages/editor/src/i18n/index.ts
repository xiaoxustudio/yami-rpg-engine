import { createI18n, type I18n } from 'vue-i18n';
import { convertLocaleData, type LocaleData, type FlatMessages } from './convert';

// vue-i18n 唯一真源（扁平消息表）。
// 兼容层（legacy Local.get / createGetter / store.getLabel）内部转发到此实例，
// 使既有 1073+ 处调用零改动地消费 vue-i18n；未来迁移完成后移除兼容层即可。

let locale = 'en-US';
let i18nLocal: I18n | null = null;
const flatMessages: Record<string, FlatMessages> = {};

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
	const messages = convertLocaleData(data);
	flatMessages[lang] = messages;
	(
		i18nLocal.global as unknown as { setLocaleMessage(l: string, m: unknown): void }
	).setLocaleMessage(lang, messages);
	(i18nLocal.global.locale as { value: string }).value = lang;
	locale = lang;
}

// 应用初始化：注册到 App（legacy Local 加载完成后会经 applyLocaleData 填充）
export function initYamiI18n(): I18n {
	return i18n;
}

export function getYamiI18n(): I18n {
	return i18n;
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
