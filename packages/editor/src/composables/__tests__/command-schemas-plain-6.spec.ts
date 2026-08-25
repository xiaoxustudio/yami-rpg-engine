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
import UploadFile from '@app/components/commands/UploadFile.vue';
import UseItem from '@app/components/commands/UseItem.vue';
import Wait from '@app/components/commands/Wait.vue';
import { useWaitCommandSchema } from '@app/composables/commands/useWaitCommandSchema';
import WaitForVideo from '@app/components/commands/WaitForVideo.vue';
import { useWaitForVideoCommandSchema } from '@app/composables/commands/useWaitForVideoCommandSchema';
import WebSocketClose from '@app/components/commands/WebSocketClose.vue';
import { useWebSocketCloseCommandSchema } from '@app/composables/commands/useWebSocketCloseCommandSchema';
import WebSocketConnect from '@app/components/commands/WebSocketConnect.vue';
import { useWebSocketConnectCommandSchema } from '@app/composables/commands/useWebSocketConnectCommandSchema';
import WebSocketSend from '@app/components/commands/WebSocketSend.vue';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
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
			Enum.getMergedItems = vi.fn((source: unknown, group: string) => [
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
			expect(type.dataItems).toHaveLength(10);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(StopEvent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'stopEvent');
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
			expect(easing.dataItems).toHaveLength(2);
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

		it('save 路径：用户改控件后经 Command.cases.translateActor.save 保存', async () => {
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
			getControl('translateActor-distance').write(5);
			getControl('translateActor-wait').write(true);
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

	describe('useUploadFileCommandSchema（uploadFile 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || variable === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(UploadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'uploadFile');
			expect(Window.open).toHaveBeenCalledWith('uploadFile');
			expect(getControl('uploadFile-url').read()).toBe('');
			expect(getControl('uploadFile-method').read()).toBe('POST');
			expect(getControl('uploadFile-path').read()).toBe('');
			expect(getControl('uploadFile-field').read()).toBe('file');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(UploadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'uploadFile',
				params: {
					url: 'http://example.com/up',
					method: 'PUT',
					path: { type: 'local', key: 'path' },
					field: 'f1',
					callback: 'cb1'
				}
			});
			expect(Window.open).toHaveBeenCalledWith('uploadFile');
			expect(getControl('uploadFile-url').read()).toBe('http://example.com/up');
			expect(getControl('uploadFile-method').read()).toBe('PUT');
			expect(getControl('uploadFile-path').read()).toEqual({ type: 'local', key: 'path' });
			expect(getControl('uploadFile-field').read()).toBe('f1');
			expect(getControl('uploadFile-callback').read()).toBe('cb1');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.uploadFile.save 保存', async () => {
			const wrapper = mount(UploadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.uploadFile.customLoad!({
				url: 'http://example.com/up',
				method: 'POST',
				path: 'C:/file'
			});
			getControl('uploadFile-method').input('PUT');
			getControl('uploadFile-field').write('f2');
			getControl('uploadFile-callback').input('cb2');
			getControl('uploadFile-rateCallback').input('rc2');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.uploadFile.save!();
			expect(saved).toHaveBeenCalledWith({
				url: 'http://example.com/up',
				method: 'PUT',
				path: 'C:/file',
				field: 'f2',
				headers: [],
				callback: 'cb2',
				rateCallback: 'rc2'
			});
			wrapper.unmount();
		});

		it('save 路径：url 为 none 校验失败不保存', async () => {
			const wrapper = mount(UploadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.uploadFile.customLoad!({
				url: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.uploadFile.save!();
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

	describe('useUseItemCommandSchema（useItem 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Enum.getStringItems = vi.fn(() => [{ name: 'Key 1', value: 'key1' }]) as never;
			Enum.getDefStringId = vi.fn(() => 'key1') as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 mode/wait 选项', async () => {
			const wrapper = mount(UseItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const mode = document.getElementById('useItem-mode') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(mode.dataItems).toHaveLength(3);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(UseItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'useItem');
			expect(Window.open).toHaveBeenCalledWith('useItem');
			expect(getControl('useItem-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('useItem-mode').read()).toBe('by-key');
			expect(getControl('useItem-key').read()).toBe('key1');
			expect(getControl('useItem-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(UseItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'useItem',
				params: {
					actor: { type: 'player' },
					mode: 'by-item',
					item: { type: 'item' },
					wait: true
				}
			});
			expect(Window.open).toHaveBeenCalledWith('useItem');
			expect(getControl('useItem-actor').read()).toEqual({ type: 'player' });
			expect(getControl('useItem-mode').read()).toBe('by-item');
			expect(getControl('useItem-item').read()).toEqual({ type: 'item' });
			expect(getControl('useItem-wait').read()).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.useItem.save 保存', async () => {
			const wrapper = mount(UseItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.useItem.customLoad!({
				actor: { type: 'trigger' },
				mode: 'by-key',
				key: 'key1',
				wait: false
			});
			getControl('useItem-mode').input('by-id');
			getControl('useItem-itemId').input('item1');
			getControl('useItem-wait').input(true);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.useItem.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				mode: 'by-id',
				itemId: 'item1',
				wait: true
			});
			wrapper.unmount();
		});

		it('save 路径：by-key 空 key 校验失败不保存', async () => {
			const wrapper = mount(UseItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.useItem.customLoad!({
				actor: { type: 'trigger' },
				mode: 'by-key',
				key: '',
				wait: false
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.useItem.save!();
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

	describe('useWaitCommandSchema（wait 命令表单 composable：form 状态 + insert/edit/save）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form（v-model 驱动控件）', async () => {
			const wrapper = mount(Wait, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitCommandSchema();
			CommandSchema.insert(target, 'wait');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('wait');
			expect(form.duration).toBe(1);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form（v-model 驱动控件）', async () => {
			const wrapper = mount(Wait, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitCommandSchema();
			CommandSchema.edit(target, { id: 'wait', params: { duration: 500 } });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('wait');
			expect(form.duration).toBe(500);
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.wait.save 保存', async () => {
			const wrapper = mount(Wait, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitCommandSchema();
			Command.cases.wait.customLoad!({ duration: 1 });
			form.duration = 800;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.wait.save!();
			expect(saved).toHaveBeenCalledWith({ duration: 800 });
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

	describe('useWaitForVideoCommandSchema（waitForVideo 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(WaitForVideo, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitForVideoCommandSchema();
			CommandSchema.insert(target, 'waitForVideo');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('waitForVideo');
			expect(form.element).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(WaitForVideo, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitForVideoCommandSchema();
			CommandSchema.edit(target, {
				id: 'waitForVideo',
				params: { element: { type: 'player' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('waitForVideo');
			expect(form.element).toEqual({ type: 'player' });
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.waitForVideo.save 保存', async () => {
			const wrapper = mount(WaitForVideo, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitForVideoCommandSchema();
			Command.cases.waitForVideo.customLoad!({ element: { type: 'trigger' } });
			form.element = { type: 'global' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.waitForVideo.save!();
			expect(saved).toHaveBeenCalledWith({ element: { type: 'global' } });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 element 文本', () => {
			setWords();
			Command.parseElement = vi.fn((e: { type: string }) => `E:${e.type}`) as never;
			const contents = Command.cases.waitForVideo.parse!({ element: { type: 'trigger' } });
			expect(contents).toContainEqual({ text: 'E:trigger' });
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

	describe('useWebSocketCloseCommandSchema（webSocketClose 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(WebSocketClose, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWebSocketCloseCommandSchema();
			CommandSchema.insert(target, 'webSocketClose');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('webSocketClose');
			expect(form.id).toBe('');
			expect(form.code).toBe('');
			expect(form.reason).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(WebSocketClose, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWebSocketCloseCommandSchema();
			CommandSchema.edit(target, {
				id: 'webSocketClose',
				params: { id: 'ws1', code: 1000, reason: 'bye' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('webSocketClose');
			expect(form.id).toBe('ws1');
			expect(form.code).toBe(1000);
			expect(form.reason).toBe('bye');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.webSocketClose.save 保存', async () => {
			const wrapper = mount(WebSocketClose, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketClose.customLoad!({
				id: 'ws1',
				code: 1000,
				reason: 'bye'
			});
			getControl('webSocketClose-code').write(4000);
			getControl('webSocketClose-reason').write('closing');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketClose.save!();
			expect(saved).toHaveBeenCalledWith({ id: 'ws1', code: 4000, reason: 'closing' });
			wrapper.unmount();
		});

		it('save 路径：id 为空校验失败不保存', async () => {
			const wrapper = mount(WebSocketClose, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketClose.customLoad!({ id: '', code: '', reason: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketClose.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 id/code/reason 文本', () => {
			const contents = Command.cases.webSocketClose.parse!({
				id: 'ws1',
				code: 1000,
				reason: 'bye'
			});
			expect(contents).toContainEqual({ text: 'ws1' });
			expect(contents).toContainEqual({ text: '1000' });
			expect(contents).toContainEqual({ text: 'bye' });
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

	describe('useWebSocketConnectCommandSchema（webSocketConnect 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(WebSocketConnect, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWebSocketConnectCommandSchema();
			CommandSchema.insert(target, 'webSocketConnect');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('webSocketConnect');
			expect(form.url).toBe('');
			expect(form.id).toBe('');
			expect(form.protocols).toBe('');
			expect(form.onOpen).toBe('');
			expect(form.onMessage).toBe('');
			expect(form.onError).toBe('');
			expect(form.onClose).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(WebSocketConnect, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWebSocketConnectCommandSchema();
			CommandSchema.edit(target, {
				id: 'webSocketConnect',
				params: { url: 'wss://host/socket', id: 'ws1', protocols: 'graphql-ws' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('webSocketConnect');
			expect(form.url).toBe('wss://host/socket');
			expect(form.id).toBe('ws1');
			expect(form.protocols).toBe('graphql-ws');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.webSocketConnect.save 保存', async () => {
			const wrapper = mount(WebSocketConnect, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketConnect.customLoad!({
				url: 'wss://host/socket',
				id: 'ws1',
				protocols: '',
				onOpen: '',
				onMessage: '',
				onError: '',
				onClose: ''
			});
			getControl('webSocketConnect-protocols').write('graphql-ws');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketConnect.save!();
			expect(saved).toHaveBeenCalledWith({
				url: 'wss://host/socket',
				id: 'ws1',
				protocols: 'graphql-ws',
				onOpen: '',
				onMessage: '',
				onError: '',
				onClose: ''
			});
			wrapper.unmount();
		});

		it('save 路径：url 为空校验失败不保存', async () => {
			const wrapper = mount(WebSocketConnect, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketConnect.customLoad!({
				url: '',
				id: 'ws1',
				protocols: '',
				onOpen: '',
				onMessage: '',
				onError: '',
				onClose: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketConnect.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：id 为空校验失败不保存', async () => {
			const wrapper = mount(WebSocketConnect, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketConnect.customLoad!({
				url: 'wss://host/socket',
				id: '',
				protocols: '',
				onOpen: '',
				onMessage: '',
				onError: '',
				onClose: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketConnect.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染截断 URL + id 文本', () => {
			const contents = Command.cases.webSocketConnect.parse!({
				url: 'wss://example.com/very-long-path-123456',
				id: 'ws1',
				protocols: '',
				onOpen: '',
				onMessage: '',
				onError: '',
				onClose: ''
			});
			expect(contents).toContainEqual({ text: 'wss://example.com/ve...' });
			expect(contents).toContainEqual({ text: 'ws1' });
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

	describe('useWebSocketSendCommandSchema（webSocketSend 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(WebSocketSend, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'webSocketSend');
			expect(Window.open).toHaveBeenCalledWith('webSocketSend');
			expect(getControl('webSocketSend-id').read()).toBe('');
			expect(getControl('webSocketSend-data').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(WebSocketSend, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'webSocketSend',
				params: { id: 'ws1', data: 'hello' }
			});
			expect(Window.open).toHaveBeenCalledWith('webSocketSend');
			expect(getControl('webSocketSend-id').read()).toBe('ws1');
			expect(getControl('webSocketSend-data').read()).toBe('hello');
			wrapper.unmount();
		});

		it('save 路径：id 为空时校验失败不保存', async () => {
			const wrapper = mount(WebSocketSend, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketSend.customLoad!({ id: '', data: 'hello' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketSend.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：data 为空时校验失败不保存', async () => {
			const wrapper = mount(WebSocketSend, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketSend.customLoad!({ id: 'ws1', data: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketSend.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：id/data 非空时经 Command.cases.webSocketSend.save 保存', async () => {
			const wrapper = mount(WebSocketSend, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketSend.customLoad!({ id: 'ws1', data: 'hello' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketSend.save!();
			expect(saved).toHaveBeenCalledWith({ id: 'ws1', data: 'hello' });
			wrapper.unmount();
		});
	});
}
