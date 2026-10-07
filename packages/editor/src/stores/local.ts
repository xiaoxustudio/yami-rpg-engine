import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const localStateKeys = ['language', 'active', 'languages', 'ready'] as const;

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
	const ready = shallowRef(false);

	function setLanguage(value: string) {
		language.value = value;
	}

	function setActive(value: string | null) {
		active.value = value;
	}

	function setLanguages(value: { key: string; alias: string; filename: string }[]) {
		languages.value = value;
	}

	function setReady(value: boolean) {
		ready.value = value;
	}

	return {
		language,
		active,
		languages,
		properties,
		components,
		ready,
		setLanguage,
		setActive,
		setLanguages,
		setReady
	};
});

export function getLocalStore() {
	return useLocalStore(pinia);
}
