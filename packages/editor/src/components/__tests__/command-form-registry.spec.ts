import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import SetString from '@app/components/commands/SetString.vue';
import ChangeActorEquipment from '@app/components/commands/ChangeActorEquipment.vue';
import JumpTo from '@app/components/commands/JumpTo.vue';
import { initYamiI18n } from '@app/i18n';
import { elementDataOf } from '@ui-kit';

/**
 * P5b 批次 4 端到端回归：命令表单 SFC 的 `onMounted` 过去用 `按 id` 找控件再 loadItems，
 * 现在改为读**组件局部**注册表 `fieldEls`（模板 `:ref="registryRef(fieldEls, id)"`）。
 * 这里断言"挂载后控件确实拿到了选项"——若注册表链路断了（例如 ref 没登记），
 * 这些断言会失败（而不是静默不加载）。
 */
vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

// P4b：`dataItems` 是控件元素上的**元素数据**（原型访问器退役后 `el.dataItems` 会读到 undefined）。
// 注意 `elementDataOf(null)` 会抛（WeakMap 键），故先取元素再判空。
const itemsOf = (id: string): unknown[] => {
	const el = document.getElementById(id);
	if (el === null) return [];
	return (elementDataOf<{ dataItems?: unknown[] }>(el).dataItems ?? []) as unknown[];
};

describe('命令表单注册表（P5b 批次 4）', () => {
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
