import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import GetObjectProperty from '@app/components/commands/GetObjectProperty.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ParamListElement extends HTMLElement {
	read(): unknown[] | null;
	write(data: unknown[]): void;
}

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getList = (id: string): ParamListElement =>
	document.getElementById(id) as unknown as ParamListElement;
const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useGetObjectPropertyCommandSchema（getObjectProperty 命令表单 composable 收尾：insert/save/校验路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(GetObjectProperty, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'getObjectProperty');
		expect(Window.open).toHaveBeenCalledWith('getObjectProperty');
		expect(getControl('getObjectProperty-variable').read()).toEqual({ type: 'local', key: '' });
		expect(getControl('getObjectProperty-save-variable').read()).toEqual({
			type: 'local',
			key: ''
		});
		expect(getList('getObjectProperty-list').read()).toEqual([]);
		wrapper.unmount();
	});

	it('save 路径：properties 非空时保存 variable/saveVariable/properties', async () => {
		const wrapper = mount(GetObjectProperty, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getObjectProperty.customLoad!({
			variable: { type: 'local', key: 'obj' },
			saveVariable: { type: 'local', key: 'out' },
			properties: []
		});
		getControl('getObjectProperty-variable').write({ type: 'global', key: 'g' });
		getList('getObjectProperty-list').write([{ text: 'x' }, { text: 'y' }]);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getObjectProperty.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'global', key: 'g' },
			saveVariable: { type: 'local', key: 'out' },
			properties: [{ text: 'x' }, { text: 'y' }]
		});
		wrapper.unmount();
	});

	it('save 路径：空 properties 校验失败不保存', async () => {
		const wrapper = mount(GetObjectProperty, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getObjectProperty.customLoad!({
			variable: { type: 'local', key: 'obj' },
			saveVariable: { type: 'local', key: 'out' },
			properties: []
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getObjectProperty.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：variable 无效校验失败不保存', async () => {
		const wrapper = mount(GetObjectProperty, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getObjectProperty.customLoad!({
			variable: { type: 'local', key: '' },
			saveVariable: { type: 'local', key: 'out' },
			properties: [{ text: 'x' }]
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getObjectProperty.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
