import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import {
	t as i18nT,
	createGetter as i18nCreateGetter,
	getLabel as i18nGetLabel,
	getTip as i18nGetTip,
	getContent as i18nGetContent
} from '@app/i18n';

export const localStateKeys = ['language', 'active', 'languages'] as const;

interface LocalComponentShape {
	label?: string;
	content?: string;
	tip?: string;
	[k: string]: unknown;
}

export const useLocalStore = defineStore('local', () => {
	const language = shallowRef<string>('en');
	const active = shallowRef<string | null>(null);
	const languages = shallowRef<{ key: string; alias: string; filename: string }[]>([]);
	const properties = shallowRef<Record<string, string>>({});
	const components = shallowRef<Record<string, LocalComponentShape>>({});

	function setLanguage(value: string) {
		language.value = value;
	}

	function setActive(value: string | null) {
		active.value = value;
	}

	function setLanguages(value: { key: string; alias: string; filename: string }[]) {
		languages.value = value;
	}

	function createGetter(id: string) {
		return (key: string) => i18nCreateGetter(id)(key);
	}

	function localize(id: string, key: string) {
		return i18nT(`components.${id}.${key}`) || key;
	}

	function get(key: string) {
		return i18nT(key);
	}

	function getLabel(id: string) {
		return i18nGetLabel(id);
	}

	function getContent(id: string) {
		return i18nGetContent(id);
	}

	function getTip(id: string) {
		return i18nGetTip(id);
	}

	return {
		language,
		active,
		languages,
		properties,
		components,
		setLanguage,
		setActive,
		setLanguages,
		createGetter,
		localize,
		get,
		getLabel,
		getContent,
		getTip
	};
});

export function getLocalStore() {
	return useLocalStore(pinia);
}
