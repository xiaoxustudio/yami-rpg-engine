import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import SetString from '@app/components/commands/SetString.vue';
import ChangeActorEquipment from '@app/components/commands/ChangeActorEquipment.vue';
import JumpTo from '@app/components/commands/JumpTo.vue';
import { initYamiI18n } from '@app/i18n';
import { elementDataOf } from '@ui-kit';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

const itemsOf = (id: string): unknown[] => {
	const el = document.getElementById(id);
	if (el === null) return [];
	return (elementDataOf<{ dataItems?: unknown[] }>(el).dataItems ?? []) as unknown[];
};

describe('命令表单注册表', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('SetString：operation / operand-type 的选项经注册表加载', async () => {
		const wrapper = mount(SetString, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();
		await nextTick();

		expect(itemsOf('setString-operation').length).toBeGreaterThan(0);
		expect(itemsOf('setString-operand-type').length).toBeGreaterThan(0);

		wrapper.unmount();
	});

	it('ChangeActorEquipment：equipment 选项经注册表加载', async () => {
		const wrapper = mount(ChangeActorEquipment, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();
		await nextTick();

		const anyLoaded = ['changeActorEquipment-equipment', 'changeActorEquipment-operation'].some(
			(id) => itemsOf(id).length > 0
		);
		expect(anyLoaded).toBe(true);

		wrapper.unmount();
	});

	it('JumpTo：operation 选项经注册表加载', async () => {
		const wrapper = mount(JumpTo, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();
		await nextTick();

		expect(itemsOf('jumpTo-operation').length).toBeGreaterThan(0);

		wrapper.unmount();
	});
});
