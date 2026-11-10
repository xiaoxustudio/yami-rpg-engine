import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestElementRegistry } from '@app/__tests__/test-registry';
import { getNumberOperand } from '@app/composables/number-operand-bridge';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import IfBranch from '@app/components/tools/IfBranch.vue';
import SwitchBranch from '@app/components/tools/SwitchBranch.vue';
import IfCondition from '@app/components/tools/IfCondition.vue';
import SetNumberOperand from '@app/components/tools/SetNumberOperand.vue';
const composableEls = createTestElementRegistry();
import { getIfBranch } from '@app/composables/tool-window-bridges';
import { getSwitchBranch } from '@app/composables/tool-window-bridges';
import { getIfConditionBridge } from '@app/composables/if-condition-bridge';
import { getSetNumberOperandBridge } from '@app/composables/set-number-operand-bridge';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: () => '' } })
}));

const mountSettle = async (component: Parameters<typeof mount>[0]) => {
	const wrapper = mount(component, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	await wrapper.vm.$nextTick();
	return wrapper;
};

type BoundList = HTMLElement & { object?: { parse?: unknown }; bind?: unknown };

describe('分支/条件表单注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
	});

	it('IfBranch：控件经窗口桥交出，条件列表真的被 bind', async () => {
		const wrapper = await mountSettle(IfBranch);

		const api = getIfBranch();
		expect(api, '窗口应交出 IfBranch 桥').toBeTruthy();
		expect(composableEls.get('if-branch-conditions')).toBeFalsy();
		const conditions = document.getElementById('if-branch-conditions') as BoundList | null;
		expect(conditions?.object, 'if-branch-conditions 未被 bind').toBeTruthy();
		expect(typeof conditions?.object?.parse).toBe('function');

		wrapper.unmount();
		expect(getIfBranch(), '卸载后应注销').toBeNull();
	});

	it('SwitchBranch：条件列表经窗口桥交出并被 bind', async () => {
		const wrapper = await mountSettle(SwitchBranch);

		const api = getSwitchBranch();
		expect(api, '窗口应交出 SwitchBranch 桥').toBeTruthy();
		expect(composableEls.get('switch-branch-conditions')).toBeFalsy();
		const conditions = document.getElementById('switch-branch-conditions') as BoundList | null;
		expect(conditions?.object, 'switch-branch-conditions 未被 bind').toBeTruthy();

		wrapper.unmount();
		expect(getSwitchBranch(), '卸载后应注销').toBeNull();
	});

	it('IfCondition：控件走控件表（不再镜像进注册表），桥与控件都在', async () => {
		const wrapper = await mountSettle(IfCondition);

		for (const id of [
			'if-condition-type',
			'if-condition-common-variable',
			'if-condition-operand-variable'
		]) {
			// 迁移后：注册表里没有它们，但模板里都在（schema 经桥的 control 读取）
			expect(composableEls.get(id), `${id} 不该再镜像`).toBeFalsy();
			expect(document.getElementById(id), `${id} 模板里应存在`).toBeTruthy();
		}
		expect(composableEls.get('if-condition'), '窗口根不该再登记').toBeFalsy();
		expect(document.getElementById('if-condition')).toBeTruthy();

		const bridge = getIfConditionBridge();
		expect(typeof bridge?.setForm).toBe('function');
		expect(typeof bridge?.getForm).toBe('function');
		expect(bridge?.control('commonVariable'), '变量框应经桥交出').toBeTruthy();
		expect(bridge?.control('operandVariable'), '操作数变量框应经桥交出').toBeTruthy();
		expect(bridge?.control('shortcutKey'), '快捷名称框应经桥交出').toBeTruthy();

		wrapper.unmount();
	});

	it('SetNumberOperand：控件走控件表（不再镜像进注册表），桥与控件都在', async () => {
		const wrapper = await mountSettle(SetNumberOperand);

		for (const id of [
			'setNumber-operation',
			'setNumber-operand-operation',
			'setNumber-operand-common-variable'
		]) {
			expect(composableEls.get(id), `${id} 不该再镜像`).toBeFalsy();
			expect(document.getElementById(id), `${id} 模板里应存在`).toBeTruthy();
		}
		expect(composableEls.get('setNumber-operand'), '窗口根不该再登记').toBeFalsy();

		const bridge = getSetNumberOperandBridge();
		expect(typeof bridge?.setForm).toBe('function');
		// 控件级能力走另一条桥（NumberOperandApi）：表单桥只负责 setForm/getForm
		expect(getNumberOperand()?.control('commonVariable'), '变量框应经桥交出').toBeTruthy();
		// 冷却键那一行是按操作数类型条件渲染的：未挂载时桥返回 null（与旧的按 id 取元素一致）
		expect(() => getNumberOperand()?.control('cooldownKey')).not.toThrow();

		wrapper.unmount();
	});

	it('注册表为空时模块侧安全（不再按 id 回退）', async () => {
		const { useIfBranchSchema } = await import('@app/composables/useIfBranchSchema');
		const { useSwitchBranchSchema } = await import('@app/composables/useSwitchBranchSchema');
		for (const id of ['if-branch-mode', 'if-branch-conditions', 'switch-branch-conditions']) {
			composableEls.set(id, null);
		}
		const ifBranch = useIfBranchSchema();
		const switchBranch = useSwitchBranchSchema();
		expect(() => ifBranch.windowClosed?.(new Event('closed'))).not.toThrow();
		expect(() => switchBranch.windowClosed?.(new Event('closed'))).not.toThrow();
	});
});
