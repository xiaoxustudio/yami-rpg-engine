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
import SetObjectAnimation from '@app/components/commands/SetObjectAnimation.vue';
import { Data } from '@app/data/data-object.ts';
import SetObject from '@app/components/commands/SetObject.vue';
import SetPan from '@app/components/commands/SetPan.vue';
import { useSetPanCommandSchema } from '@app/composables/commands/useSetPanCommandSchema';
import SetProgressBar from '@app/components/commands/SetProgressBar.vue';
import SetResolution from '@app/components/commands/SetResolution.vue';
import { useSetResolutionCommandSchema } from '@app/composables/commands/useSetResolutionCommandSchema';
import SetReverb from '@app/components/commands/SetReverb.vue';
import { useSetReverbCommandSchema } from '@app/composables/commands/useSetReverbCommandSchema';
import SetShortcut from '@app/components/commands/SetShortcut.vue';
import SetSkill from '@app/components/commands/SetSkill.vue';
import { useSetSkillCommandSchema } from '@app/composables/commands/useSetSkillCommandSchema';
import SetState from '@app/components/commands/SetState.vue';
import { useSetStateCommandSchema } from '@app/composables/commands/useSetStateCommandSchema';
import SetString from '@app/components/commands/SetString.vue';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
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
			expect(operation.dataItems).toHaveLength(3);
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
			expect(operation.dataItems).toHaveLength(7);
			expect(operation.dataItems!.map((item) => item.value)).toContain('hide');
			expect(operation.dataItems!.map((item) => item.value)).toContain('move-to-last');
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setElement');
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
			expect(operation.dataItems).toHaveLength(4);
			expect(mode.dataItems).toHaveLength(2);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetFocus, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setFocus');
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
			expect(operation.dataItems).toHaveLength(14);
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
			const { form } = useSetInventoryCommandSchema();
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

	describe('useSetObjectAnimationCommandSchema（setObjectAnimation 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 sort/operation/wait 选项', async () => {
			const wrapper = mount(SetObjectAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const sort = document.getElementById('setObjectAnimation-sort') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const operation = document.getElementById(
				'setObjectAnimation-operation'
			) as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const wait = document.getElementById('setObjectAnimation-wait') as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			expect(sort.dataItems).toHaveLength(4);
			expect(operation.dataItems).toHaveLength(6);
			expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetObjectAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setObjectAnimation');
			expect(Window.open).toHaveBeenCalledWith('setObjectAnimation');
			expect(getControl('setObjectAnimation-sort').read()).toBe('actor');
			expect(getControl('setObjectAnimation-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('setObjectAnimation-operation').read()).toBe('set-tint');
			expect(getControl('setObjectAnimation-tint-0').read()).toBe(0);
			expect(getControl('setObjectAnimation-easingId').read()).toBe('easing0');
			expect(getControl('setObjectAnimation-duration').read()).toBe(0);
			expect(getControl('setObjectAnimation-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetObjectAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setObjectAnimation',
				params: {
					sort: 'trigger',
					object: { type: 'player' },
					operation: 'set-opacity',
					opacity: 0.5,
					easingId: 'e2',
					duration: 500,
					wait: true
				}
			});
			expect(Window.open).toHaveBeenCalledWith('setObjectAnimation');
			expect(getControl('setObjectAnimation-sort').read()).toBe('trigger');
			expect(getControl('setObjectAnimation-trigger').read()).toEqual({ type: 'player' });
			expect(getControl('setObjectAnimation-operation').read()).toBe('set-opacity');
			expect(getControl('setObjectAnimation-opacity').read()).toBe(0.5);
			expect(getControl('setObjectAnimation-duration').read()).toBe(500);
			expect(getControl('setObjectAnimation-wait').read()).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setObjectAnimation.save 保存', async () => {
			const wrapper = mount(SetObjectAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setObjectAnimation.customLoad!({
				sort: 'actor',
				object: { type: 'trigger' },
				operation: 'set-tint',
				tint: [0, 0, 0, 0],
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			getControl('setObjectAnimation-operation').input('set-rgb');
			getControl('setObjectAnimation-tint-0').write(10);
			getControl('setObjectAnimation-tint-1').write(20);
			getControl('setObjectAnimation-tint-2').write(30);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setObjectAnimation.save!();
			expect(saved).toHaveBeenCalledWith({
				sort: 'actor',
				object: { type: 'trigger' },
				operation: 'set-rgb',
				tint: [10, 20, 30, 0],
				easingId: 'easing0',
				duration: 0,
				wait: false
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

	describe('useSetObjectCommandSchema（setObject 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 operand-type 选项', async () => {
			const wrapper = mount(SetObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const type = document.getElementById('setObject-operand-type') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(type.dataItems).toHaveLength(12);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setObject');
			expect(Window.open).toHaveBeenCalledWith('setObject');
			expect(getControl('setObject-variable').read()).toEqual({ type: 'local', key: '' });
			expect(getControl('setObject-operand-type').read()).toBe('none');
			expect(getControl('setObject-operand-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('setObject-operand-variable').read()).toEqual({
				type: 'local',
				key: ''
			});
			expect(getControl('setObject-operand-list-index').read()).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 operand 到控件 DOM', async () => {
			const wrapper = mount(SetObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setObject',
				params: {
					variable: { type: 'local', key: 'obj' },
					operand: { type: 'list', variable: { type: 'local', key: 'list1' }, index: 3 }
				}
			});
			expect(Window.open).toHaveBeenCalledWith('setObject');
			expect(getControl('setObject-variable').read()).toEqual({ type: 'local', key: 'obj' });
			expect(getControl('setObject-operand-type').read()).toBe('list');
			expect(getControl('setObject-operand-variable').read()).toEqual({
				type: 'local',
				key: 'list1'
			});
			expect(getControl('setObject-operand-list-index').read()).toBe(3);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setObject.save 保存', async () => {
			const wrapper = mount(SetObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setObject.customLoad!({
				variable: { type: 'local', key: 'obj' },
				operand: { type: 'none' }
			});
			getControl('setObject-operand-type').input('actor');
			getControl('setObject-operand-actor').input({ type: 'player' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setObject.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'obj' },
				operand: { type: 'actor', actor: { type: 'player' } }
			});
			wrapper.unmount();
		});

		it('save 路径：variable 为 none 校验失败不保存', async () => {
			const wrapper = mount(SetObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setObject.customLoad!({
				variable: { type: 'none', key: '' },
				operand: { type: 'none' }
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setObject.save!();
			expect(saved).not.toHaveBeenCalled();
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

	describe('useSetPanCommandSchema（setPan 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 type/wait 选项', async () => {
			const wrapper = mount(SetPan, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const type = document.getElementById('setPan-type') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const wait = document.getElementById('setPan-wait') as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			expect(type.dataItems).toHaveLength(4);
			expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetPan, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setPan');
			expect(Window.open).toHaveBeenCalledWith('setPan');
			expect(getControl('setPan-type').read()).toBe('bgm');
			expect(getControl('setPan-pan').read()).toBe(0);
			expect(getControl('setPan-easingId').read()).toBe('easing0');
			expect(getControl('setPan-duration').read()).toBe(0);
			expect(getControl('setPan-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetPan, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setPan',
				params: { type: 'se', pan: -0.5, easingId: 'e2', duration: 300, wait: true }
			});
			expect(Window.open).toHaveBeenCalledWith('setPan');
			expect(getControl('setPan-type').read()).toBe('se');
			expect(getControl('setPan-pan').read()).toBe(-0.5);
			expect(getControl('setPan-easingId').read()).toBe('e2');
			expect(getControl('setPan-duration').read()).toBe(300);
			expect(getControl('setPan-wait').read()).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setPan.save 保存', async () => {
			const wrapper = mount(SetPan, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetPanCommandSchema();
			Command.cases.setPan.customLoad!({
				type: 'bgm',
				pan: 0,
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			form.type = 'cv';
			form.pan = 0.5;
			form.duration = 500;
			form.wait = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setPan.save!();
			expect(saved).toHaveBeenCalledWith({
				type: 'cv',
				pan: 0.5,
				easingId: 'easing0',
				duration: 500,
				wait: true
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

	describe('useSetProgressBarCommandSchema（setProgressBar 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetProgressBar, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setProgressBar');
			expect(Window.open).toHaveBeenCalledWith('setProgressBar');
			expect(getControl('setProgressBar-element').read()).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetProgressBar, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setProgressBar',
				params: {
					element: { type: 'trigger' },
					properties: [{ key: 'content', value: 'hi' }]
				}
			});
			expect(Window.open).toHaveBeenCalledWith('setProgressBar');
			expect(getControl('setProgressBar-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('setProgressBar-properties').read()).toEqual([
				{ key: 'content', value: 'hi' }
			]);
			wrapper.unmount();
		});

		it('save 路径：properties 为空时校验失败不保存', async () => {
			const wrapper = mount(SetProgressBar, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setProgressBar.customLoad!({
				element: { type: 'trigger' },
				properties: []
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setProgressBar.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：properties 非空时经 Command.cases.setProgressBar.save 保存', async () => {
			const wrapper = mount(SetProgressBar, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setProgressBar.customLoad!({
				element: { type: 'trigger' },
				properties: [{ key: 'content', value: 'hi' }]
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setProgressBar.save!();
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

	const words: string[] = [];
	const setWords = (): void => {
		words.length = 0;
		Command.words = {
			push: (value: string) => {
				words.push(value);
				return Command.words;
			},
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
	};

	describe('useSetResolutionCommandSchema（setResolution 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetResolution, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetResolutionCommandSchema();
			CommandSchema.insert(target, 'setResolution');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setResolution');
			expect(form.width).toBe(1920);
			expect(form.height).toBe(1080);
			expect(form.sceneScale).toBe(1);
			expect(form.uiScale).toBe(1);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetResolution, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetResolutionCommandSchema();
			CommandSchema.edit(target, {
				id: 'setResolution',
				params: { width: 2560, height: 1440, sceneScale: 0.5, uiScale: 2 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setResolution');
			expect(form.width).toBe(2560);
			expect(form.height).toBe(1440);
			expect(form.sceneScale).toBe(0.5);
			expect(form.uiScale).toBe(2);
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.setResolution.save 保存', async () => {
			const wrapper = mount(SetResolution, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetResolutionCommandSchema();
			Command.cases.setResolution.customLoad!({
				width: 1920,
				height: 1080,
				sceneScale: 1,
				uiScale: 1
			});
			form.width = 3840;
			form.sceneScale = 0.5;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setResolution.save!();
			expect(saved).toHaveBeenCalledWith({
				width: 3840,
				height: 1080,
				sceneScale: 0.5,
				uiScale: 1
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染分辨率 + 缩放文本', () => {
			setWords();
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
			const contents = Command.cases.setResolution.parse!({
				width: 1920,
				height: 1080,
				sceneScale: 1,
				uiScale: 1
			});
			const text = (contents[2] as { text: string }).text;
			expect(text).toContain('N:1920');
			expect(text).toContain('N:1080');
			expect(text).toContain('N:1');
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

	describe('useSetReverbCommandSchema（setReverb 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 type/wait 选项', async () => {
			const wrapper = mount(SetReverb, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const type = document.getElementById('setReverb-type') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const wait = document.getElementById('setReverb-wait') as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			expect(type.dataItems!.map((item) => item.value)).toEqual(['bgm', 'bgs', 'cv', 'se']);
			expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetReverb, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setReverb');
			expect(Window.open).toHaveBeenCalledWith('setReverb');
			expect(getControl('setReverb-type').read()).toBe('bgm');
			expect(getControl('setReverb-dry').read()).toBe(1);
			expect(getControl('setReverb-wet').read()).toBe(0);
			expect(getControl('setReverb-easingId').read()).toBe('easing0');
			expect(getControl('setReverb-duration').read()).toBe(0);
			expect(getControl('setReverb-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetReverb, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setReverb',
				params: {
					type: 'se',
					dry: 0.5,
					wet: 0.3,
					easingId: 'e2',
					duration: 400,
					wait: true
				}
			});
			expect(Window.open).toHaveBeenCalledWith('setReverb');
			expect(getControl('setReverb-type').read()).toBe('se');
			expect(getControl('setReverb-dry').read()).toBe(0.5);
			expect(getControl('setReverb-wet').read()).toBe(0.3);
			expect(getControl('setReverb-easingId').read()).toBe('e2');
			expect(getControl('setReverb-duration').read()).toBe(400);
			expect(getControl('setReverb-wait').read()).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setReverb.save 保存', async () => {
			const wrapper = mount(SetReverb, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetReverbCommandSchema();
			Command.cases.setReverb.customLoad!({
				type: 'bgm',
				dry: 1,
				wet: 0,
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			form.type = 'cv';
			form.dry = 0.8;
			form.duration = 500;
			form.wait = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setReverb.save!();
			expect(saved).toHaveBeenCalledWith({
				type: 'cv',
				dry: 0.8,
				wet: 0,
				easingId: 'easing0',
				duration: 500,
				wait: true
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

	describe('useSetShortcutCommandSchema（setShortcut 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Enum.getStringItems = vi.fn(() => [
				{ name: 'Key 1', value: 'key1' },
				{ name: 'Key 2', value: 'key2' }
			]) as never;
			Enum.getDefStringId = vi.fn(() => 'key1') as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 operation 选项', async () => {
			const wrapper = mount(SetShortcut, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const operation = document.getElementById('setShortcut-operation') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(operation.dataItems).toHaveLength(4);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetShortcut, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setShortcut');
			expect(Window.open).toHaveBeenCalledWith('setShortcut');
			expect(getControl('setShortcut-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('setShortcut-operation').read()).toBe('set-item-shortcut');
			expect(getControl('setShortcut-key').read()).toBe('key1');
			expect(getControl('setShortcut-key2').read()).toBe('key1');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetShortcut, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setShortcut',
				params: {
					actor: { type: 'player' },
					operation: 'swap-shortcuts',
					key: 'key1',
					key2: 'key2'
				}
			});
			expect(Window.open).toHaveBeenCalledWith('setShortcut');
			expect(getControl('setShortcut-operation').read()).toBe('swap-shortcuts');
			expect(getControl('setShortcut-key').read()).toBe('key1');
			expect(getControl('setShortcut-key2').read()).toBe('key2');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setShortcut.save 保存', async () => {
			const wrapper = mount(SetShortcut, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setShortcut.customLoad!({
				actor: { type: 'trigger' },
				operation: 'set-item-shortcut',
				itemId: 'item1',
				key: 'key1'
			});
			getControl('setShortcut-operation').input('set-skill-shortcut');
			getControl('setShortcut-skillId').write('skill1');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setShortcut.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				operation: 'set-skill-shortcut',
				key: 'key1',
				skillId: 'skill1'
			});
			wrapper.unmount();
		});

		it('save 路径：key 为空校验失败不保存', async () => {
			const wrapper = mount(SetShortcut, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setShortcut.customLoad!({
				actor: { type: 'trigger' },
				operation: 'delete-shortcut',
				key: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setShortcut.save!();
			expect(saved).not.toHaveBeenCalled();
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

	const words: string[] = [];
	const setWords = (): void => {
		words.length = 0;
		Command.words = {
			push: (value: string) => {
				words.push(value);
				return Command.words;
			},
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
	};

	describe('useSetSkillCommandSchema（setSkill 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetSkill, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetSkillCommandSchema();
			CommandSchema.insert(target, 'setSkill');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setSkill');
			expect(form.skill).toEqual({ type: 'trigger' });
			expect(form.operation).toBe('set-cooldown');
			expect(form.cooldown).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetSkill, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetSkillCommandSchema();
			CommandSchema.edit(target, {
				id: 'setSkill',
				params: { skill: { type: 'player' }, operation: 'decrease-cooldown', cooldown: 200 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setSkill');
			expect(form.skill).toEqual({ type: 'player' });
			expect(form.operation).toBe('decrease-cooldown');
			expect(form.cooldown).toBe(200);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setSkill.save 保存', async () => {
			const wrapper = mount(SetSkill, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setSkill.customLoad!({
				skill: { type: 'trigger' },
				operation: 'set-cooldown',
				cooldown: 0
			});
			getControl('setSkill-skill').write({ type: 'player' });
			getControl('setSkill-cooldown').write(500);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setSkill.save!();
			expect(saved).toHaveBeenCalledWith({
				skill: { type: 'player' },
				operation: 'set-cooldown',
				cooldown: 500
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 skill + 操作文本', () => {
			setWords();
			Command.parseSkill = vi.fn((s: { type: string }) => `SK:${s.type}`) as never;
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
			const contents = Command.cases.setSkill.parse!({
				skill: { type: 'trigger' },
				operation: 'set-cooldown',
				cooldown: 300
			});
			const text = (contents[2] as { text: string }).text;
			expect(text).toContain('SK:trigger');
			expect(text).toContain('set-cooldown');
			expect(text).toContain('N:300');
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	const words: string[] = [];
	const setWords = (): void => {
		words.length = 0;
		Command.words = {
			push: (value: string) => {
				words.push(value);
				return Command.words;
			},
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
	};

	describe('useSetStateCommandSchema（setState 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetState, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetStateCommandSchema();
			CommandSchema.insert(target, 'setState');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setState');
			expect(form.state).toEqual({ type: 'trigger' });
			expect(form.operation).toBe('set-time');
			expect(form.time).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetState, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetStateCommandSchema();
			CommandSchema.edit(target, {
				id: 'setState',
				params: { state: { type: 'player' }, operation: 'increase-time', time: 500 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setState');
			expect(form.state).toEqual({ type: 'player' });
			expect(form.operation).toBe('increase-time');
			expect(form.time).toBe(500);
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.setState.save 保存', async () => {
			const wrapper = mount(SetState, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetStateCommandSchema();
			Command.cases.setState.customLoad!({
				state: { type: 'trigger' },
				operation: 'set-time',
				time: 0
			});
			form.operation = 'decrease-time';
			form.time = 400;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setState.save!();
			expect(saved).toHaveBeenCalledWith({
				state: { type: 'trigger' },
				operation: 'decrease-time',
				time: 400
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 state + 操作文本', () => {
			setWords();
			Command.parseState = vi.fn((s: { type: string }) => `ST:${s.type}`) as never;
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
			const contents = Command.cases.setState.parse!({
				state: { type: 'trigger' },
				operation: 'set-time',
				time: 0
			});
			const text = (contents[2] as { text: string }).text;
			expect(text).toContain('ST:trigger');
			expect(text).toContain('set-time');
			expect(text).toContain('N:0');
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

	describe('useSetStringCommandSchema（setString 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 operand-type 选项', async () => {
			const wrapper = mount(SetString, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const type = document.getElementById('setString-operand-type') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(type.dataItems).toHaveLength(12);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetString, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setString');
			expect(Window.open).toHaveBeenCalledWith('setString');
			expect(getControl('setString-variable').read()).toEqual({ type: 'local', key: '' });
			expect(getControl('setString-operation').read()).toBe('set');
			expect(getControl('setString-operand-type').read()).toBe('constant');
			expect(getControl('setString-operand-common-value').read()).toBe('');
			expect(getControl('setString-operand-common-actor').read()).toEqual({
				type: 'trigger'
			});
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 operand 到控件 DOM', async () => {
			const wrapper = mount(SetString, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setString',
				params: {
					variable: { type: 'local', key: 'foo' },
					operation: 'add',
					operand: {
						type: 'string',
						method: 'slice',
						variable: { type: 'global', key: 'bar' },
						begin: 1,
						end: 3
					}
				}
			});
			expect(Window.open).toHaveBeenCalledWith('setString');
			expect(getControl('setString-variable').read()).toEqual({ type: 'local', key: 'foo' });
			expect(getControl('setString-operation').read()).toBe('add');
			expect(getControl('setString-operand-type').read()).toBe('string');
			expect(getControl('setString-operand-string-method').read()).toBe('slice');
			expect(getControl('setString-operand-common-variable').read()).toEqual({
				type: 'global',
				key: 'bar'
			});
			expect(getControl('setString-operand-string-slice-begin').read()).toBe(1);
			expect(getControl('setString-operand-string-slice-end').read()).toBe(3);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setString.save 保存', async () => {
			const wrapper = mount(SetString, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setString.customLoad!({
				variable: { type: 'local', key: 'foo' },
				operation: 'add',
				operand: {
					type: 'string',
					method: 'slice',
					variable: { type: 'global', key: 'bar' },
					begin: 1,
					end: 3
				}
			});
			getControl('setString-operand-string-method').input('char');
			getControl('setString-operand-string-char-index').write(7);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setString.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'foo' },
				operation: 'add',
				operand: {
					type: 'string',
					method: 'char',
					variable: { type: 'global', key: 'bar' },
					index: 7
				}
			});
			wrapper.unmount();
		});

		it('save 路径：variable 为 none 校验失败不保存', async () => {
			const wrapper = mount(SetString, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setString.customLoad!({
				variable: { type: 'none', key: '' },
				operation: 'set',
				operand: { type: 'constant', value: 'x' }
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setString.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：replace pattern 为空校验失败不保存', async () => {
			const wrapper = mount(SetString, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setString.customLoad!({
				variable: { type: 'local', key: 'foo' },
				operation: 'set',
				operand: {
					type: 'string',
					method: 'replace',
					variable: { type: 'global', key: 'bar' },
					pattern: '',
					replacement: 'cd'
				}
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setString.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});
	});
}
