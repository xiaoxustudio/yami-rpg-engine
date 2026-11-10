import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElementRegistry } from '@app/utils/element-registry';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import FontWindow from '@app/components/tools/Font.vue';
import TextPositionWindow from '@app/components/tools/TextPosition.vue';
import TextEffectWindow from '@app/components/tools/TextEffect.vue';
import InsertImageWindow from '@app/components/tools/InsertImage.vue';
import LocalVariableWindow from '@app/components/tools/LocalVariable.vue';
const composableEls = createElementRegistry();

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

const BY_SFC: Array<[string, string[], unknown]> = [
	['Font.vue', [], FontWindow],
	['TextPosition.vue', ['textPosition-axis', 'textPosition-operation'], TextPositionWindow],
	[
		'TextEffect.vue',
		[
			'textEffect-type',
			'textEffect-shadowOffsetX',
			'textEffect-shadowOffsetY',
			'textEffect-color',
			'textEffect-strokeWidth'
		],
		TextEffectWindow
	],
	[
		'InsertImage.vue',
		[
			'insertImage-mode',
			'insertImage-image',
			'insertImage-width',
			'insertImage-height',
			'insertImage-clip'
		],
		InsertImageWindow
	],
	['LocalVariable.vue', ['localVariable-key'], LocalVariableWindow]
];

/**
 * 文本捕获族：**控件不再进注册表**（`textCaptureEls` 已删除）。这里改为守两件事：
 * 1. 窗口挂载后控件就在 DOM 里（id 与选择器一致）；
 * 2. 这些控件没有被登记进共享注册表 —— 与 `Selection` 单例的 id 依赖一起拆掉了。
 */
describe('文本捕获族：控件在 DOM 里、但不再进注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	for (const [label, ids, component] of BY_SFC) {
		it(`${label} 挂载后控件就位且未进注册表`, async () => {
			const wrapper = mount(component as never, { attachTo: document.body });
			await nextTick();

			for (const id of ids) {
				const el = document.getElementById(id);
				expect(el, `${id} 应在 DOM 里`).toBeInstanceOf(HTMLElement);
				expect(composableEls.get(id), `${id} 不该再进注册表`).toBeFalsy();
			}

			wrapper.unmount();
		});
	}

	it('五个 SFC 全部挂载后，注册表里没有它们的 13 个控件 id', async () => {
		const wrappers = BY_SFC.map(([, , component]) =>
			mount(component as never, { attachTo: document.body })
		);
		await nextTick();

		const allIds = BY_SFC.flatMap(([, ids]) => ids);
		expect(allIds).toHaveLength(13);
		const registered = allIds.filter((id) => composableEls.get(id));
		expect(registered).toEqual([]);

		for (const w of wrappers) w.unmount();
	});
});
