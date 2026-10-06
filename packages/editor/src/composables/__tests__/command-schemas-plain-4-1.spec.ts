import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetBooleanWindow from '@app/components/commands/SetBoolean.vue';
import { Command, initCommandParseBridges } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { useSetBooleanCommandSchema } from '@app/composables/commands/useSetBooleanCommandSchema';
import SetButton from '@app/components/commands/SetButton.vue';
import SetCooldown from '@app/components/commands/SetCooldown.vue';
import { useSetCooldownCommandSchema } from '@app/composables/commands/useSetCooldownCommandSchema';
import { Enum } from '@app/enum/enum-window.ts';
import SetDialogBox from '@app/components/commands/SetDialogBox.vue';
import SetElement from '@app/components/commands/SetElement.vue';
import SetEvent from '@app/components/commands/SetEvent.vue';
import SetFocus from '@app/components/commands/SetFocus.vue';
import SetImage from '@app/components/commands/SetImage.vue';
import SetInventory from '@app/components/commands/SetInventory.vue';
import { useSetInventoryCommandSchema } from '@app/composables/commands/useSetInventoryCommandSchema';
import SetLanguage from '@app/components/commands/SetLanguage.vue';
import { useSetLanguageCommandSchema } from '@app/composables/commands/useSetLanguageCommandSchema';
import { dataItemsOf } from '@app/__tests__/element-data-read';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

{
	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
		input(value: unknown): void;
		filter: string;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	describe('useSetBooleanCommandSchema (setBoolean operand linkage + insert/edit/save paths)', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		const mountWindow = async () => {
			const wrapper = mount(SetBooleanWindow, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			return wrapper;
		};

		it('insert path: CommandSchema.insert opens setBoolean window and loads default form', async () => {
			const wrapper = await mountWindow();
			const { form } = useSetBooleanCommandSchema();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			CommandSchema.insert(target, 'setBoolean');
			expect(Window.open).toHaveBeenCalledWith('setBoolean');
			expect(form.variable).toEqual({ type: 'local', key: '' });
			expect(form.operation).toBe('set');
			expect(form['operand-type']).toBe('constant');
			expect(form['constant-value']).toBe(false);
			wrapper.unmount();
		});

		it('writeHandler switches common-variable filter by operand type', async () => {
			const wrapper = await mountWindow();
			Command.cases.setBoolean.writeHandler!({ value: 'variable' });
			expect(getControl('setBoolean-common-variable').filter).toBe('boolean');
			Command.cases.setBoolean.writeHandler!({ value: 'list' });
			expect(getControl('setBoolean-common-variable').filter).toBe('object');
			Command.cases.setBoolean.writeHandler!({ value: 'constant' });
			expect(getControl('setBoolean-common-variable').filter).toBe('all');
			wrapper.unmount();
		});

		it('edit path: CommandSchema.edit maps params to form, variable/list/parameter/script branches save', async () => {
			const wrapper = await mountWindow();
			const { form } = useSetBooleanCommandSchema();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			const saved = vi.fn();
			Command.save = saved;
			CommandSchema.edit(target, {
				id: 'setBoolean',
				params: {
					variable: { type: 'local', key: 'flag' },
					operation: 'and',
					operand: { type: 'variable', variable: { type: 'local', key: 'other' } }
				}
			});
			expect(Window.open).toHaveBeenCalledWith('setBoolean');
			expect(form['common-variable']).toEqual({ type: 'local', key: 'other' });
			Command.cases.setBoolean.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'flag' },
				operation: 'and',
				operand: { type: 'variable', variable: { type: 'local', key: 'other' } }
			});
			Command.cases.setBoolean.customLoad!({
				variable: { type: 'local', key: 'flag' },
				operation: 'set',
				operand: { type: 'list', variable: { type: 'local', key: 'items' }, index: 2 }
			});
			await wrapper.vm.$nextTick();
			Command.cases.setBoolean.save!();
			expect(saved).toHaveBeenLastCalledWith({
				variable: { type: 'local', key: 'flag' },
				operation: 'set',
				operand: { type: 'list', variable: { type: 'local', key: 'items' }, index: 2 }
			});
			Command.cases.setBoolean.customLoad!({
				variable: { type: 'local', key: 'flag' },
				operation: 'set',
				operand: { type: 'parameter', key: 'mode' }
			});
			await wrapper.vm.$nextTick();
			Command.cases.setBoolean.save!();
			expect(saved).toHaveBeenLastCalledWith({
				variable: { type: 'local', key: 'flag' },
				operation: 'set',
				operand: { type: 'parameter', key: 'mode' }
			});
			Command.cases.setBoolean.customLoad!({
				variable: { type: 'local', key: 'flag' },
				operation: 'set',
				operand: { type: 'script', script: 'isReady()' }
			});
			await wrapper.vm.$nextTick();
			Command.cases.setBoolean.save!();
			expect(saved).toHaveBeenLastCalledWith({
				variable: { type: 'local', key: 'flag' },
				operation: 'set',
				operand: { type: 'script', script: 'isReady()' }
			});
			wrapper.unmount();
		});

		it('save validation: empty variable or unselected operand do not save', async () => {
			const wrapper = await mountWindow();
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setBoolean.customLoad!({
				variable: { type: 'local', key: '' },
				operation: 'set',
				operand: { type: 'constant', value: false }
			});
			await wrapper.vm.$nextTick();
			Command.cases.setBoolean.save!();
			expect(saved).not.toHaveBeenCalled();
			Command.cases.setBoolean.customLoad!({
				variable: { type: 'local', key: 'flag' },
				operation: 'set',
				operand: { type: 'variable', variable: { type: 'local', key: '' } }
			});
			await wrapper.vm.$nextTick();
			Command.cases.setBoolean.save!();
			expect(saved).not.toHaveBeenCalled();
			Command.cases.setBoolean.customLoad!({
				variable: { type: 'local', key: 'flag' },
				operation: 'set',
				operand: { type: 'script', script: '  ' }
			});
			await wrapper.vm.$nextTick();
			Command.cases.setBoolean.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});
	});
}
{
	initCommandParseBridges();

	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetButtonCommandSchema（setButton 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetButton, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setButton');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setButton');
			expect(getControl('setButton-element').read()).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetButton, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setButton',
				params: {
					element: { type: 'trigger' },
					properties: [{ key: 'content', value: 'hi' }]
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setButton');
			expect(getControl('setButton-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('setButton-properties').read()).toEqual([
				{ key: 'content', value: 'hi' }
			]);
			wrapper.unmount();
		});

		it('save 路径：properties 为空时校验失败不保存', async () => {
			const wrapper = mount(SetButton, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setButton.customLoad!({ element: { type: 'trigger' }, properties: [] });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setButton.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：properties 非空时经 Command.cases.setButton.save 保存', async () => {
			const wrapper = mount(SetButton, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setButton.customLoad!({
				element: { type: 'trigger' },
				properties: [{ key: 'content', value: 'hi' }]
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setButton.save!();
			expect(saved).toHaveBeenCalledWith({
				element: { type: 'trigger' },
				properties: [{ key: 'content', value: 'hi' }]
			});
			wrapper.unmount();
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetCooldownCommandSchema（setCooldown 命令表单 composable：form 状态 + insert/edit/save）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Enum.getStringItems = vi.fn(() => [{ name: 'Skill 1', value: 'skill1' }]) as never;
			Enum.getDefStringId = vi.fn(() => 'skill1') as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 operation 选项', async () => {
			const wrapper = mount(SetCooldown, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const operation = document.getElementById('setCooldown-operation') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(dataItemsOf(operation)).toHaveLength(3);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form（v-model 驱动控件）', async () => {
			const wrapper = mount(SetCooldown, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetCooldownCommandSchema();
			CommandSchema.insert(target, 'setCooldown');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setCooldown');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.operation).toBe('set');
			expect(form.key).toBe('skill1');
			expect(form.cooldown).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form（v-model 驱动控件）', async () => {
			const wrapper = mount(SetCooldown, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetCooldownCommandSchema();
			CommandSchema.edit(target, {
				id: 'setCooldown',
				params: {
					actor: { type: 'trigger' },
					operation: 'increase',
					key: 'skill1',
					cooldown: 500
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setCooldown');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.operation).toBe('increase');
			expect(form.key).toBe('skill1');
			expect(form.cooldown).toBe(500);
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.setCooldown.save 保存', async () => {
			const wrapper = mount(SetCooldown, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetCooldownCommandSchema();
			Command.cases.setCooldown.customLoad!({
				actor: { type: 'trigger' },
				operation: 'set',
				key: 'skill1',
				cooldown: 0
			});
			form.operation = 'decrease';
			form.cooldown = 300;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setCooldown.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				operation: 'decrease',
				key: 'skill1',
				cooldown: 300
			});
			wrapper.unmount();
		});
	});
}
{
	initCommandParseBridges();

	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetDialogBoxCommandSchema（setDialogBox 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetDialogBox, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setDialogBox');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setDialogBox');
			expect(getControl('setDialogBox-element').read()).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetDialogBox, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setDialogBox',
				params: {
					element: { type: 'trigger' },
					properties: [{ key: 'content', value: 'hi' }]
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setDialogBox');
			expect(getControl('setDialogBox-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('setDialogBox-properties').read()).toEqual([
				{ key: 'content', value: 'hi' }
			]);
			wrapper.unmount();
		});

		it('save 路径：properties 为空时校验失败不保存', async () => {
			const wrapper = mount(SetDialogBox, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setDialogBox.customLoad!({
				element: { type: 'trigger' },
				properties: []
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setDialogBox.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：properties 非空时经 Command.cases.setDialogBox.save 保存', async () => {
			const wrapper = mount(SetDialogBox, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setDialogBox.customLoad!({
				element: { type: 'trigger' },
				properties: [{ key: 'content', value: 'hi' }]
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setDialogBox.save!();
			expect(saved).toHaveBeenCalledWith({
				element: { type: 'trigger' },
				properties: [{ key: 'content', value: 'hi' }]
			});
			wrapper.unmount();
		});
	});
}
{
	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
		input(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetElementCommandSchema（setElement 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 operation 选项', async () => {
			const wrapper = mount(SetElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const operation = document.getElementById('setElement-operation') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(dataItemsOf(operation)).toHaveLength(7);
			expect(dataItemsOf(operation)!.map((item) => item.value)).toContain('hide');
			expect(dataItemsOf(operation)!.map((item) => item.value)).toContain('move-to-last');
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setElement');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setElement');
			expect(getControl('setElement-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('setElement-operation').read()).toBe('hide');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setElement',
				params: { element: { type: 'trigger' }, operation: 'show' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setElement');
			expect(getControl('setElement-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('setElement-operation').read()).toBe('show');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setElement.save 保存', async () => {
			const wrapper = mount(SetElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setElement.customLoad!({
				element: { type: 'trigger' },
				operation: 'hide'
			});
			getControl('setElement-operation').input('show');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setElement.save!();
			expect(saved).toHaveBeenCalledWith({ element: { type: 'trigger' }, operation: 'show' });
			wrapper.unmount();
		});
	});
}
{
	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
		input(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetEventCommandSchema（setEvent 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口后 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setEvent');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setEvent');
			expect(getControl('setEvent-operation').read()).toBe('stop-propagation');
			expect(getControl('setEvent-variable').read()).toEqual({ type: 'global', key: '' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setEvent',
				params: { operation: 'pause', variable: { type: 'global', key: 'foo' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setEvent');
			expect(getControl('setEvent-operation').read()).toBe('pause');
			expect(getControl('setEvent-variable').read()).toEqual({ type: 'global', key: 'foo' });
			wrapper.unmount();
		});

		it('edit 路径：旧版 operation 值归一化为 stop-propagation', async () => {
			const wrapper = mount(SetEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setEvent',
				params: { operation: 'prevent-scene-input-events' }
			});
			await wrapper.vm.$nextTick();
			expect(getControl('setEvent-operation').read()).toBe('stop-propagation');
			wrapper.unmount();
		});

		it('save 路径：pause 且 variable 为 none 时校验失败不保存', async () => {
			const wrapper = mount(SetEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setEvent.customLoad!({
				operation: 'pause',
				variable: { type: 'local', key: '' }
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setEvent.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：enable 且 eventId 为空时校验失败不保存', async () => {
			const wrapper = mount(SetEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setEvent.customLoad!({ operation: 'enable', eventId: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setEvent.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：goto-choice-branch 经 Command.cases.setEvent.save 保存', async () => {
			const wrapper = mount(SetEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setEvent.customLoad!({ operation: 'goto-choice-branch', choiceIndex: 3 });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setEvent.save!();
			expect(saved).toHaveBeenCalledWith({ operation: 'goto-choice-branch', choiceIndex: 3 });
			wrapper.unmount();
		});
	});
}
{
	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
		input(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetFocusCommandSchema（setFocus 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 operation/mode 选项', async () => {
			const wrapper = mount(SetFocus, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const operation = document.getElementById('setFocus-operation') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const mode = document.getElementById('setFocus-mode') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(dataItemsOf(operation)).toHaveLength(4);
			expect(dataItemsOf(mode)).toHaveLength(2);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetFocus, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setFocus');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setFocus');
			expect(getControl('setFocus-operation').read()).toBe('add');
			expect(getControl('setFocus-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('setFocus-mode').read()).toBe('control-child-buttons');
			expect(getControl('setFocus-cancelable').read()).toBe(true);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetFocus, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setFocus',
				params: {
					operation: 'remove',
					element: { type: 'player' }
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setFocus');
			expect(getControl('setFocus-operation').read()).toBe('remove');
			expect(getControl('setFocus-element').read()).toEqual({ type: 'player' });
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setFocus.save 保存', async () => {
			const wrapper = mount(SetFocus, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setFocus.customLoad!({
				operation: 'add',
				element: { type: 'trigger' },
				mode: 'control-child-buttons',
				cancelable: true
			});
			getControl('setFocus-operation').input('remove');
			getControl('setFocus-element').input({ type: 'player' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setFocus.save!();
			expect(saved).toHaveBeenCalledWith({
				operation: 'remove',
				element: { type: 'player' }
			});
			wrapper.unmount();
		});

		it('save 路径：remove-latest/reset 只保存 operation', async () => {
			const wrapper = mount(SetFocus, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setFocus.customLoad!({
				operation: 'reset',
				element: { type: 'trigger' },
				mode: 'control-child-buttons',
				cancelable: true
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setFocus.save!();
			expect(saved).toHaveBeenCalledWith({ operation: 'reset' });
			wrapper.unmount();
		});
	});
}
{
	initCommandParseBridges();

	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetImageCommandSchema（setImage 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setImage');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setImage');
			expect(getControl('setImage-element').read()).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setImage',
				params: {
					element: { type: 'trigger' },
					properties: [{ key: 'content', value: 'hi' }]
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setImage');
			expect(getControl('setImage-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('setImage-properties').read()).toEqual([
				{ key: 'content', value: 'hi' }
			]);
			wrapper.unmount();
		});

		it('save 路径：properties 为空时校验失败不保存', async () => {
			const wrapper = mount(SetImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setImage.customLoad!({ element: { type: 'trigger' }, properties: [] });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setImage.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：properties 非空时经 Command.cases.setImage.save 保存', async () => {
			const wrapper = mount(SetImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setImage.customLoad!({
				element: { type: 'trigger' },
				properties: [{ key: 'content', value: 'hi' }]
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setImage.save!();
			expect(saved).toHaveBeenCalledWith({
				element: { type: 'trigger' },
				properties: [{ key: 'content', value: 'hi' }]
			});
			wrapper.unmount();
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetInventoryCommandSchema（setInventory 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		const mountWindow = async () => {
			const wrapper = mount(SetInventory, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			return wrapper;
		};

		it('onMounted loadItems 填充 operation 选项', async () => {
			const wrapper = await mountWindow();
			const operation = document.getElementById('setInventory-operation') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(dataItemsOf(operation)).toHaveLength(14);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = await mountWindow();
			const { form } = useSetInventoryCommandSchema();
			CommandSchema.insert(target, 'setInventory');
			expect(Window.open).toHaveBeenCalledWith('setInventory');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.operation).toBe('increase-money');
			expect(form.money).toBe(1);
			expect(form.quantity).toBe(1);
			expect(form.order1).toBe(0);
			expect(form.order2).toBe(1);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = await mountWindow();
			const { form } = useSetInventoryCommandSchema();
			CommandSchema.edit(target, {
				id: 'setInventory',
				params: {
					actor: { type: 'player' },
					operation: 'swap',
					order1: 3,
					order2: 7
				}
			});
			expect(Window.open).toHaveBeenCalledWith('setInventory');
			expect(form.operation).toBe('swap');
			expect(form.order1).toBe(3);
			expect(form.order2).toBe(7);
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.setInventory.save 保存', async () => {
			const wrapper = await mountWindow();
			const { form } = useSetInventoryCommandSchema();
			Command.cases.setInventory.customLoad!({
				actor: { type: 'trigger' },
				operation: 'increase-money',
				money: 1
			});
			form.operation = 'increase-items';
			form.itemId = 'item1';
			form.quantity = 5;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setInventory.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				operation: 'increase-items',
				itemId: 'item1',
				quantity: 5
			});
			wrapper.unmount();
		});

		it('save 路径：increase-items 空 itemId 校验失败不保存', async () => {
			const wrapper = await mountWindow();
			useSetInventoryCommandSchema();
			Command.cases.setInventory.customLoad!({
				actor: { type: 'trigger' },
				operation: 'increase-items',
				itemId: '',
				quantity: 1
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setInventory.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetLanguageCommandSchema（setLanguage 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetLanguage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetLanguageCommandSchema();
			CommandSchema.insert(target, 'setLanguage');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setLanguage');
			expect(form.language).toBe('auto');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetLanguage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetLanguageCommandSchema();
			CommandSchema.edit(target, { id: 'setLanguage', params: { language: 'en' } });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setLanguage');
			expect(form.language).toBe('en');
			wrapper.unmount();
		});

		it('save 路径：customLoad 未传 language 时使用默认 auto，改 form 后保存', async () => {
			const wrapper = mount(SetLanguage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetLanguageCommandSchema();
			Command.cases.setLanguage.customLoad!({});
			form.language = 'zh-CN';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setLanguage.save!();
			expect(saved).toHaveBeenCalledWith({ language: 'zh-CN' });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 language 文本', () => {
			const contents = Command.cases.setLanguage.parse!({ language: 'en' });
			expect(contents[0]).toEqual({ color: 'system' });
			expect(contents[1].text).toContain('command.setLanguage');
			expect(contents[2].text).toBe('languages.en');
		});
	});
}
