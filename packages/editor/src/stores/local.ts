import { defineStore } from 'pinia';
import { Local } from '@/tools/localization.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const localStateKeys = ['language', 'active', 'languages'] as const;

interface LocalComponentShape {
	label?: string;
	content?: string;
	tip?: string;
	[k: string]: any;
}

export const useLocalStore = defineStore('local', () => {
	const language = shallowRef<string>('en');
	const active = shallowRef<string | null>(null);
	const languages = shallowRef<any[]>([]);
	const properties = shallowRef<Record<string, string>>({});
	const components = shallowRef<Record<string, LocalComponentShape>>({});
	let listening = false;

	function syncState() {
		language.value = Local?.language ?? 'en';
		active.value = Local?.active ?? null;
		languages.value = Local?.languages ?? [];
		properties.value = Local?.properties ?? {};
		components.value = Local?.components ?? {};
		if (!listening && typeof window !== 'undefined') {
			window.addEventListener('localize', syncState);
			listening = true;
		}
	}

	function setLanguage(value: string) {
		language.value = value;
	}

	function setActive(value: string | null) {
		active.value = value;
	}

	function setLanguages(value: any[]) {
		languages.value = value;
	}

	function createGetter(id: string) {
		return (key: string) => {
			return Local?.createGetter?.(id)?.(key) ?? key;
		};
	}

	function localize(id: string, key: string) {
		return Local?.localize?.(id, key) ?? key;
	}

	function get(key: string) {
		return properties.value[key] ?? '';
	}

	function getLabel(id: string) {
		return components.value[id]?.label ?? '';
	}

	function getContent(id: string) {
		return components.value[id]?.content ?? '';
	}

	function getTip(id: string) {
		return components.value[id]?.tip ?? '';
	}

	return {
		language,
		active,
		languages,
		properties,
		components,
		syncState,
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
