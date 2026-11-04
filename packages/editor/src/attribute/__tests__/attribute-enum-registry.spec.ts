import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import AttributeWindow from '@app/components/tools/Attribute.vue';
import EnumWindow from '@app/components/tools/Enum.vue';
import { Attribute, attributeEls } from '../attribute-window.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { getEnumHandles } from '@app/composables/enum-handles';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

describe('属性/枚举窗口元素注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		attributeEls.clear();
		Attribute.list = undefined as unknown as typeof Attribute.list;
		Enum.list = undefined as unknown as typeof Enum.list;
	});

	it('Attribute.vue 登记 9 个元素（元素 id 与注册键一致）', async () => {
		const wrapper = mount(AttributeWindow, { attachTo: document.body });
		await nextTick();

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
			const el = attributeEls.get(id);
			expect(el, `注册表缺少 ${id}`).toBeInstanceOf(HTMLElement);
			expect(el?.id).toBe(id);
		}

		wrapper.unmount();
	});

	it('Attribute.initialize 从注册表绑定 list/panel/searcher/inputs', async () => {
		const wrapper = mount(AttributeWindow, { attachTo: document.body });
		await nextTick();

		Attribute.initialize!();

		expect(Attribute.list).toBe(attributeEls.get('attribute-list'));
		expect(Attribute.panel).toBe(attributeEls.get('attribute-properties-flex'));
		expect(Attribute.searcher).toBe(attributeEls.get('attribute-searcher'));
		expect(Attribute.inputs.name).toBe(attributeEls.get('attribute-name'));
		expect(Attribute.inputs.key).toBe(attributeEls.get('attribute-key'));
		expect(Attribute.inputs.enumBox).toBe(attributeEls.get('attribute-enum-box'));
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

	it('注册表为空时（未挂载）initialize 不抛错且不改动既有绑定', () => {
		attributeEls.clear();
		const saved = Attribute.list;
		expect(() => Attribute.initialize!()).not.toThrow();
		expect(Attribute.list).toBe(saved);
	});
});
