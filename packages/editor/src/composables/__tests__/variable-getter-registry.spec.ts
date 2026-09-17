import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import VariableGetter from '@app/components/tools/VariableGetter.vue';
import VariableGetter2 from '@app/components/tools/VariableGetter2.vue';
import { useVariableGetterWindow } from '@app/composables/useVariableGetterWindow';
import { composableEls } from '@app/composables/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';

/**
 * 窗口注册表回归（P5b 后续批次：`document.getElementById('variableGetter-*')` → `composableEls`）。
 *
 * `useVariableGetterWindow` 原先按 id 直接查 DOM（34 处），现在改读**渲染方登记的**分组注册表。
 * 这条链路一旦断（例如模板漏挂 `:ref="registryRef(composableEls, id)"`），模块侧会静默 no-op
 * ——于是这里断言"注册键 ↔ 元素 id 一致"与"open/initialize 真的调到了注册表里的控件"。
 */
vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

const VARIABLE_GETTER_IDS = [
	'variableGetter-type',
	'variableGetter-actor',
	'variableGetter-skill',
	'variableGetter-state',
	'variableGetter-equipment',
	'variableGetter-item',
	'variableGetter-element',
	'variableGetter-common-key',
	'variableGetter-preset-key',
	'variableGetter-global-key'
];

const VARIABLE_GETTER2_IDS = [
	'variableGetter2-type',
	'variableGetter2-element',
	'variableGetter2-common-key',
	'variableGetter2-preset-key',
	'variableGetter2-global-key'
];

type LoadableEl = HTMLElement & { loadItems?: (items: unknown[]) => void };

const loadItemsOf = (id: string): ReturnType<typeof vi.fn> => {
	const el = composableEls.get(id) as unknown as LoadableEl;
	const spy = vi.fn();
	el.loadItems = spy;
	return spy;
};

const makeTarget = (read?: () => unknown) => ({ dataValue: undefined, read, input: vi.fn() });

describe('变量访问器窗口注册表（P5b 后续批次）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Window.isWindowOpen = vi.fn(() => false);
	});

	it('VariableGetter.vue 登记全部 10 个控件，注册键与元素 id 一致', async () => {
		const wrapper = mount(VariableGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		for (const id of VARIABLE_GETTER_IDS) {
			const el = composableEls.get(id);
			expect(el, `${id} 未登记`).toBeTruthy();
			expect(el?.id).toBe(id);
		}
		expect(VARIABLE_GETTER_IDS).toHaveLength(10);

		wrapper.unmount();
	});

	it('VariableGetter2.vue 登记全部 5 个控件，注册键与元素 id 一致', async () => {
		const wrapper = mount(VariableGetter2, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		for (const id of VARIABLE_GETTER2_IDS) {
			const el = composableEls.get(id);
			expect(el, `${id} 未登记`).toBeTruthy();
			expect(el?.id).toBe(id);
		}

		wrapper.unmount();
	});

	it('initialize 的 relate 目标取自注册表（local → common-key 控件元素）', async () => {
		const wrapper = mount(VariableGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		const typeEl = composableEls.get('variableGetter-type') as unknown as HTMLElement & {
			enableHiddenMode(): { relate(cases: unknown[]): void };
		};
		const relate = vi.fn();
		typeEl.enableHiddenMode = () => ({ relate });

		useVariableGetterWindow().initialize();

		expect(relate).toHaveBeenCalledTimes(1);
		const cases = relate.mock.calls[0][0] as Array<{ case: string; targets: unknown[] }>;
		const local = cases.find((c) => c.case === 'local');
		expect(local?.targets[0]).toBe(composableEls.get('variableGetter-common-key'));
		const actor = cases.find((c) => c.case === 'actor');
		expect(actor?.targets).toEqual([
			composableEls.get('variableGetter-actor'),
			composableEls.get('variableGetter-preset-key')
		]);

		wrapper.unmount();
	});

	it('open 经注册表把类型选项写进控件（链路有效，不是静默 no-op）', async () => {
		const wrapper = mount(VariableGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		const loadItems = loadItemsOf('variableGetter-type');
		useVariableGetterWindow().open(makeTarget(() => ({ type: 'local', key: 'v1' })) as never);

		expect(loadItems).toHaveBeenCalledTimes(1);
		const items = loadItems.mock.calls[0][0] as Array<{ value: string }>;
		expect(items.map((item) => item.value)).toContain('local');
		expect(items.map((item) => item.value)).toContain('element');

		wrapper.unmount();
	});

	it('窗口2 分支只读 variableGetter2 前缀的注册项（两个窗口互不串台）', async () => {
		const wrapper = mount(VariableGetter2, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		const loadItems2 = loadItemsOf('variableGetter2-type');
		Attribute.getDefAttributeId = vi.fn(() => 'atk') as never;
		Attribute.getAttributeItems = vi.fn(() => [{ name: 'ATK', value: 'atk' }]) as never;

		useVariableGetterWindow().open(makeTarget(() => ({ type: 'local', key: '' })) as never, {
			prefix: 'variableGetter2',
			filter: 'object'
		});

		expect(loadItems2).toHaveBeenCalledTimes(1);
		// 窗口 1 未挂载 → 它的注册项不存在；前缀查找不会退回窗口 1 的控件
		expect(composableEls.get('variableGetter-type') ?? null).toBe(null);

		wrapper.unmount();
	});

	it('注册表为空时 initialize / open 安全 no-op（不再有按 id 的隐式回退）', () => {
		for (const id of [...VARIABLE_GETTER_IDS, ...VARIABLE_GETTER2_IDS]) {
			composableEls.set(id, null);
		}
		const variableGetter = useVariableGetterWindow();
		expect(() => variableGetter.initialize()).not.toThrow();
		expect(() =>
			variableGetter.open(makeTarget(() => ({ type: 'local', key: 'v1' })) as never)
		).not.toThrow();
	});
});
