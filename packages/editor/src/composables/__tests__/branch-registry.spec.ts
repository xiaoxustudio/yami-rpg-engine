import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import IfBranch from '@app/components/tools/IfBranch.vue';
import SwitchBranch from '@app/components/tools/SwitchBranch.vue';
import IfCondition from '@app/components/tools/IfCondition.vue';
import SetNumberOperand from '@app/components/tools/SetNumberOperand.vue';
import { composableEls } from '@app/composables/element-registry';
import { registryElement } from '@app/utils/element-registry';

/**
 * P1b 第 3 刀回归：`components/tools` 的分支/条件表单。
 *
 * 覆盖三件事：
 * ① 两种注册表形态的镜像都成立——`IfBranch`/`SwitchBranch` 用元素注册表
 *    （`createElementRegistry(composableEls)`），`IfCondition`/`SetNumberOperand` 用批 1 的
 *    **控件实例**注册表（`fieldRef` 里把实例的 `$el`/`root` 镜像进 `composableEls`）；
 * ② **顺带修掉的一处静默失效**：`if-branch-conditions` / `switch-branch-conditions` 这行
 *    `fieldEls.get(...)?.bind?.(X)` 在批 4 之后一直是 no-op（标签上从没登记过 `:ref`）——
 *    现在断言 ParamList 的 `object` 真的被绑上了（缺 `:ref` 时该断言失败）；
 * ③ 窗口元素（`if-condition` / `setNumber-operand`）由具名 ref 命令式登记（模块读它取 setForm/getForm）。
 */
vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
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

describe('分支/条件表单注册表（P1b 第 3 刀）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
	});

	it('IfBranch：控件与 conditions 列表都登记，且 ParamList 真的被 bind', async () => {
		const wrapper = await mountSettle(IfBranch);

		expect(composableEls.get('if-branch-mode')?.id).toBe('if-branch-mode');
		const conditions = composableEls.get('if-branch-conditions') as unknown as BoundList | null;
		expect(conditions?.id).toBe('if-branch-conditions');
		expect(conditions).toBe(document.getElementById('if-branch-conditions'));
		// 批 4 之后这里恒为 undefined（`:ref` 没登记 → bind 被 `?.` 静默跳过）
		expect(conditions?.object, 'if-branch-conditions 未被 bind').toBeTruthy();
		expect(typeof conditions?.object?.parse).toBe('function');

		wrapper.unmount();
	});

	it('SwitchBranch：conditions 列表同样登记并被 bind', async () => {
		const wrapper = await mountSettle(SwitchBranch);

		const conditions = registryElement<BoundList>(composableEls, 'switch-branch-conditions');
		expect(conditions?.id).toBe('switch-branch-conditions');
		expect(conditions).toBe(document.getElementById('switch-branch-conditions'));
		expect(conditions?.object, 'switch-branch-conditions 未被 bind').toBeTruthy();

		wrapper.unmount();
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
		// 窗口元素：`:ref` 槽位被具名 ref 占用 → onMounted 命令式登记（模块读它取 setForm/getForm）
		const frame = composableEls.get('if-condition') as unknown as unknown as
			| (HTMLElement & { setForm?: unknown; getForm?: unknown })
			| null;
		expect(frame?.id).toBe('if-condition');
		expect(typeof frame?.setForm).toBe('function');
		expect(typeof frame?.getForm).toBe('function');

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
		const frame = composableEls.get('setNumber-operand') as unknown as unknown as
			| (HTMLElement & { setForm?: unknown })
			| null;
		expect(frame?.id).toBe('setNumber-operand');
		expect(typeof frame?.setForm).toBe('function');

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
