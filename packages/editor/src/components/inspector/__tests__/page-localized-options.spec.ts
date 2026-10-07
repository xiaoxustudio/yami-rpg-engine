import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { applyLocaleData, initYamiI18n } from '@app/i18n';
import type { LocaleData } from '@app/i18n/convert';
import { elementDataOf } from '@ui-kit';
import AnimSpriteLayerPage from '@app/components/inspector/AnimSpriteLayerPage.vue';

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		animSpriteLayer: { motion: null, direction: 0, update: vi.fn(), listChange: vi.fn() }
	}
}));

vi.mock('@app/composables/useAnimSpriteLayerPage', () => ({
	useAnimSpriteLayerPage: () => ({ form: {}, sync: vi.fn(), onParamInput: vi.fn() })
}));

vi.mock('@app/composables/useInspectorInput', () => ({
	useInspectorInput: () => ({ bindInput: vi.fn(), bindSliders: vi.fn() })
}));

vi.mock('@app/animation/animation-window.ts', () => ({
	Animation: { direction: 0 }
}));

const localeData = (name: string): LocaleData =>
	({
		properties: {},
		components: {
			'animSpriteLayer-blend': {
				options: {
					normal: { name: `${name}-normal` },
					additive: { name: `${name}-additive` },
					subtract: { name: `${name}-subtract` }
				}
			},
			'animSpriteLayer-light': {
				options: {
					raw: { name: `${name}-raw` },
					global: { name: `${name}-global` },
					anchor: { name: `${name}-anchor` }
				}
			}
		}
	}) as unknown as LocaleData;

const itemsOf = (id: string): Array<{ name?: string }> => {
	const el = document.getElementById(id);
	if (el === null) return [];
	return (elementDataOf<{ dataItems?: Array<{ name?: string }> }>(el).dataItems ?? []) as Array<{
		name?: string;
	}>;
};

describe('inspector 页面下拉：选项名跟随语言', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('挂载后装上选项，语言切换后自动重建，并在 localize 事件下不抛', async () => {
		applyLocaleData('en-US', localeData('EN'));
		const wrapper = mount(AnimSpriteLayerPage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();
		await nextTick();

		expect(itemsOf('animSpriteLayer-blend').map((i) => i.name)).toEqual([
			'EN-normal',
			'EN-additive',
			'EN-subtract'
		]);
		expect(itemsOf('animSpriteLayer-light').map((i) => i.name)).toEqual([
			'EN-raw',
			'EN-global',
			'EN-anchor'
		]);

		applyLocaleData('zh-CN', localeData('ZH'));
		await nextTick();
		expect(itemsOf('animSpriteLayer-blend')[0]?.name).toBe('ZH-normal');

		expect(() => window.dispatchEvent(new Event('localize'))).not.toThrow();
		await nextTick();

		wrapper.unmount();
	});
});
