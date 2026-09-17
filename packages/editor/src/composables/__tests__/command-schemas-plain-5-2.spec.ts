import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { Command, initCommandParseBridges } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';
import { Data } from '@app/data/data-object.ts';
import SetVideo from '@app/components/commands/SetVideo.vue';
import SetVolume from '@app/components/commands/SetVolume.vue';
import { useSetVolumeCommandSchema } from '@app/composables/useSetVolumeCommandSchema';
import SetWeight from '@app/components/commands/SetWeight.vue';
import { useSetWeightCommandSchema } from '@app/composables/commands/useSetWeightCommandSchema';
import SetWindow from '@app/components/commands/SetWindow.vue';
import SetZoomFactor from '@app/components/commands/SetZoomFactor.vue';
import { useSetZoomFactorCommandSchema } from '@app/composables/commands/useSetZoomFactorCommandSchema';
import ShakeScreen from '@app/components/commands/ShakeScreen.vue';
import { useShakeScreenCommandSchema } from '@app/composables/commands/useShakeScreenCommandSchema';
import ShowText from '@app/components/commands/ShowText.vue';
import SimulateKey from '@app/components/commands/SimulateKey.vue';
import StopActorAnimation from '@app/components/commands/StopActorAnimation.vue';
import { useStopActorAnimationCommandSchema } from '@app/composables/commands/useStopActorAnimationCommandSchema';
import StopAudio from '@app/components/commands/StopAudio.vue';
import { useStopAudioCommandSchema } from '@app/composables/commands/useStopAudioCommandSchema';
import { dataItemsOf } from '@app/__tests__/element-data-read';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

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

	describe('useSetVideoCommandSchema（setVideo 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetVideo, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setVideo');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setVideo');
			expect(getControl('setVideo-element').read()).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetVideo, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setVideo',
				params: {
					element: { type: 'trigger' },
					properties: [{ key: 'content', value: 'hi' }]
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setVideo');
			expect(getControl('setVideo-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('setVideo-properties').read()).toEqual([
				{ key: 'content', value: 'hi' }
			]);
			wrapper.unmount();
		});

		it('save 路径：properties 为空时校验失败不保存', async () => {
			const wrapper = mount(SetVideo, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setVideo.customLoad!({ element: { type: 'trigger' }, properties: [] });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setVideo.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：properties 非空时经 Command.cases.setVideo.save 保存', async () => {
			const wrapper = mount(SetVideo, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setVideo.customLoad!({
				element: { type: 'trigger' },
				properties: [{ key: 'content', value: 'hi' }]
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setVideo.save!();
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

	describe('useSetVolumeCommandSchema（setVolume 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetVolume, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setVolume');
			expect(Window.open).toHaveBeenCalledWith('setVolume');
			expect(getControl('setVolume-type').read()).toBe('bgm');
			expect(getControl('setVolume-volume').read()).toBe(1);
			expect(getControl('setVolume-easingId').read()).toBe('easing0');
			expect(getControl('setVolume-duration').read()).toBe(0);
			expect(getControl('setVolume-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetVolume, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setVolume',
				params: { type: 'se', volume: 0.5, easingId: 'e2', duration: 300, wait: true }
			});
			expect(Window.open).toHaveBeenCalledWith('setVolume');
			expect(getControl('setVolume-type').read()).toBe('se');
			expect(getControl('setVolume-volume').read()).toBe(0.5);
			expect(getControl('setVolume-easingId').read()).toBe('e2');
			expect(getControl('setVolume-duration').read()).toBe(300);
			expect(getControl('setVolume-wait').read()).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.setVolume.save 保存', async () => {
			const wrapper = mount(SetVolume, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetVolumeCommandSchema();
			Command.cases.setVolume.customLoad!({
				type: 'bgm',
				volume: 1,
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			form.type = 'cv';
			form.volume = 0.8;
			form.duration = 500;
			form.wait = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setVolume.save!();
			expect(saved).toHaveBeenCalledWith({
				type: 'cv',
				volume: 0.8,
				easingId: 'easing0',
				duration: 500,
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

	describe('useSetWeightCommandSchema（setWeight 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetWeight, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetWeightCommandSchema();
			CommandSchema.insert(target, 'setWeight');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setWeight');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.weight).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetWeight, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetWeightCommandSchema();
			CommandSchema.edit(target, {
				id: 'setWeight',
				params: { actor: { type: 'player' }, weight: 3.5 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setWeight');
			expect(form.actor).toEqual({ type: 'player' });
			expect(form.weight).toBe(3.5);
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.setWeight.save 保存', async () => {
			const wrapper = mount(SetWeight, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetWeightCommandSchema();
			Command.cases.setWeight.customLoad!({ actor: { type: 'trigger' }, weight: 0 });
			form.weight = 2.5;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setWeight.save!();
			expect(saved).toHaveBeenCalledWith({ actor: { type: 'trigger' }, weight: 2.5 });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor + weight 文本', () => {
			setWords();
			Command.parseActor = vi.fn((a: { type: string }) => `A:${a.type}`) as never;
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
			const contents = Command.cases.setWeight.parse!({
				actor: { type: 'trigger' },
				weight: 0
			});
			expect(contents).toContainEqual({ text: 'A:triggerN:0' });
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

	describe('useSetWindowCommandSchema（setWindow 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SetWindow, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'setWindow');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setWindow');
			expect(getControl('setWindow-element').read()).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SetWindow, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'setWindow',
				params: {
					element: { type: 'trigger' },
					properties: [{ key: 'content', value: 'hi' }]
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setWindow');
			expect(getControl('setWindow-element').read()).toEqual({ type: 'trigger' });
			expect(getControl('setWindow-properties').read()).toEqual([
				{ key: 'content', value: 'hi' }
			]);
			wrapper.unmount();
		});

		it('save 路径：properties 为空时校验失败不保存', async () => {
			const wrapper = mount(SetWindow, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setWindow.customLoad!({ element: { type: 'trigger' }, properties: [] });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setWindow.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：properties 非空时经 Command.cases.setWindow.save 保存', async () => {
			const wrapper = mount(SetWindow, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setWindow.customLoad!({
				element: { type: 'trigger' },
				properties: [{ key: 'content', value: 'hi' }]
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setWindow.save!();
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

	describe('useSetZoomFactorCommandSchema（setZoomFactor 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetZoomFactor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetZoomFactorCommandSchema();
			CommandSchema.insert(target, 'setZoomFactor');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setZoomFactor');
			expect(form.zoom).toBe(1);
			expect(form.easingId).toBe('easing0');
			expect(form.duration).toBe(0);
			expect(form.wait).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetZoomFactor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetZoomFactorCommandSchema();
			CommandSchema.edit(target, {
				id: 'setZoomFactor',
				params: { zoom: 2.5, easingId: 'e2', duration: 400, wait: true }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setZoomFactor');
			expect(form.zoom).toBe(2.5);
			expect(form.easingId).toBe('e2');
			expect(form.duration).toBe(400);
			expect(form.wait).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.setZoomFactor.save 保存', async () => {
			const wrapper = mount(SetZoomFactor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetZoomFactorCommandSchema();
			Command.cases.setZoomFactor.customLoad!({
				zoom: 1,
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			form.zoom = 1.5;
			form.wait = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setZoomFactor.save!();
			expect(saved).toHaveBeenCalledWith({
				zoom: 1.5,
				easingId: 'easing0',
				duration: 0,
				wait: true
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 zoom + easing 文本', () => {
			setWords();
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
			Command.parseEasing = vi.fn(() => 'EASING') as never;
			const contents = Command.cases.setZoomFactor.parse!({
				zoom: 1,
				easingId: 'easing0',
				duration: 0,
				wait: false
			});
			expect(contents).toContainEqual({ text: 'N:1EASING' });
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

	describe('useShakeScreenCommandSchema（shakeScreen 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
			Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(ShakeScreen, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useShakeScreenCommandSchema();
			CommandSchema.insert(target, 'shakeScreen');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('shakeScreen');
			expect(form.mode).toBe('random');
			expect(form.power).toBe(5);
			expect(form.speed).toBe(10);
			expect(form.easingId).toBe('easing0');
			expect(form.duration).toBe(200);
			expect(form.wait).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(ShakeScreen, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useShakeScreenCommandSchema();
			CommandSchema.edit(target, {
				id: 'shakeScreen',
				params: {
					mode: 'vertical',
					power: 8,
					speed: 4,
					easingId: 'e2',
					duration: 500,
					wait: true
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('shakeScreen');
			expect(form.mode).toBe('vertical');
			expect(form.power).toBe(8);
			expect(form.speed).toBe(4);
			expect(form.easingId).toBe('e2');
			expect(form.duration).toBe(500);
			expect(form.wait).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.shakeScreen.save 保存', async () => {
			const wrapper = mount(ShakeScreen, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useShakeScreenCommandSchema();
			Command.cases.shakeScreen.customLoad!({
				mode: 'random',
				power: 5,
				speed: 10,
				easingId: 'easing0',
				duration: 200,
				wait: false
			});
			form.mode = 'horizontal';
			form.duration = 800;
			form.wait = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.shakeScreen.save!();
			expect(saved).toHaveBeenCalledWith({
				mode: 'horizontal',
				power: 5,
				speed: 10,
				easingId: 'easing0',
				duration: 800,
				wait: true
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染模式 + 强度 + 缓动文本', () => {
			setWords();
			Command.setNumberColor = vi.fn((v: unknown) => `C:${String(v)}`) as never;
			Command.parseEasing = vi.fn(() => 'EASING') as never;
			const contents = Command.cases.shakeScreen.parse!({
				mode: 'random',
				power: 5,
				speed: 10,
				easingId: 'easing0',
				duration: 200,
				wait: false
			});
			const text = (contents[2] as { text: string }).text;
			expect(text).toContain('random');
			expect(text).toContain('C:5');
			expect(text).toContain('C:10');
			expect(text).toContain('EASING');
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

	describe('useShowTextCommandSchema（showText 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口后 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(ShowText, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'showText');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('showText');
			expect(getControl('showText-target').read()).toEqual({ type: 'trigger' });
			expect(getControl('showText-parameters').read()).toBe('');
			expect(getControl('showText-content').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(ShowText, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'showText',
				params: { target: { type: 'trigger' }, parameters: 'a,b', content: 'hello\nworld' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('showText');
			expect(getControl('showText-parameters').read()).toBe('a,b');
			expect(getControl('showText-content').read()).toBe('hello\nworld');
			wrapper.unmount();
		});

		it('save 路径：content 为空时校验失败不保存', async () => {
			const wrapper = mount(ShowText, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.showText.customLoad!({ content: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.showText.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：用户输入后经 Command.cases.showText.save 保存', async () => {
			const wrapper = mount(ShowText, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.showText.customLoad!({ content: '' });
			getControl('showText-content').write('hello');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.showText.save!();
			expect(saved).toHaveBeenCalledWith({
				target: { type: 'trigger' },
				parameters: '',
				content: 'hello'
			});
			wrapper.unmount();
		});
	});
}
{
	interface ControlEl extends HTMLElement {
		read(): unknown;
		input(value: unknown): void;
		inputCode(code: number): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSimulateKeyCommandSchema（simulateKey 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 operation 选项', async () => {
			const wrapper = mount(SimulateKey, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const operation = document.getElementById('simulateKey-operation') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(dataItemsOf(operation)).toHaveLength(3);
			expect(dataItemsOf(operation)!.map((item) => item.value)).toEqual([
				'click',
				'press',
				'release'
			]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(SimulateKey, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'simulateKey');
			expect(Window.open).toHaveBeenCalledWith('simulateKey');
			expect(getControl('simulateKey-operation').read()).toBe('click');
			expect(getControl('simulateKey-keycode').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(SimulateKey, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'simulateKey',
				params: { operation: 'press', keycode: 65 }
			});
			expect(Window.open).toHaveBeenCalledWith('simulateKey');
			expect(getControl('simulateKey-operation').read()).toBe('press');
			expect(getControl('simulateKey-keycode').read()).toBe(65);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.simulateKey.save 保存', async () => {
			const wrapper = mount(SimulateKey, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.simulateKey.customLoad!({ operation: 'click', keycode: '' });
			getControl('simulateKey-operation').input('release');
			getControl('simulateKey-keycode').inputCode(87);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.simulateKey.save!();
			expect(saved).toHaveBeenCalledWith({ operation: 'release', keycode: 87 });
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

	describe('useStopActorAnimationCommandSchema（stopActorAnimation 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(StopActorAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useStopActorAnimationCommandSchema();
			CommandSchema.insert(target, 'stopActorAnimation');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('stopActorAnimation');
			expect(form.actor).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(StopActorAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useStopActorAnimationCommandSchema();
			CommandSchema.edit(target, {
				id: 'stopActorAnimation',
				params: { actor: { type: 'player' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('stopActorAnimation');
			expect(form.actor).toEqual({ type: 'player' });
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.stopActorAnimation.save 保存', async () => {
			const wrapper = mount(StopActorAnimation, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useStopActorAnimationCommandSchema();
			Command.cases.stopActorAnimation.customLoad!({ actor: { type: 'trigger' } });
			form.actor = { type: 'global' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.stopActorAnimation.save!();
			expect(saved).toHaveBeenCalledWith({ actor: { type: 'global' } });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor 文本', () => {
			setWords();
			Command.parseActor = vi.fn((a: { type: string }) => `A:${a.type}`) as never;
			const contents = Command.cases.stopActorAnimation.parse!({
				actor: { type: 'trigger' }
			});
			expect(contents).toContainEqual({ text: 'A:trigger' });
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

	describe('useStopAudioCommandSchema（stopAudio 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(StopAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useStopAudioCommandSchema();
			CommandSchema.insert(target, 'stopAudio');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('stopAudio');
			expect(form.type).toBe('bgm');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(StopAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useStopAudioCommandSchema();
			CommandSchema.edit(target, { id: 'stopAudio', params: { type: 'se' } });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('stopAudio');
			expect(form.type).toBe('se');
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.stopAudio.save 保存', async () => {
			const wrapper = mount(StopAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useStopAudioCommandSchema();
			Command.cases.stopAudio.customLoad!({ type: 'bgm' });
			form.type = 'all';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.stopAudio.save!();
			expect(saved).toHaveBeenCalledWith({ type: 'all' });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染音频类型文本', () => {
			setWords();
			Command.parseAudioType = vi.fn((v: unknown) => `AT:${String(v)}`) as never;
			const contents = Command.cases.stopAudio.parse!({ type: 'bgm' });
			expect(contents).toContainEqual({ text: 'AT:bgm' });
		});
	});
}
