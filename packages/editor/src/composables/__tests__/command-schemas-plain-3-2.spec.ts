import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { Command, initCommandParseBridges } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Enum } from '@app/enum/enum-window.ts';
import MoveCamera from '@app/components/commands/MoveCamera.vue';
import MoveElement from '@app/components/commands/MoveElement.vue';
import MoveLight from '@app/components/commands/MoveLight.vue';
import PlayAudio from '@app/components/commands/PlayAudio.vue';
import RegisterEventWindow from '@app/components/commands/RegisterEvent.vue';
import { useRegisterEventCommandSchema } from '@app/composables/commands/useRegisterEventCommandSchema';
import RequestURL from '@app/components/commands/RequestURL.vue';
import Return from '@app/components/commands/Return.vue';
import { useReturnCommandSchema } from '@app/composables/commands/useReturnCommandSchema';
import SetAngle from '@app/components/commands/SetAngle.vue';
import { useSetAngleCommandSchema } from '@app/composables/commands/useSetAngleCommandSchema';
import SetAnimation from '@app/components/commands/SetAnimation.vue';
import { useSetAnimationCommandSchema } from '@app/composables/commands/useSetAnimationCommandSchema';
import SetAnimationComponent from '@app/components/commands/SetAnimationComponent.vue';
import { Animation } from '@app/animation/animation-window.ts';
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

	describe('useMoveCameraCommandSchema（moveCamera 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 mode/wait 选项', async () => {
			const wrapper = mount(MoveCamera, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const mode = document.getElementById('moveCamera-mode') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const wait = document.getElementById('moveCamera-wait') as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			expect(dataItemsOf(mode)).toHaveLength(2);
			expect(dataItemsOf(wait)!.map((item) => item.value)).toEqual([true, false]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(MoveCamera, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'moveCamera');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('moveCamera');
			expect(getControl('moveCamera-mode').read()).toBe('position');
			expect(getControl('moveCamera-position').read()).toEqual({
				type: 'absolute',
				x: 0,
				y: 0
			});
			expect(getControl('moveCamera-easingId').read()).toBe('easing0');
			expect(getControl('moveCamera-duration').read()).toBe(0);
			expect(getControl('moveCamera-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(MoveCamera, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'moveCamera',
				params: {
					mode: 'actor',
					actor: { type: 'player' },
					easingId: 'e2',
					duration: 1000,
					wait: true
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('moveCamera');
			expect(getControl('moveCamera-mode').read()).toBe('actor');
			expect(getControl('moveCamera-actor').read()).toEqual({ type: 'player' });
			expect(getControl('moveCamera-easingId').read()).toBe('e2');
			expect(getControl('moveCamera-duration').read()).toBe(1000);
			expect(getControl('moveCamera-wait').read()).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.moveCamera.save 保存', async () => {
			const wrapper = mount(MoveCamera, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.moveCamera.customLoad!({
				mode: 'position',
				position: { type: 'absolute', x: 0, y: 0 },
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			getControl('moveCamera-mode').input('actor');
			getControl('moveCamera-actor').input({ type: 'friend' });
			getControl('moveCamera-easingId').input('e3');
			getControl('moveCamera-duration').write(500);
			getControl('moveCamera-wait').input(true);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.moveCamera.save!();
			expect(saved).toHaveBeenCalledWith({
				mode: 'actor',
				actor: { type: 'friend' },
				easingId: 'e3',
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

	const params = {
		element: { type: 'trigger' },
		properties: [{ key: 'content', value: 'hi' }],
		easingId: 'linear',
		duration: 1000,
		wait: true
	};

	describe('useMoveElementCommandSchema（moveElement 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(MoveElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'moveElement');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('moveElement');
			expect(getControl('moveElement-element').read()).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(MoveElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, { id: 'moveElement', params });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('moveElement');
			expect(getControl('moveElement-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('moveElement-properties').read()).toEqual(params.properties);
			wrapper.unmount();
		});

		it('save 路径：properties 为空时校验失败不保存', async () => {
			const wrapper = mount(MoveElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.moveElement.customLoad!({ element: { type: 'trigger' }, properties: [] });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.moveElement.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：properties 非空时经 Command.cases.moveElement.save 保存', async () => {
			const wrapper = mount(MoveElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.moveElement.customLoad!(params);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.moveElement.save!();
			expect(saved).toHaveBeenCalledWith(params);
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

	const params = {
		light: { type: 'trigger' },
		properties: [{ key: 'content', value: 'hi' }],
		easingId: 'linear',
		duration: 1000,
		wait: true
	};

	describe('useMoveLightCommandSchema（moveLight 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(MoveLight, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'moveLight');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('moveLight');
			expect(getControl('moveLight-light').read()).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(MoveLight, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, { id: 'moveLight', params });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('moveLight');
			expect(getControl('moveLight-light').read()).toEqual({ type: 'trigger' });
			expect(getControl('moveLight-properties').read()).toEqual(params.properties);
			wrapper.unmount();
		});

		it('save 路径：properties 为空时校验失败不保存', async () => {
			const wrapper = mount(MoveLight, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.moveLight.customLoad!({ light: { type: 'trigger' }, properties: [] });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.moveLight.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：properties 非空时经 Command.cases.moveLight.save 保存', async () => {
			const wrapper = mount(MoveLight, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.moveLight.customLoad!(params);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.moveLight.save!();
			expect(saved).toHaveBeenCalledWith(params);
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

	describe('usePlayAudioCommandSchema（playAudio 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(PlayAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'playAudio');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('playAudio');
			expect(getControl('playAudio-type').read()).toBe('se-attenuated');
			expect(getControl('playAudio-audio').read()).toBe('');
			expect(getControl('playAudio-volume').read()).toBe(1);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(PlayAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'playAudio',
				params: { type: 'bgm', audio: 'audio1', volume: 0.5 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('playAudio');
			expect(getControl('playAudio-type').read()).toBe('bgm');
			expect(getControl('playAudio-audio').read()).toBe('audio1');
			expect(getControl('playAudio-volume').read()).toBe(0.5);
			wrapper.unmount();
		});

		it('save 路径：audio 为空时校验失败不保存', async () => {
			const wrapper = mount(PlayAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.playAudio.customLoad!({ type: 'bgm', audio: '', volume: 1 });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.playAudio.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：type=bgm 时不保存 location', async () => {
			const wrapper = mount(PlayAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.playAudio.customLoad!({ type: 'bgm', audio: 'audio1', volume: 1 });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.playAudio.save!();
			expect(saved).toHaveBeenCalledWith({ type: 'bgm', audio: 'audio1', volume: 1 });
			wrapper.unmount();
		});

		it('save 路径：type=se-attenuated 时保存 location', async () => {
			const wrapper = mount(PlayAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.playAudio.customLoad!({
				type: 'se-attenuated',
				audio: 'audio1',
				volume: 1,
				location: { type: 'absolute', x: 1, y: 2 }
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.playAudio.save!();
			expect(saved).toHaveBeenCalledWith({
				type: 'se-attenuated',
				audio: 'audio1',
				volume: 1,
				location: { type: 'absolute', x: 1, y: 2 }
			});
			wrapper.unmount();
		});
	});
}
{
	const mockEventTypes = (): void => {
		Enum.getMergedItems = vi.fn(() => [
			{ name: 'Key Down', value: 'keydown' },
			{ name: 'Key Up', value: 'keyup' }
		]) as never;
		EventEditor.types = {
			all: [{ name: 'Autorun', value: 'autorun' }]
		} as never;
	};

	describe('useRegisterEventCommandSchema (registerEvent target/operation linkage + insert/edit/save paths)', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
			mockEventTypes();
		});

		const mountWindow = async () => {
			const wrapper = mount(RegisterEventWindow, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			return wrapper;
		};

		it('insert path: CommandSchema.insert opens registerEvent window and loads default form', async () => {
			const wrapper = await mountWindow();
			const { form } = useRegisterEventCommandSchema();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			CommandSchema.insert(target, 'registerEvent');
			expect(Window.open).toHaveBeenCalledWith('registerEvent');
			expect(form.target).toBe('global');
			expect(form.operation).toBe('register');
			expect(form.type).toBe('autorun');
			wrapper.unmount();
		});

		it('targetWrite/operationWrite/typeWrite linkage: type items per target, priority enabled for key events', async () => {
			const wrapper = await mountWindow();
			const { form } = useRegisterEventCommandSchema();
			Command.cases.registerEvent.targetWrite!({ value: 'global' });
			const type = document.getElementById('registerEvent-type') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(dataItemsOf(type)).toHaveLength(2);
			expect(form.type).toBe('keydown');
			Command.cases.registerEvent.customLoad!({
				target: 'global',
				operation: 'register',
				type: 'keydown',
				priority: true,
				namespace: true,
				tag: 'tag1',
				commands: [{ id: 'comment' }]
			});
			await wrapper.vm.$nextTick();
			Command.cases.registerEvent.operationWrite!();
			Command.cases.registerEvent.typeWrite!();
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.registerEvent.save!();
			expect(saved).toHaveBeenCalledWith({
				target: 'global',
				operation: 'register',
				type: 'keydown',
				priority: true,
				namespace: true,
				tag: 'tag1',
				commands: [{ id: 'comment' }]
			});
			wrapper.unmount();
		});

		it('edit path: CommandSchema.edit maps params to form, actor branch saves without namespace', async () => {
			const wrapper = await mountWindow();
			const { form } = useRegisterEventCommandSchema();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			CommandSchema.edit(target, {
				id: 'registerEvent',
				params: {
					target: 'actor',
					actor: { type: 'player' },
					operation: 'unregister',
					type: 'keydown'
				}
			});
			expect(Window.open).toHaveBeenCalledWith('registerEvent');
			expect(form.actor).toEqual({ type: 'player' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.registerEvent.save!();
			expect(saved).toHaveBeenCalledWith({
				target: 'actor',
				actor: { type: 'player' },
				operation: 'unregister',
				type: 'keydown'
			});
			wrapper.unmount();
		});

		it('save validation: global/unregister with empty tag does not save, reset saves directly', async () => {
			const wrapper = await mountWindow();
			useRegisterEventCommandSchema();
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.registerEvent.customLoad!({
				target: 'global',
				operation: 'unregister',
				tag: '   '
			});
			await wrapper.vm.$nextTick();
			Command.cases.registerEvent.save!();
			expect(saved).not.toHaveBeenCalled();
			Command.cases.registerEvent.customLoad!({
				target: 'global',
				operation: 'reset'
			});
			await wrapper.vm.$nextTick();
			Command.cases.registerEvent.save!();
			expect(saved).toHaveBeenCalledWith({ target: 'global', operation: 'reset' });
			wrapper.unmount();
		});

		it('窗口打开即按 target 加载 type 选项（不再空下拉/红色无效 autorun）', async () => {
			const wrapper = await mountWindow();
			const { form } = useRegisterEventCommandSchema();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			const prevMerged = Enum.getMergedItems;
			const prevTypes = EventEditor.types;
			// 更贴近真实事件类型表：register_global 首项为 autorun
			Enum.getMergedItems = vi.fn((headItems: unknown[]) => headItems) as never;
			EventEditor.types = {
				all: [{ name: 'Autorun', value: 'autorun' }],
				register_global: [
					{ name: 'Autorun', value: 'autorun' },
					{ name: 'Key Down', value: 'keydown' },
					{ name: 'Key Up', value: 'keyup' }
				],
				register_actor: [
					{ name: 'Autorun', value: 'autorun' },
					{ name: 'Mouse Down LB', value: 'mousedownLB' },
					{ name: 'Click', value: 'click' }
				]
			} as never;
			try {
				CommandSchema.insert(target, 'registerEvent');
				await wrapper.vm.$nextTick();
				const type = document.getElementById('registerEvent-type') as unknown as {
					dataItems?: Array<{ value: string }>;
					read(): unknown;
				};
				// `invalid` 改走元素数据（不再是原型访问器）→ 断言**可见状态**：
				// 值为无效时 core 会给 `.select-box-text` 挂 `invalid` class 并写入原始文本
				const typeInvalid = (): boolean | undefined =>
					document
						.querySelector('#registerEvent-type .select-box-text')
						?.classList.contains('invalid');
				// 修复前：insert 打开窗口后 type 下拉没有任何选项，默认值 autorun 显示为红色无效文本
				expect(dataItemsOf(type)?.map((item) => item.value)).toEqual([
					'autorun',
					'keydown',
					'keyup'
				]);
				expect(type.read()).toBe('autorun');
				expect(typeInvalid()).toBe(false);
				expect(form.type).toBe('autorun');
				// 编辑已有指令（同 target）：选项按 target 刷新且保留已存 type
				Command.cases.registerEvent.customLoad!({
					target: 'global',
					operation: 'register',
					type: 'keydown',
					priority: true,
					namespace: true,
					tag: 'tag1'
				});
				await wrapper.vm.$nextTick();
				expect(dataItemsOf(type)?.map((item) => item.value)).toEqual([
					'autorun',
					'keydown',
					'keyup'
				]);
				expect(type.read()).toBe('keydown');
				expect(typeInvalid()).toBe(false);
				expect(form.type).toBe('keydown');
				// 用户切换 target：按新目标集重载选项（回到该组首个事件类型）
				Command.cases.registerEvent.targetWrite!({ value: 'actor' });
				await wrapper.vm.$nextTick();
				expect(dataItemsOf(type)?.map((item) => item.value)).toEqual([
					'autorun',
					'mousedownLB',
					'click'
				]);
				expect(form.type).toBe('autorun');
				expect(typeInvalid()).toBe(false);
			} finally {
				Enum.getMergedItems = prevMerged;
				EventEditor.types = prevTypes;
			}
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

	describe('useRequestURLCommandSchema（requestURL 命令表单 composable：insert/edit/save/校验路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 method 选项', async () => {
			const wrapper = mount(RequestURL, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const method = document.getElementById('requestURL-method') as unknown as {
				dataItems?: Array<{ value: string }>;
			};
			expect(dataItemsOf(method)).toHaveLength(4);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(RequestURL, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'requestURL');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('requestURL');
			expect(getControl('requestURL-url').read()).toBe('');
			expect(getControl('requestURL-method').read()).toBe('GET');
			expect(getControl('requestURL-callback').read()).toBe('');
			const vm = wrapper.vm as unknown as { form: Record<string, unknown> };
			expect(vm.form.headers).toEqual([]);
			expect(vm.form.data).toEqual([]);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(RequestURL, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'requestURL',
				params: {
					url: 'https://example.com',
					method: 'POST',
					headers: [{ key: 'a', value: 'b' }],
					data: [{ key: 'c', value: 'd' }],
					callback: 'onDone'
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('requestURL');
			expect(getControl('requestURL-url').read()).toBe('https://example.com');
			expect(getControl('requestURL-method').read()).toBe('POST');
			const vm = wrapper.vm as unknown as { form: Record<string, unknown> };
			expect(vm.form.headers).toEqual([{ key: 'a', value: 'b' }]);
			expect(vm.form.data).toEqual([{ key: 'c', value: 'd' }]);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.requestURL.save 保存', async () => {
			const wrapper = mount(RequestURL, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.requestURL.customLoad!({
				url: 'https://example.com',
				method: 'PUT',
				headers: [{ key: 'k', value: 'v' }],
				data: [],
				callback: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.requestURL.save!();
			expect(saved).toHaveBeenCalledWith({
				url: 'https://example.com',
				method: 'PUT',
				headers: [{ key: 'k', value: 'v' }],
				data: [],
				callback: ''
			});
			wrapper.unmount();
		});

		it('save 路径：空 url 校验失败不保存', async () => {
			const wrapper = mount(RequestURL, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.requestURL.customLoad!({
				url: '',
				method: 'GET',
				headers: [],
				data: [],
				callback: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.requestURL.save!();
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

	describe('useReturnCommandSchema（return 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.returnType = 'number';
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(Return, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'return');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('return');
			expect(getControl('return-type').read()).toBe('number');
			expect(getControl('return-number').read()).toBe(0);
			expect(getControl('return-actor').read()).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 按 type 解构 value 到对应控件 DOM', async () => {
			const wrapper = mount(Return, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'return',
				params: { type: 'actor', value: { type: 'player' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('return');
			expect(getControl('return-type').read()).toBe('actor');
			expect(getControl('return-actor').read()).toEqual({ type: 'player' });
			expect(getControl('return-number').read()).toBe(0);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.return.save 保存', async () => {
			const wrapper = mount(Return, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useReturnCommandSchema();
			Command.cases.return.customLoad!({
				type: 'number',
				value: 0
			});
			form.number = 5;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.return.save!();
			expect(saved).toHaveBeenCalledWith({ type: 'number', value: 5 });
			wrapper.unmount();
		});

		it('save 路径：object 为 none 校验失败不保存', async () => {
			const wrapper = mount(Return, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.return.customLoad!({
				type: 'object',
				value: null
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.return.save!();
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

	describe('useSetAngleCommandSchema（setAngle 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 wait 选项', async () => {
			const wrapper = mount(SetAngle, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const wait = document.getElementById('setAngle-wait') as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			expect(dataItemsOf(wait)).toHaveLength(2);
			expect(dataItemsOf(wait)!.map((item) => item.value)).toEqual([true, false]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetAngle, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setAngle');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setAngle');
			expect(getControl('setAngle-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('setAngle-angle').read()).toEqual({ type: 'absolute', degrees: 0 });
			expect(getControl('setAngle-easingId').read()).toBe('easing0');
			expect(getControl('setAngle-duration').read()).toBe(0);
			expect(getControl('setAngle-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetAngle, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setAngle',
				params: {
					actor: { type: 'trigger' },
					angle: { type: 'absolute', degrees: 90 },
					easingId: 'e2',
					duration: 300,
					wait: true
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setAngle');
			expect(getControl('setAngle-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('setAngle-angle').read()).toEqual({ type: 'absolute', degrees: 90 });
			expect(getControl('setAngle-easingId').read()).toBe('e2');
			expect(getControl('setAngle-duration').read()).toBe(300);
			expect(getControl('setAngle-wait').read()).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.setAngle.save 保存', async () => {
			const wrapper = mount(SetAngle, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetAngleCommandSchema();
			Command.cases.setAngle.customLoad!({
				actor: { type: 'trigger' },
				angle: { type: 'absolute', degrees: 0 },
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			form.angle = { type: 'absolute', degrees: 180 };
			form.duration = 1000;
			form.wait = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setAngle.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				angle: { type: 'absolute', degrees: 180 },
				easingId: 'easing0',
				duration: 1000,
				wait: true
			});
			wrapper.unmount();
		});
	});
}
{
	initCommandParseBridges();

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetAnimationCommandSchema（setAnimation 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.manifest = { guidMap: {} } as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetAnimationCommandSchema();
			CommandSchema.insert(target, 'setAnimation');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setAnimation');
			expect(form.element).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetAnimationCommandSchema();
			CommandSchema.edit(target, {
				id: 'setAnimation',
				params: {
					element: { type: 'trigger' },
					properties: [{ key: 'animation', value: 'a1' }]
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setAnimation');
			expect(form.element).toEqual({ type: 'trigger' });
			expect(form.properties).toEqual([{ key: 'animation', value: 'a1' }]);
			wrapper.unmount();
		});

		it('save 路径：properties 为空时校验失败不保存', async () => {
			const wrapper = mount(SetAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setAnimation.customLoad!({
				element: { type: 'trigger' },
				properties: []
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setAnimation.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：properties 非空时经 Command.cases.setAnimation.save 保存', async () => {
			const wrapper = mount(SetAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setAnimation.customLoad!({
				element: { type: 'trigger' },
				properties: [{ key: 'animation', value: 'a1' }]
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setAnimation.save!();
			expect(saved).toHaveBeenCalledWith({
				element: { type: 'trigger' },
				properties: [{ key: 'animation', value: 'a1' }]
			});
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
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetAnimationComponentCommandSchema（setAnimationComponent 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Animation.getMotionListItems = vi.fn(() => [{ name: 'Idle', value: 'idle' }]) as never;
			Animation.getSpriteListItems = vi.fn(() => [{ name: 'Body', value: 'body' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 operation/wait 选项', async () => {
			const wrapper = mount(SetAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const operation = document.getElementById(
				'setAnimationComponent-operation'
			) as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const wait = document.getElementById('setAnimationComponent-wait') as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			expect(dataItemsOf(operation)).toHaveLength(9);
			expect(dataItemsOf(wait)!.map((item) => item.value)).toEqual([true, false]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setAnimationComponent');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setAnimationComponent');
			expect(getControl('setAnimationComponent-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('setAnimationComponent-animationId').read()).toBe('');
			expect(getControl('setAnimationComponent-operation').read()).toBe('set-angle');
			expect(getControl('setAnimationComponent-angle').read()).toEqual({
				type: 'absolute',
				degrees: 0
			});
			expect(getControl('setAnimationComponent-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setAnimationComponent',
				params: {
					actor: { type: 'player' },
					animationId: 'anim1',
					motion: 'idle',
					operation: 'set-speed',
					speed: 2
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setAnimationComponent');
			expect(getControl('setAnimationComponent-actor').read()).toEqual({ type: 'player' });
			expect(getControl('setAnimationComponent-animationId').read()).toBe('anim1');
			expect(getControl('setAnimationComponent-operation').read()).toBe('set-speed');
			expect(getControl('setAnimationComponent-speed').read()).toBe(2);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setAnimationComponent.save 保存', async () => {
			const wrapper = mount(SetAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setAnimationComponent.customLoad!({
				actor: { type: 'trigger' },
				animationId: 'anim1',
				motion: 'idle',
				operation: 'set-angle',
				angle: { type: 'absolute', degrees: 0 }
			});
			getControl('setAnimationComponent-operation').input('set-sprite');
			getControl('setAnimationComponent-spriteId').input('body');
			getControl('setAnimationComponent-image').input('img1');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setAnimationComponent.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				animationId: 'anim1',
				motion: 'idle',
				operation: 'set-sprite',
				spriteId: 'body',
				image: 'img1'
			});
			wrapper.unmount();
		});

		it('save 路径：空 animationId 校验失败不保存', async () => {
			const wrapper = mount(SetAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setAnimationComponent.customLoad!({
				actor: { type: 'trigger' },
				animationId: '',
				motion: '',
				operation: 'set-angle'
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setAnimationComponent.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});
	});
}
