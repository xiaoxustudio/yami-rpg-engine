import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import AttributeWindow from '@app/components/tools/Attribute.vue';
import EnumWindow from '@app/components/tools/Enum.vue';
import { Attribute } from '../attribute-window.ts';
import { getAttributeHandles } from '@app/composables/attribute-handles';
import { Enum } from '@app/enum/enum-window.ts';
import { getEnumHandles } from '@app/composables/enum-handles';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

describe('属性/枚举窗口：句柄表接缝', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Attribute.list = undefined as unknown as typeof Attribute.list;
		Enum.list = undefined as unknown as typeof Enum.list;
	});

	it('Attribute.vue 挂载后交出 9 个句柄，节点与 DOM id 一致', async () => {
		const wrapper = mount(AttributeWindow, { attachTo: document.body });
		await nextTick();

		const handles = getAttributeHandles();
		expect(handles).toBeTruthy();
		for (const id of [
			'attribute',
			'attribute-list',
			'attribute-properties-flex',
			'attribute-searcher',
			'attribute-name',
			'attribute-key',
			'attribute-note',
			'attribute-enum',
			'attribute-enum-box'
		]) {
			expect(document.getElementById(id), `DOM 里缺少 ${id}`).toBeInstanceOf(HTMLElement);
		}

		wrapper.unmount();
		expect(getAttributeHandles(), '卸载后应注销').toBeNull();
	});

	it('Attribute.initialize 从句柄表绑定 list/panel/searcher/inputs', async () => {
		const wrapper = mount(AttributeWindow, { attachTo: document.body });
		await nextTick();

		const handles = getAttributeHandles()!;
		Attribute.initialize!();

		expect(Attribute.list).toBe(handles.list);
		expect(Attribute.panel).toBe(handles.panel);
		expect(Attribute.searcher).toBe(handles.searcher);
		expect(Attribute.inputs.name).toBe(handles.name);
		expect(Attribute.inputs.key).toBe(handles.key);
		expect(Attribute.inputs.enumBox).toBe(handles.enumBox);
		expect((Attribute.panel as HTMLElement).classList.contains('hidden')).toBe(true);

		wrapper.unmount();
	});

	it('Enum.vue 挂载后交出句柄表，Enum.initialize 从中绑定', async () => {
		const wrapper = mount(EnumWindow, { attachTo: document.body });
		await nextTick();

		const handles = getEnumHandles();
		expect(handles).toBeTruthy();
		for (const id of [
			'enum',
			'enum-list',
			'enum-properties-flex',
			'enum-searcher',
			'enum-name',
			'enum-value',
			'enum-note'
		]) {
			expect(document.getElementById(id), `DOM 里缺少 ${id}`).toBeInstanceOf(HTMLElement);
		}

		Enum.initialize!();
		expect(Enum.list).toBe(handles?.list);
		expect(Enum.panel).toBe(handles?.panel);
		expect(Enum.inputs.name).toBe(handles?.name);

		wrapper.unmount();
		expect(getEnumHandles(), '卸载后应注销').toBeNull();
	});

	it('未挂载（句柄表为空）时 initialize 不抛错且不改动既有绑定', () => {
		const saved = Attribute.list;
		expect(() => Attribute.initialize!()).not.toThrow();
		expect(Attribute.list).toBe(saved);
	});
});
