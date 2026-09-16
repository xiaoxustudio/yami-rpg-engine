import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import StopEvent from '@app/components/commands/StopEvent.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Window } from '@app/tools/window-object.ts';
import SwitchCollisionSystem from '@app/components/commands/SwitchCollisionSystem.vue';
import { useSwitchCollisionSystemCommandSchema } from '@app/composables/commands/useSwitchCollisionSystemCommandSchema';
import TintImage from '@app/components/commands/TintImage.vue';
import { Data } from '@app/data/data-object.ts';
import TintScreen from '@app/components/commands/TintScreen.vue';
import TransferGlobalActor from '@app/components/commands/TransferGlobalActor.vue';
import { useTransferGlobalActorCommandSchema } from '@app/composables/commands/useTransferGlobalActorCommandSchema';
import TransitionWindow from '@app/components/commands/Transition.vue';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useTransitionCommandSchema } from '@app/composables/commands/useTransitionCommandSchema';
import TranslateActor from '@app/components/commands/TranslateActor.vue';
import { useTranslateActorCommandSchema } from '@app/composables/commands/useTranslateActorCommandSchema';
import UnloadSubscene from '@app/components/commands/UnloadSubscene.vue';
import { useUnloadSubsceneCommandSchema } from '@app/composables/commands/useUnloadSubsceneCommandSchema';
import { dataItemsOf } from '@app/__tests__/element-data-read';

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

	describe('useStopEventCommandSchema（stopEvent 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Enum.getMergedItems = vi.fn((_source: unknown, group: string) => [
				{ name: group, value: group + '-type1' }
			]) as never;
			EventEditor.types = { actor: { autorun: {} } } as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 type 选项', async () => {
			const wrapper = mount(StopEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const type = document.getElementById('stopEvent-type') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(dataItemsOf(type)).toHaveLength(10);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(StopEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'stopEvent');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('stopEvent');
			expect(getControl('stopEvent-type').read()).toBe('current');
			expect(getControl('stopEvent-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('stopEvent-eventId').read()).toBe('');
			expect(getControl('stopEvent-eventType').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(StopEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'stopEvent',
				params: {
					type: 'global',
					eventId: 'event1'
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('stopEvent');
			expect(getControl('stopEvent-type').read()).toBe('global');
			expect(getControl('stopEvent-eventId').read()).toBe('event1');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.stopEvent.save 保存', async () => {
			const wrapper = mount(StopEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.stopEvent.customLoad!({
				type: 'current'
			});
			getControl('stopEvent-type').input('scene');
			getControl('stopEvent-eventType').input('scene-type1');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.stopEvent.save!();
			expect(saved).toHaveBeenCalledWith({
				type: 'scene',
				eventType: 'scene-type1'
			});
			wrapper.unmount();
		});

		it('save 路径：global 空 eventId 校验失败不保存', async () => {
			const wrapper = mount(StopEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.stopEvent.customLoad!({
				type: 'global',
				eventId: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.stopEvent.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('type write 时按类型加载 eventType 选项并写入首个', async () => {
			const wrapper = mount(StopEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			getControl('stopEvent-type').write('actor');
			expect(getControl('stopEvent-eventType').read()).toBe('actor-event-type1');
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

	describe('useSwitchCollisionSystemCommandSchema（switchCollisionSystem 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SwitchCollisionSystem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSwitchCollisionSystemCommandSchema();
			CommandSchema.insert(target, 'switchCollisionSystem');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('switchCollisionSystem');
			expect(form.operation).toBe('enable-actor-collision');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SwitchCollisionSystem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSwitchCollisionSystemCommandSchema();
			CommandSchema.edit(target, {
				id: 'switchCollisionSystem',
				params: { operation: 'disable-scene-collision' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('switchCollisionSystem');
			expect(form.operation).toBe('disable-scene-collision');
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.switchCollisionSystem.save 保存', async () => {
			const wrapper = mount(SwitchCollisionSystem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSwitchCollisionSystemCommandSchema();
			Command.cases.switchCollisionSystem.customLoad!({
				operation: 'enable-actor-collision'
			});
			form.operation = 'enable-scene-collision';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.switchCollisionSystem.save!();
			expect(saved).toHaveBeenCalledWith({ operation: 'enable-scene-collision' });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染操作文本', () => {
			const contents = Command.cases.switchCollisionSystem.parse!({
				operation: 'enable-actor-collision'
			});
			expect(contents[2]).toHaveProperty('text');
			expect((contents[2] as { text: string }).text).toContain('enable-actor-collision');
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

	describe('useTintImageCommandSchema（tintImage 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口后 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(TintImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'tintImage');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('tintImage');
			expect(getControl('tintImage-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('tintImage-mode').read()).toBe('full');
			expect(getControl('tintImage-tint-0').read()).toBe(0);
			expect(getControl('tintImage-tint-3').read()).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM（含 filter 预览）', async () => {
			const wrapper = mount(TintImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'tintImage',
				params: {
					element: { type: 'trigger' },
					mode: 'rgb',
					tint: [1, 2, 3, 0],
					duration: 100
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('tintImage');
			expect(getControl('tintImage-tint-0').read()).toBe(1);
			expect(getControl('tintImage-tint-2').read()).toBe(3);
			expect(getControl('tintImage-duration').read()).toBe(100);
			wrapper.unmount();
		});

		it('save 路径：full 模式经 Command.cases.tintImage.save 保存完整 tint', async () => {
			const wrapper = mount(TintImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.tintImage.customLoad!({
				element: { type: 'trigger' },
				mode: 'full',
				tint: [1, 2, 3, 4],
				duration: 100,
				wait: true
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.tintImage.save!();
			expect(saved).toHaveBeenCalledWith(
				expect.objectContaining({
					element: { type: 'trigger' },
					mode: 'full',
					tint: [1, 2, 3, 4],
					duration: 100,
					wait: true
				})
			);
			wrapper.unmount();
		});

		it('save 路径：gray 模式仅保留灰度通道', async () => {
			const wrapper = mount(TintImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.tintImage.customLoad!({
				element: { type: 'trigger' },
				mode: 'gray',
				tint: [10, 20, 30, 40]
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.tintImage.save!();
			expect(saved).toHaveBeenCalledWith(expect.objectContaining({ tint: [0, 0, 0, 40] }));
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

	describe('useTintScreenCommandSchema（tintScreen 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(TintScreen, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'tintScreen');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('tintScreen');
			expect(getControl('tintScreen-tint-0').read()).toBe(0);
			expect(getControl('tintScreen-tint-3').read()).toBe(0);
			expect(getControl('tintScreen-easingId').read()).toBe('easing0');
			expect(getControl('tintScreen-duration').read()).toBe(0);
			expect(getControl('tintScreen-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(TintScreen, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'tintScreen',
				params: {
					tint: [10, 20, 30, 40],
					easingId: 'e2',
					duration: 300,
					wait: true
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('tintScreen');
			expect(getControl('tintScreen-tint-0').read()).toBe(10);
			expect(getControl('tintScreen-tint-1').read()).toBe(20);
			expect(getControl('tintScreen-tint-2').read()).toBe(30);
			expect(getControl('tintScreen-tint-3').read()).toBe(40);
			expect(getControl('tintScreen-easingId').read()).toBe('e2');
			expect(getControl('tintScreen-duration').read()).toBe(300);
			expect(getControl('tintScreen-wait').read()).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.tintScreen.save 保存', async () => {
			const wrapper = mount(TintScreen, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.tintScreen.customLoad!({
				tint: [0, 0, 0, 0],
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			getControl('tintScreen-tint-0').write(50);
			getControl('tintScreen-tint-1').write(60);
			getControl('tintScreen-tint-2').write(70);
			getControl('tintScreen-tint-3').write(80);
			getControl('tintScreen-duration').write(1000);
			getControl('tintScreen-wait').input(true);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.tintScreen.save!();
			expect(saved).toHaveBeenCalledWith({
				tint: [50, 60, 70, 80],
				easingId: 'easing0',
				duration: 1000,
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

	describe('useTransferGlobalActorCommandSchema（transferGlobalActor 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(TransferGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useTransferGlobalActorCommandSchema();
			CommandSchema.insert(target, 'transferGlobalActor');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('transferGlobalActor');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.position).toEqual({ type: 'absolute', x: 0, y: 0 });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(TransferGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useTransferGlobalActorCommandSchema();
			CommandSchema.edit(target, {
				id: 'transferGlobalActor',
				params: { actor: { type: 'player' }, position: { type: 'absolute', x: 5, y: 6 } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('transferGlobalActor');
			expect(form.actor).toEqual({ type: 'player' });
			expect(form.position).toEqual({ type: 'absolute', x: 5, y: 6 });
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.transferGlobalActor.save 保存', async () => {
			const wrapper = mount(TransferGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useTransferGlobalActorCommandSchema();
			Command.cases.transferGlobalActor.customLoad!({
				actor: { type: 'trigger' },
				position: { type: 'absolute', x: 0, y: 0 }
			});
			form.position = { type: 'absolute', x: 10, y: 20 };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.transferGlobalActor.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				position: { type: 'absolute', x: 10, y: 20 }
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor + position 文本', () => {
			setWords();
			Command.parseActor = vi.fn((a: { type: string }) => `A:${a.type}`) as never;
			Command.parsePosition = vi.fn(() => 'POS') as never;
			const contents = Command.cases.transferGlobalActor.parse!({
				actor: { type: 'trigger' },
				position: { type: 'absolute', x: 0, y: 0 }
			});
			expect(contents).toContainEqual({ text: 'A:triggerPOS' });
		});
	});
}
{
	describe('useTransitionCommandSchema (transition command insert/edit/save paths)', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
			Window.open = vi.fn();
			Window.close = vi.fn();
			Data.easings = [{ id: 'ease0' }, { id: 'ease1' }] as never;
			Data.createEasingItems = vi.fn(() => [
				{ name: 'Ease 0', value: 'ease0' },
				{ name: 'Ease 1', value: 'ease1' }
			]) as never;
		});

		const mountWindow = async () => {
			const wrapper = mount(TransitionWindow, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			return wrapper;
		};

		it('insert path: CommandSchema.insert opens transition window and loads default form', async () => {
			const wrapper = await mountWindow();
			const { form } = useTransitionCommandSchema();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			CommandSchema.insert(target, 'transition');
			expect(Window.open).toHaveBeenCalledWith('transition');
			expect(form.variable).toEqual({ type: 'local', key: '' });
			expect(form.start).toBe(0);
			expect(form.end).toBe(1);
			expect(form.easingId).toBe('ease0');
			expect(form.duration).toBe(1000);
			wrapper.unmount();
		});

		it('edit path: CommandSchema.edit maps params to form, customSave saves with commands', async () => {
			const wrapper = await mountWindow();
			const { form } = useTransitionCommandSchema();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			CommandSchema.edit(target, {
				id: 'transition',
				params: {
					variable: { type: 'local', key: 'v' },
					start: 10,
					end: 20,
					easingId: 'ease1',
					duration: 500,
					commands: [{ id: 'comment' }]
				}
			});
			expect(Window.open).toHaveBeenCalledWith('transition');
			expect(form.variable).toEqual({ type: 'local', key: 'v' });
			expect(form.duration).toBe(500);
			form.end = 30;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.transition.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'v' },
				start: 10,
				end: 30,
				easingId: 'ease1',
				duration: 500,
				commands: [{ id: 'comment' }]
			});
			wrapper.unmount();
		});

		it('save validation: empty variable or zero duration do not save', async () => {
			const wrapper = await mountWindow();
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.transition.customLoad!({
				variable: { type: 'local', key: '' },
				start: 0,
				end: 1,
				easingId: 'ease0',
				duration: 1000
			});
			await wrapper.vm.$nextTick();
			Command.cases.transition.save!();
			expect(saved).not.toHaveBeenCalled();
			Command.cases.transition.customLoad!({
				variable: { type: 'local', key: 'v' },
				start: 0,
				end: 1,
				easingId: 'ease0',
				duration: 0
			});
			await wrapper.vm.$nextTick();
			Command.cases.transition.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('open loads easing items, windowClosed clears commands and easing items', async () => {
			const wrapper = await mountWindow();
			const { open, windowClosed } = useTransitionCommandSchema();
			open();
			await wrapper.vm.$nextTick();
			const easing = document.getElementById('transition-easingId') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(dataItemsOf(easing)).toHaveLength(2);
			Command.cases.transition.customLoad!({
				variable: { type: 'local', key: 'v' },
				start: 0,
				end: 1,
				easingId: 'ease0',
				duration: 1000,
				commands: [{ id: 'comment' }]
			});
			await wrapper.vm.$nextTick();
			windowClosed(new Event('closed'));
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.transition.customLoad!({
				variable: { type: 'local', key: 'v' },
				start: 0,
				end: 1,
				easingId: 'ease0',
				duration: 1000
			});
			await wrapper.vm.$nextTick();
			Command.cases.transition.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'v' },
				start: 0,
				end: 1,
				easingId: 'ease0',
				duration: 1000,
				commands: []
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

	describe('useTranslateActorCommandSchema（translateActor 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(TranslateActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useTranslateActorCommandSchema();
			CommandSchema.insert(target, 'translateActor');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('translateActor');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.angle).toEqual({ type: 'absolute', degrees: 0 });
			expect(form.distance).toBe(0);
			expect(form.easingId).toBe('easing0');
			expect(form.duration).toBe(0);
			expect(form.wait).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(TranslateActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useTranslateActorCommandSchema();
			CommandSchema.edit(target, {
				id: 'translateActor',
				params: {
					actor: { type: 'player' },
					angle: { type: 'absolute', degrees: 45 },
					distance: 5,
					easingId: 'e2',
					duration: 400,
					wait: true
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('translateActor');
			expect(form.actor).toEqual({ type: 'player' });
			expect(form.angle).toEqual({ type: 'absolute', degrees: 45 });
			expect(form.distance).toBe(5);
			expect(form.easingId).toBe('e2');
			expect(form.duration).toBe(400);
			expect(form.wait).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.translateActor.save 保存', async () => {
			const wrapper = mount(TranslateActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useTranslateActorCommandSchema();
			Command.cases.translateActor.customLoad!({
				actor: { type: 'trigger' },
				angle: { type: 'absolute', degrees: 0 },
				distance: 0,
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			form.distance = 5;
			form.wait = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.translateActor.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				angle: { type: 'absolute', degrees: 0 },
				distance: 5,
				easingId: 'easing0',
				duration: 0,
				wait: true
			});
			wrapper.unmount();
		});

		it('save 路径：distance 为 0 校验失败不保存', async () => {
			const wrapper = mount(TranslateActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.translateActor.customLoad!({
				actor: { type: 'trigger' },
				angle: { type: 'absolute', degrees: 0 },
				distance: 0,
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.translateActor.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor + angle/distance + 缓动文本', () => {
			setWords();
			Command.parseActor = vi.fn((a: { type: string }) => `A:${a.type}`) as never;
			Command.parseAngle = vi.fn(() => 'ANG') as never;
			// oxlint-disable-next-line no-base-to-string
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
			Command.parseEasing = vi.fn(() => 'EASING') as never;
			const contents = Command.cases.translateActor.parse!({
				actor: { type: 'trigger' },
				angle: { type: 'absolute', degrees: 0 },
				distance: 0,
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			expect(contents).toContainEqual({ text: 'A:triggerANGN:0EASING' });
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

	describe('useUnloadSubsceneCommandSchema（unloadSubscene 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(UnloadSubscene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useUnloadSubsceneCommandSchema();
			CommandSchema.insert(target, 'unloadSubscene');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('unloadSubscene');
			expect(form.sceneId).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(UnloadSubscene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useUnloadSubsceneCommandSchema();
			CommandSchema.edit(target, {
				id: 'unloadSubscene',
				params: { sceneId: 'subscene1' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('unloadSubscene');
			expect(form.sceneId).toBe('subscene1');
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.unloadSubscene.save 保存', async () => {
			const wrapper = mount(UnloadSubscene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useUnloadSubsceneCommandSchema();
			Command.cases.unloadSubscene.customLoad!({ sceneId: 'subscene1' });
			form.sceneId = 'subscene2';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.unloadSubscene.save!();
			expect(saved).toHaveBeenCalledWith({ sceneId: 'subscene2' });
			wrapper.unmount();
		});

		it('save 路径：sceneId 为空校验失败不保存', async () => {
			const wrapper = mount(UnloadSubscene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.unloadSubscene.customLoad!({ sceneId: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.unloadSubscene.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 scene 文件文本', () => {
			setWords();
			// oxlint-disable-next-line no-base-to-string
			Command.parseVariableFile = vi.fn((v: unknown) => `F:${String(v)}`) as never;
			const contents = Command.cases.unloadSubscene.parse!({ sceneId: 'subscene1' });
			expect(contents).toContainEqual({ text: 'F:subscene1' });
		});
	});
}
