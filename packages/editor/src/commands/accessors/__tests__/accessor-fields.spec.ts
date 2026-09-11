import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import ActorGetterWindow from '@app/components/tools/ActorGetter.vue';
import SkillGetterWindow from '@app/components/tools/SkillGetter.vue';
import { ActorGetter } from '../actor-accessor-window.ts';
import { SkillGetter } from '../skill-accessor-window.ts';
import type { AccessorFieldControl } from '@app/types/shapes.ts';

/**
 * P5b 批次 2 回归：访问器窗口的控件不再用 `$('#id')` 查 DOM，而由对应 SFC 在 setup 期
 * 通过 `createAccessorFields()` 登记、模块的 `initialize()` 从 `this.fields` 取。
 * 本用例锁住「登记 → initialize 真正作用到控件」这条链路（此前无覆盖）。
 */
vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

type RelateEntries = { case: string; targets: unknown[] }[];

/** 直接替换控件方法并记录调用（避免 vi.spyOn 在组件实例上的类型噪声） */
const stubLoadItems = (control: AccessorFieldControl): (() => unknown[][]) => {
	const calls: unknown[][] = [];
	control.loadItems = (items: unknown[]) => {
		calls.push(items);
		return undefined;
	};
	return () => calls;
};

const stubHiddenMode = (control: AccessorFieldControl): (() => RelateEntries[]) => {
	const calls: RelateEntries[] = [];
	control.enableHiddenMode = () => ({
		relate: (entries: unknown) => {
			calls.push(entries as RelateEntries);
			return undefined;
		}
	});
	return () => calls;
};

describe('accessor 控件注册表（P5b 批次 2）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	const controlOf = (
		fields: Map<string, unknown> | null | undefined,
		id: string
	): AccessorFieldControl => {
		const control = fields?.get(id) as AccessorFieldControl | undefined;
		expect(control, `注册表缺少 ${id}`).toBeTruthy();
		return control!;
	};

	it('ActorGetter：SFC 登记控件 → initialize 调用 loadItems 且 relate 收到元素', async () => {
		const wrapper = mount(ActorGetterWindow, { attachTo: document.body });
		await nextTick();

		const type = controlOf(ActorGetter.fields, 'actorGetter-type');
		const loadItemsCalls = stubLoadItems(type);
		const relateCalls = stubHiddenMode(type);

		ActorGetter.initialize!();

		const items = loadItemsCalls();
		expect(items).toHaveLength(1);
		expect((items[0] as { value: string }[]).map((i) => i.value)).toContain('member');

		expect(relateCalls()).toHaveLength(1);
		const memberEntry = relateCalls()[0].find((e) => e.case === 'member')!;
		expect(memberEntry.targets[0]).toBeInstanceOf(HTMLElement);
		expect(memberEntry.targets[0]).toBe(
			controlOf(ActorGetter.fields, 'actorGetter-memberId').root
		);

		wrapper.unmount();
	});

	it('SkillGetter：initialize 通过注册表给 type 控件 loadItems 并 relate 元素', async () => {
		const wrapper = mount(SkillGetterWindow, { attachTo: document.body });
		await nextTick();

		const type = controlOf(SkillGetter.fields, 'skillGetter-type');
		const loadItemsCalls = stubLoadItems(type);
		const relateCalls = stubHiddenMode(type);

		SkillGetter.initialize!();

		const items = loadItemsCalls();
		expect(items).toHaveLength(1);
		expect((items[0] as { value: string }[]).map((i) => i.value)).toContain('by-key');

		const byKey = relateCalls()[0].find((e) => e.case === 'by-key')!;
		expect(byKey.targets).toHaveLength(2);
		expect(byKey.targets[0]).toBeInstanceOf(HTMLElement);
		expect(byKey.targets[0]).toBe(controlOf(SkillGetter.fields, 'skillGetter-actor').root);

		wrapper.unmount();
	});

	it('注册表缺失时 initialize 安全 no-op（不再抛错）', () => {
		const saved = ActorGetter.fields;
		ActorGetter.fields = null;
		expect(() => ActorGetter.initialize!()).not.toThrow();
		ActorGetter.fields = saved;
	});
});
