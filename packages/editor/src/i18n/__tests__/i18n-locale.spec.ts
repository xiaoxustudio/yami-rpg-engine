import { describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useLocalStore } from '@app/stores/local';
import { initYamiI18n, getYamiI18n } from '@app/i18n';

describe('i18n locale 切换 + 真实语言包键', () => {
	it('components.options.name → t 用 .label 键可读（locale 切到 zh-CN）', () => {
		setActivePinia(createPinia());
		const store = useLocalStore();
		store.setLanguage('zh-CN');
		store.properties = {} as never;
		// 真实语言文件结构：options.raw.name
		store.components = {
			'sceneTilemap-light': {
				label: '光线采样',
				options: {
					raw: { name: '原始图像', tip: '不受光照影响' },
					global: { name: '全局采样' },
					ambient: { name: '环境光' },
					anchor: { name: '锚点采样' }
				}
			}
		} as never;
		initYamiI18n();
		const g = getYamiI18n().global as unknown as {
			t: (k: string) => string;
			locale: { value: string };
		};
		expect(g.locale.value).toBe('zh-CN');
		expect(g.t('components.sceneTilemap-light.label')).toBe('光线采样');
		// 当前映射是 .label
		expect(g.t('components.sceneTilemap-light.options.raw.label')).toBe('原始图像');
	});

	it('语言文件原键 .name 也应可读（双兼容）', () => {
		setActivePinia(createPinia());
		const store = useLocalStore();
		store.setLanguage('zh-CN');
		store.properties = {} as never;
		store.components = {
			'sceneTilemap-blend': {
				options: { normal: { name: '正常' } }
			}
		} as never;
		initYamiI18n();
		const g = getYamiI18n().global as unknown as { t: (k: string) => string };
		// .label（当前映射）与 .name（语言文件原键）都可用
		expect(g.t('components.sceneTilemap-blend.options.normal.label')).toBe('正常');
	});
});
