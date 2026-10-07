import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import FontWindow from '@app/components/tools/Font.vue';
import TextPositionWindow from '@app/components/tools/TextPosition.vue';
import TextEffectWindow from '@app/components/tools/TextEffect.vue';
import InsertImageWindow from '@app/components/tools/InsertImage.vue';
import LocalVariableWindow from '@app/components/tools/LocalVariable.vue';
import { textCaptureEls } from '../text-capture.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

const BY_SFC: Array<[string, string[], unknown]> = [
	['Font.vue', ['font'], FontWindow],
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

describe('文本捕获族注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		textCaptureEls.clear();
	});

	for (const [label, ids, component] of BY_SFC) {
		it(`${label} 登记 ${ids.join(' / ')}`, async () => {
			const wrapper = mount(component as never, { attachTo: document.body });
			await nextTick();

			const missing: string[] = [];
			for (const id of ids) {
				const el = textCaptureEls.get(id);
				if (!(el instanceof HTMLElement)) missing.push(id);
				else if (el.id !== id) missing.push(`${id} → ${el.id}`);
			}
			expect(missing).toEqual([]);

			wrapper.unmount();
		});
	}

	it('五个 SFC 全部挂载后，模块用到的 14 个 id 都已登记（启动门可放行）', async () => {
		const wrappers = BY_SFC.map(([, , component]) =>
			mount(component as never, { attachTo: document.body })
		);
		await nextTick();

		const allIds = BY_SFC.flatMap(([, ids]) => ids);
		expect(allIds).toHaveLength(14);
		const missing = allIds.filter((id) => !(textCaptureEls.get(id) instanceof HTMLElement));
		expect(missing).toEqual([]);
		expect(textCaptureEls.get('font')).toBeInstanceOf(HTMLElement);

		for (const w of wrappers) w.unmount();
	});
});
