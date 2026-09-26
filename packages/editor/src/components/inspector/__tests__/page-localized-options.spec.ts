import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { applyLocaleData, initYamiI18n } from '@app/i18n';
import type { LocaleData } from '@app/i18n/convert';
import { elementDataOf } from '@ui-kit';
import AnimSpriteLayerPage from '@app/components/inspector/AnimSpriteLayerPage.vue';

/**
 * inspector 页面的下拉选项在**语言切换后要跟着变**，
 * 而且不能再用"监听 `localize` → 再调一次 `useLocalizedOptions`"那种写法——那会在事件回调里
 * 调用 `useI18n()`，运行期直接抛
 * `SyntaxError: Must be called at the top of a setup function`（本轮真机报错的来源）。
 *
 * 现在的实现：页面在 setup 顶层调用一次 `useLocalizedOptions`（内部走全局 Composer + `watchEffect`），
 * `:ref` 挂载后 effect 重跑补一次 `loadItems`，语言表变化后自动重建。本用例同时锁住"选项真的装上"
 * 与"切语言真的会变"，并顺带派发一次 `localize` 事件（旧实现会在这一步抛错）。
 */
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

		// 切语言（`applyLocaleData` 会改 Composer 的 locale）→ 选项名自动重建
		applyLocaleData('zh-CN', localeData('ZH'));
		await nextTick();
		expect(itemsOf('animSpriteLayer-blend')[0]?.name).toBe('ZH-normal');

		// 本地化器/语言重放仍会派发 `localize`：实现已不依赖它，但必须不抛（旧实现在此抛 setup 错）
		expect(() => window.dispatchEvent(new Event('localize'))).not.toThrow();
		await nextTick();

		wrapper.unmount();
	});
});
