import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ActivateScene from '@app/components/commands/ActivateScene.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';
import AddAnimationComponent from '@app/components/commands/AddAnimationComponent.vue';
import { useAddAnimationComponentCommandSchema } from '@app/composables/commands/useAddAnimationComponentCommandSchema';
import AppendTarget from '@app/components/commands/AppendTarget.vue';
import { useAppendTargetCommandSchema } from '@app/composables/commands/useAppendTargetCommandSchema';
import Block from '@app/components/commands/Block.vue';
import { useBlockCommandSchema } from '@app/composables/commands/useBlockCommandSchema';
import CallEvent from '@app/components/commands/CallEvent.vue';
import { Data } from '@app/data/data-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import CastSkill from '@app/components/commands/CastSkill.vue';
import { useCastSkillCommandSchema } from '@app/composables/commands/useCastSkillCommandSchema';
import ChangeActorAnimation from '@app/components/commands/ChangeActorAnimation.vue';
import { useChangeActorAnimationCommandSchema } from '@app/composables/commands/useChangeActorAnimationCommandSchema';
import ChangeActorEquipment from '@app/components/commands/ChangeActorEquipment.vue';
import { useChangeActorEquipmentCommandSchema } from '@app/composables/commands/useChangeActorEquipmentCommandSchema';
import ChangeActorMotion from '@app/components/commands/ChangeActorMotion.vue';
import { useChangeActorMotionCommandSchema } from '@app/composables/commands/useChangeActorMotionCommandSchema';
import { GameLocal } from '@app/local/local-object.ts';
import ChangeActorPortrait from '@app/components/commands/ChangeActorPortrait.vue';
import '@app/animation/register.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

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

	describe('useActivateSceneCommandSchema（activateScene 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(ActivateScene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'activateScene');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('activateScene');
			expect(getControl('activateScene-pointer').read()).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(ActivateScene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, { id: 'activateScene', params: { pointer: 1 } });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('activateScene');
			expect(getControl('activateScene-pointer').read()).toBe(1);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.activateScene.save 保存', async () => {
			const wrapper = mount(ActivateScene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.activateScene.customLoad!({ pointer: 0 });
			getControl('activateScene-pointer').input(1);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.activateScene.save!();
			expect(saved).toHaveBeenCalledWith({ pointer: 1 });
			wrapper.unmount();
		});
	});
}
{
	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
		write2(value: unknown): void;
		input(value: unknown): void;
		loadItems(items: unknown[]): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useAddAnimationComponentCommandSchema（addAnimationComponent 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 rotatable/syncAngle 选项', async () => {
			const wrapper = mount(AddAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const rotatable = document.getElementById(
				'addAnimationComponent-rotatable'
			) as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			const syncAngle = document.getElementById(
				'addAnimationComponent-syncAngle'
			) as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			expect(rotatable.dataItems!.map((item) => item.value)).toEqual([true, false]);
			expect(syncAngle.dataItems!.map((item) => item.value)).toEqual([true, false]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(AddAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'addAnimationComponent');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('addAnimationComponent');
			expect(getControl('addAnimationComponent-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('addAnimationComponent-animationId').read()).toBe('');
			expect(getControl('addAnimationComponent-motion').read()).toBe('');
			expect(getControl('addAnimationComponent-rotatable').read()).toBe(false);
			expect(getControl('addAnimationComponent-syncAngle').read()).toBe(false);
			expect(getControl('addAnimationComponent-priority').read()).toBe(0);
			expect(getControl('addAnimationComponent-offsetY').read()).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(AddAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'addAnimationComponent',
				params: {
					actor: { type: 'trigger' },
					animationId: 'anim1.json',
					motion: 'run',
					rotatable: true,
					syncAngle: false,
					priority: 2,
					offsetY: 5
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('addAnimationComponent');
			expect(getControl('addAnimationComponent-animationId').read()).toBe('anim1.json');
			expect(getControl('addAnimationComponent-motion').read()).toBe('run');
			expect(getControl('addAnimationComponent-rotatable').read()).toBe(true);
			expect(getControl('addAnimationComponent-syncAngle').read()).toBe(false);
			expect(getControl('addAnimationComponent-priority').read()).toBe(2);
			expect(getControl('addAnimationComponent-offsetY').read()).toBe(5);
			wrapper.unmount();
		});

		it('writeHandler 路径：animationId 变化时刷新 motion 列表', async () => {
			const wrapper = mount(AddAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { writeHandler } = useAddAnimationComponentCommandSchema();
			writeHandler({ value: 'anim1.json' });
			const motion = getControl('addAnimationComponent-motion');
			expect(motion.loadItems).toBeDefined();
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.addAnimationComponent.save 保存', async () => {
			const wrapper = mount(AddAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useAddAnimationComponentCommandSchema();
			Command.cases.addAnimationComponent.customLoad!({
				actor: { type: 'trigger' },
				animationId: 'anim1.json',
				motion: 'idle',
				rotatable: false,
				syncAngle: false,
				priority: 0,
				offsetY: 0
			});
			form.priority = 3;
			form.offsetY = -2;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.addAnimationComponent.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				animationId: 'anim1.json',
				motion: 'idle',
				rotatable: false,
				syncAngle: false,
				priority: 3,
				offsetY: -2
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

	describe('useAppendTargetCommandSchema（appendTarget 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form（actor/target 默认 trigger）', async () => {
			const wrapper = mount(AppendTarget, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useAppendTargetCommandSchema();
			CommandSchema.insert(target, 'appendTarget');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('appendTarget');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.target).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(AppendTarget, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useAppendTargetCommandSchema();
			CommandSchema.edit(target, {
				id: 'appendTarget',
				params: { actor: { type: 'player' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('appendTarget');
			expect(form.actor).toEqual({ type: 'player' });
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.appendTarget.save 保存', async () => {
			const wrapper = mount(AppendTarget, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useAppendTargetCommandSchema();
			Command.cases.appendTarget.customLoad!({
				actor: { type: 'trigger' },
				target: { type: 'trigger' }
			});
			form.target = { type: 'player' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.appendTarget.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				target: { type: 'player' }
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor + target 文本', () => {
			setWords();
			Command.parseActor = vi.fn(
				(a: unknown) => `A:${(a as { type: string }).type}`
			) as never;
			const contents = Command.cases.appendTarget.parse!({
				actor: { type: 'trigger' },
				target: { type: 'player' }
			});
			expect(contents).toContainEqual({ text: 'A:triggerA:player' });
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

	describe('useBlockCommandSchema（block 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form（note 空、asynchronous false）', async () => {
			const wrapper = mount(Block, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useBlockCommandSchema();
			CommandSchema.insert(target, 'block');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('block');
			expect(form.note).toBe('');
			expect(form.asynchronous).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form 与控件 DOM', async () => {
			const wrapper = mount(Block, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'block',
				params: { note: 'note', asynchronous: true }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('block');
			expect(wrapper.vm.form.note).toBe('note');
			expect(wrapper.vm.form.asynchronous).toBe(true);
			expect(getControl('block-note').read()).toBe('note');
			wrapper.unmount();
		});

		it('save 路径：note 经 onSave 收集并保存（asynchronous 来自控件）', async () => {
			const wrapper = mount(Block, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.block.customLoad!({ note: 'hello', asynchronous: false });
			wrapper.vm.form.note = 'hello ';
			getControl('block-asynchronous').input(true);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.block.customSave!();
			expect(saved).toHaveBeenCalledWith({
				note: 'hello',
				asynchronous: true,
				commands: []
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 note 与子命令块', () => {
			setWords();
			const contents = Command.cases.block.parse!({
				note: 'x',
				asynchronous: false,
				commands: []
			});
			expect(contents).toHaveLength(6);
			expect(contents[0]).toEqual({ fold: true });
			expect(contents[1]).toHaveProperty('color');
			expect(contents[5]).toHaveProperty('text');
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

	describe('useCallEventCommandSchema（callEvent 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
			Enum.getMergedItems = vi.fn(() => [{ name: 'On Start', value: 'onStart' }]) as never;
			EventEditor.types = { all: [{ name: 'On Start', value: 'onStart' }] };
		});

		it('onMounted loadItems 填充 type 选项', async () => {
			const wrapper = mount(CallEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const type = document.getElementById('callEvent-type') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(type.dataItems).toHaveLength(10);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(CallEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'callEvent');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('callEvent');
			expect(getControl('callEvent-type').read()).toBe('global');
			expect(getControl('callEvent-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('callEvent-eventId').read()).toBe('');
			expect(getControl('callEvent-eventType').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径 scene：load eventType 到控件 DOM，save 保存 scene 参数', async () => {
			const wrapper = mount(CallEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.callEvent.customLoad!({ type: 'scene', eventType: 'onStart' });
			await wrapper.vm.$nextTick();
			expect(getControl('callEvent-type').read()).toBe('scene');
			expect(getControl('callEvent-eventType').read()).toBe('onStart');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.callEvent.save!();
			expect(saved).toHaveBeenCalledWith({ type: 'scene', eventType: 'onStart' });
			wrapper.unmount();
		});

		it('edit 路径 global：eventId 写入创建参数控件并回填 eventArgs，save 保存参数与返回值', async () => {
			const wrapper = mount(CallEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Data.events = {
				evt1: {
					parameters: [
						{ type: 'string', key: 'msg', note: 'Message' },
						{ type: 'object', key: 'obj' }
					],
					returnType: 'string',
					description: ''
				}
			} as never;
			Command.cases.callEvent.customLoad!({
				type: 'global',
				eventId: 'evt1',
				eventArgs: [
					{ type: 'string', key: 'msg', value: 'hello' },
					{ type: 'object', key: 'obj', value: { type: 'local', key: 'myObj' } }
				],
				eventResult: { type: 'string', variable: { type: 'local', key: 'result' } }
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.callEvent.save!();
			expect(saved).toHaveBeenCalledWith({
				type: 'global',
				eventId: 'evt1',
				eventArgs: [
					{ type: 'string', key: 'msg', value: 'hello' },
					{ type: 'object', key: 'obj', value: { type: 'local', key: 'myObj' } }
				],
				eventResult: { type: 'string', variable: { type: 'local', key: 'result' } }
			});
			wrapper.unmount();
		});

		it('save 路径：global eventId 为空校验失败不保存', async () => {
			const wrapper = mount(CallEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			document.getElementById('callEvent')?.dispatchEvent(new Event('closed'));
			Command.cases.callEvent.customLoad!({ type: 'global', eventId: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.callEvent.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：inherited 类型直接保存', async () => {
			const wrapper = mount(CallEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.callEvent.customLoad!({ type: 'inherited' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.callEvent.save!();
			expect(saved).toHaveBeenCalledWith({ type: 'inherited' });
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

	describe('useCastSkillCommandSchema（castSkill 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Enum.getStringItems = vi.fn(() => [{ name: 'Key 1', value: 'key1' }]) as never;
			Enum.getDefStringId = vi.fn(() => 'key1') as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		const mountWindow = async () => {
			const wrapper = mount(CastSkill, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			return wrapper;
		};

		it('onMounted loadItems 填充 mode/wait 选项', async () => {
			const wrapper = await mountWindow();
			const mode = document.getElementById('castSkill-mode') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const wait = document.getElementById('castSkill-wait') as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			expect(mode.dataItems).toHaveLength(4);
			expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = await mountWindow();
			const { form } = useCastSkillCommandSchema();
			CommandSchema.insert(target, 'castSkill');
			expect(Window.open).toHaveBeenCalledWith('castSkill');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.mode).toBe('by-key');
			expect(form.key).toBe('key1');
			expect(form.wait).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = await mountWindow();
			const { form } = useCastSkillCommandSchema();
			CommandSchema.edit(target, {
				id: 'castSkill',
				params: {
					actor: { type: 'player' },
					mode: 'by-variable',
					keyVar: 'var1',
					wait: true
				}
			});
			expect(Window.open).toHaveBeenCalledWith('castSkill');
			expect(form.mode).toBe('by-variable');
			expect(form.keyVar).toBe('var1');
			expect(form.wait).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.castSkill.save 保存', async () => {
			const wrapper = await mountWindow();
			const { form } = useCastSkillCommandSchema();
			Command.cases.castSkill.customLoad!({
				actor: { type: 'trigger' },
				mode: 'by-key',
				key: 'key1',
				wait: false
			});
			form.mode = 'by-skill';
			form.skill = { type: 'skill' };
			form.wait = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.castSkill.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				mode: 'by-skill',
				skill: { type: 'skill' },
				wait: true
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

	describe('useChangeActorAnimationCommandSchema（changeActorAnimation 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(ChangeActorAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorAnimationCommandSchema();
			CommandSchema.insert(target, 'changeActorAnimation');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorAnimation');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.animationId).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(ChangeActorAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorAnimationCommandSchema();
			CommandSchema.edit(target, {
				id: 'changeActorAnimation',
				params: { actor: { type: 'trigger' }, animationId: 'anim1.json' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorAnimation');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.animationId).toBe('anim1.json');
			wrapper.unmount();
		});

		it('save 路径：animationId 为空时校验失败不保存', async () => {
			const wrapper = mount(ChangeActorAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.changeActorAnimation.customLoad!({
				actor: { type: 'trigger' },
				animationId: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorAnimation.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.changeActorAnimation.save 保存', async () => {
			const wrapper = mount(ChangeActorAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorAnimationCommandSchema();
			Command.cases.changeActorAnimation.customLoad!({
				actor: { type: 'trigger' },
				animationId: 'anim1.json'
			});
			form.animationId = 'anim2.json';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorAnimation.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				animationId: 'anim2.json'
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

	describe('useChangeActorEquipmentCommandSchema（changeActorEquipment 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Enum.getStringItems = vi.fn(() => [
				{ name: 'Weapon', value: 'weapon' },
				{ name: 'Armor', value: 'armor' }
			]) as never;
			Enum.getDefStringId = vi.fn(() => 'weapon') as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		const mountWindow = async () => {
			const wrapper = mount(ChangeActorEquipment, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			return wrapper;
		};

		it('onMounted loadItems 填充 operation 选项', async () => {
			const wrapper = await mountWindow();
			const operation = document.getElementById(
				'changeActorEquipment-operation'
			) as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(operation.dataItems).toHaveLength(5);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = await mountWindow();
			const { form } = useChangeActorEquipmentCommandSchema();
			CommandSchema.insert(target, 'changeActorEquipment');
			expect(Window.open).toHaveBeenCalledWith('changeActorEquipment');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.operation).toBe('add');
			expect(form.slot).toBe('weapon');
			expect(form.equipmentId).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = await mountWindow();
			const { form } = useChangeActorEquipmentCommandSchema();
			CommandSchema.edit(target, {
				id: 'changeActorEquipment',
				params: {
					actor: { type: 'player' },
					operation: 'remove-instance',
					equipment: { type: 'equipment' }
				}
			});
			expect(Window.open).toHaveBeenCalledWith('changeActorEquipment');
			expect(form.operation).toBe('remove-instance');
			expect(form.equipment).toEqual({ type: 'equipment' });
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.changeActorEquipment.save 保存', async () => {
			const wrapper = await mountWindow();
			const { form } = useChangeActorEquipmentCommandSchema();
			Command.cases.changeActorEquipment.customLoad!({
				actor: { type: 'trigger' },
				operation: 'add',
				slot: 'weapon',
				equipmentId: ''
			});
			form.equipmentId = 'sword';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorEquipment.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				operation: 'add',
				slot: 'weapon',
				equipmentId: 'sword'
			});
			wrapper.unmount();
		});

		it('save 路径：add 空 slot 校验失败不保存', async () => {
			const wrapper = await mountWindow();
			useChangeActorEquipmentCommandSchema();
			Command.cases.changeActorEquipment.customLoad!({
				actor: { type: 'trigger' },
				operation: 'add',
				slot: '',
				equipmentId: 'sword'
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorEquipment.save!();
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

	describe('useChangeActorMotionCommandSchema（changeActorMotion 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.enumeration = { context: { getString: (id: string) => id } } as never;
			GameLocal.replace = ((text: string) => text) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(ChangeActorMotion, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorMotionCommandSchema();
			CommandSchema.insert(target, 'changeActorMotion');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorMotion');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.type).toBe('move');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(ChangeActorMotion, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorMotionCommandSchema();
			CommandSchema.edit(target, {
				id: 'changeActorMotion',
				params: { type: 'idle', motion: 'walk' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorMotion');
			expect(form.type).toBe('idle');
			expect(form.motion).toBe('walk');
			wrapper.unmount();
		});

		it('save 校验：motion 必填，为空不保存', async () => {
			const wrapper = mount(ChangeActorMotion, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorMotionCommandSchema();
			Command.cases.changeActorMotion.customLoad!({
				actor: { type: 'trigger' },
				type: 'move',
				motion: ''
			});
			form.motion = '';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorMotion.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.changeActorMotion.save 保存', async () => {
			const wrapper = mount(ChangeActorMotion, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorMotionCommandSchema();
			Command.cases.changeActorMotion.customLoad!({
				actor: { type: 'trigger' },
				type: 'move',
				motion: 'walk'
			});
			form.motion = 'run';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorMotion.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				type: 'move',
				motion: 'run'
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor + 动作类型文本', () => {
			setWords();
			Command.parseActor = vi.fn(
				(a: unknown) => `A:${(a as { type: string }).type}`
			) as never;
			// oxlint-disable-next-line no-base-to-string
			Command.parseEnumString = vi.fn((v: unknown) => `E:${String(v)}`) as never;
			const contents = Command.cases.changeActorMotion.parse!({
				actor: { type: 'trigger' },
				type: 'move',
				motion: 'walk'
			});
			expect(contents[0]).toHaveProperty('color');
			expect(contents[2]).toHaveProperty('text');
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

	describe('useChangeActorPortraitCommandSchema（changeActorPortrait 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 mode 选项', async () => {
			const wrapper = mount(ChangeActorPortrait, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const mode = document.getElementById('changeActorPortrait-mode') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(mode.dataItems).toHaveLength(3);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(ChangeActorPortrait, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'changeActorPortrait');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorPortrait');
			expect(getControl('changeActorPortrait-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('changeActorPortrait-mode').read()).toBe('full');
			expect(getControl('changeActorPortrait-portrait').read()).toBe('');
			expect(getControl('changeActorPortrait-clip').read()).toEqual([0, 0, 64, 64]);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(ChangeActorPortrait, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'changeActorPortrait',
				params: {
					actor: { type: 'player' },
					mode: 'portrait',
					portrait: 'portrait1'
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorPortrait');
			expect(getControl('changeActorPortrait-mode').read()).toBe('portrait');
			expect(getControl('changeActorPortrait-portrait').read()).toBe('portrait1');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.changeActorPortrait.save 保存', async () => {
			const wrapper = mount(ChangeActorPortrait, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.changeActorPortrait.customLoad!({
				actor: { type: 'trigger' },
				mode: 'full',
				portrait: '',
				clip: [0, 0, 64, 64]
			});
			getControl('changeActorPortrait-mode').input('clip');
			getControl('changeActorPortrait-clip').input([10, 20, 30, 40]);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorPortrait.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				mode: 'clip',
				clip: [10, 20, 30, 40]
			});
			wrapper.unmount();
		});
	});
}
