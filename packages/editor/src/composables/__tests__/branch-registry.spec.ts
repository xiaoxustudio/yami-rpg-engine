import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import IfBranch from '@app/components/tools/IfBranch.vue';
import SwitchBranch from '@app/components/tools/SwitchBranch.vue';
import IfCondition from '@app/components/tools/IfCondition.vue';
import SetNumberOperand from '@app/components/tools/SetNumberOperand.vue';
import { composableEls } from '@app/composables/element-registry';
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

	it('IfCondition：控件实例注册表镜像出元素，窗口元素按 id 登记', async () => {
		const wrapper = await mountSettle(IfCondition);

		for (const id of [
			'if-condition-type',
			'if-condition-common-variable',
			'if-condition-operand-variable'
		]) {
			const el = composableEls.get(id);
			expect(el, `${id} 未镜像`).toBeTruthy();
			expect(el?.id).toBe(id);
			expect(el).toBe(document.getElementById(id));
		}
		const frame = composableEls.get('if-condition') as HTMLElement | null;
		expect(frame?.id).toBe('if-condition');
		// 表单桥已从「窗口根元素上的方法」迁到模块（composables/if-condition-bridge）：
		// 元素上不该再有业务方法，桥由组件 onMounted 时登记。
		expect((frame as unknown as { setForm?: unknown }).setForm).toBeUndefined();
		const bridge = getIfConditionBridge();
		expect(typeof bridge?.setForm).toBe('function');
		expect(typeof bridge?.getForm).toBe('function');

		wrapper.unmount();
	});

	it('SetNumberOperand：控件实例注册表镜像出元素，窗口元素按 id 登记', async () => {
		const wrapper = await mountSettle(SetNumberOperand);

		for (const id of [
			'setNumber-operation',
			'setNumber-operand-operation',
			'setNumber-operand-common-variable'
		]) {
			const el = composableEls.get(id);
			expect(el, `${id} 未镜像`).toBeTruthy();
			expect(el?.id).toBe(id);
		}
		const frame = composableEls.get('setNumber-operand') as HTMLElement | null;
		expect(frame?.id).toBe('setNumber-operand');
		// 同 if-condition：窗口元素上不再挂业务方法，表单桥在模块上。
		expect((frame as unknown as { setForm?: unknown }).setForm).toBeUndefined();
		expect(typeof getSetNumberOperandBridge()?.setForm).toBe('function');

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
