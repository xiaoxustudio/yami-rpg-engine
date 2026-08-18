import { describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useLocalStore } from '@app/stores/local';
import { initYamiI18n, getYamiI18n } from '@app/i18n';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadLocale(filename: string) {
	const p = resolve(process.cwd(), 'Project/Locales', filename);
	const data = JSON.parse(readFileSync(p, 'utf8')) as {
		properties: Record<string, unknown>;
		components: Record<string, unknown>;
	};
	return data;
}

function setupStore(lang: string, props: Record<string, unknown>, comps: Record<string, unknown>) {
	setActivePinia(createPinia());
	const store = useLocalStore();
	store.setLanguage(lang);
	store.properties = props as never;
	store.components = comps as never;
	return store;
}

describe('i18n 双接口', () => {
	it('真实语言文件 properties → useI18n().t 可用', () => {
		const zhdata = loadLocale('zh-CN.简体中文.json');
		setupStore('zh-CN', zhdata.properties, zhdata.components);
		initYamiI18n();
		const g = getYamiI18n().global as unknown as {
			t: (k: string) => string;
			locale: { value: string };
		};
		expect(g.locale.value).toBe('zh-CN');
		expect(g.t('common.none')).toBe('none');
		expect(g.t('common.create')).toBe('创建');
	});

	it('components 段 label/options 可用', () => {
		const zhdata = loadLocale('zh-CN.简体中文.json');
		setupStore('zh-CN', zhdata.properties, zhdata.components);
		initYamiI18n();
		const g = getYamiI18n().global as unknown as { t: (k: string) => string };
		expect(g.t('components.sceneTilemap-light.label')).toBe('光线采样');
		expect(g.t('components.sceneTilemap-light.options.raw.label')).toBe('原始图像');
		expect(g.t('components.sceneTilemap-light.options.global.label')).toBe('全局采样');
	});
});
