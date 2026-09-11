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
	// 语言资源就绪标志：主菜单文案来自本地化数据，就绪后才显示（原实现由 i18n 启动时给 #menu 加 .visible）
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
