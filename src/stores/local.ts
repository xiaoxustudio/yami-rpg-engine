import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useLocalStore = defineStore('local', () => {
	const language = shallowRef<string>('en');
	const properties = shallowRef<Record<string, any>>({});
	const components = shallowRef<Record<string, any>>({});
	let listening = false;

	function syncState() {
		const Local = (window as any).Local;
		language.value = Local?.language ?? 'en';
		properties.value = Local?.properties ?? {};
		components.value = Local?.components ?? {};
		if (!listening && typeof window !== 'undefined') {
			window.addEventListener('localize', syncState);
			listening = true;
		}
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
		properties,
		components,
		syncState,
		createGetter,
		localize,
		get,
		getLabel,
		getContent,
		getTip
	};
});
