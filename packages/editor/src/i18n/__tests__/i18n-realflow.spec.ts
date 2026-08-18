import { describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useLocalStore } from '@app/stores/local';
import { initYamiI18n, getYamiI18n } from '@app/i18n';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadLocale(filename: string) {
	const p = resolve(process.cwd(), 'Project/Locales', filename);
	return JSON.parse(readFileSync(p, 'utf8')) as {
		properties: Record<string, unknown>;
		components: Record<string, unknown>;
	};
}

describe('i18n 真实语言包流程（Local → store → i18n）', () => {
	it('setLanguage 同步 store.language，localize 事件驱动 i18n 切换', () => {
		setActivePinia(createPinia());
		const store = useLocalStore();
		const zh = loadLocale('zh-CN.简体中文.json');
		// 模拟 Local.setLanguage 的完整更新链
		store.setLanguage('zh-CN');
		store.properties = zh.properties as never;
		store.components = zh.components as never;
		initYamiI18n();
		window.dispatchEvent(new Event('localize'));
		const g = getYamiI18n().global as unknown as {
			t: (k: string) => string;
			locale: { value: string };
		};
		expect(g.locale.value).toBe('zh-CN');
		// 语言文件原键 .name 经 i18n 也可读（双兼容：.label/.name）
		expect(g.t('components.sceneTilemap-light.options.raw.label')).toBe('原始图像');
		expect(g.t('components.sceneTilemap-light.options.raw.name')).toBe('原始图像');
	});

	it('legacy useLocalStore components 段与 i18n 同一数据源', () => {
		setActivePinia(createPinia());
		const store = useLocalStore();
		const zh = loadLocale('zh-CN.简体中文.json');
		store.setLanguage('zh-CN');
		store.properties = zh.properties as never;
		store.components = zh.components as never;
		initYamiI18n();
		window.dispatchEvent(new Event('localize'));
		const comps = store.components as Record<
			string,
			{ options?: Record<string, { name?: string }> }
		>;
		expect(comps['sceneTilemap-light']?.options?.['raw']?.name).toBe('原始图像');
	});
});
