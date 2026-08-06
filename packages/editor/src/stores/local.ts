import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

// Phase 10——Local 全局状态承载键（language/active/languages 经 Pinia 承载——legacy Local.xxx 访问零改动）
export const localStateKeys = ['language', 'active', 'languages'] as const;

export const useLocalStore = defineStore('local', () => {
	const language = shallowRef<string>('en');
	const active = shallowRef<string | null>(null);
	const languages = shallowRef<any[]>([]);
	const properties = shallowRef<Record<string, any>>({});
	const components = shallowRef<Record<string, any>>({});
	let listening = false;

	function syncState() {
		const Local = (window as any).Local;
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
			const Local = (window as any).Local;
			return Local?.createGetter?.(id)?.(key) ?? key;
		};
	}

	function localize(id: string, key: string) {
		return (window as any).Local?.localize?.(id, key) ?? key;
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
