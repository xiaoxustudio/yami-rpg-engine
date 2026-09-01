import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { Command, initCommandParseBridges } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
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
import { useSetShortcutCommandSchema } from '@app/composables/commands/useSetShortcutCommandSchema';
import SetSkill from '@app/components/commands/SetSkill.vue';
import { useSetSkillCommandSchema } from '@app/composables/commands/useSetSkillCommandSchema';
import SetState from '@app/components/commands/SetState.vue';
import { useSetStateCommandSchema } from '@app/composables/commands/useSetStateCommandSchema';
import SetString from '@app/components/commands/SetString.vue';
import { useSetStringCommandSchema } from '@app/composables/commands/useSetStringCommandSchema';

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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
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
			// oxlint-disable-next-line no-base-to-string
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setShortcut');
			expect(getControl('setShortcut-operation').read()).toBe('swap-shortcuts');
			expect(getControl('setShortcut-key').read()).toBe('key1');
			expect(getControl('setShortcut-key2').read()).toBe('key2');
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.setShortcut.save 保存', async () => {
			const wrapper = mount(SetShortcut, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetShortcutCommandSchema();
			Command.cases.setShortcut.customLoad!({
				actor: { type: 'trigger' },
				operation: 'set-item-shortcut',
				itemId: 'item1',
				key: 'key1'
			});
			form.operation = 'set-skill-shortcut';
			form.skillId = 'skill1';
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
			const { form } = useSetSkillCommandSchema();
			Command.cases.setSkill.customLoad!({
				skill: { type: 'trigger' },
				operation: 'set-cooldown',
				cooldown: 0
			});
			form.skill = { type: 'player' };
			form.cooldown = 500;
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
			// oxlint-disable-next-line no-base-to-string
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
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
			// oxlint-disable-next-line no-base-to-string
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
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
			await wrapper.vm.$nextTick();
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
			await wrapper.vm.$nextTick();
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
			const { form } = useSetStringCommandSchema();
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
			form.stringMethod = 'char';
			form.stringCharIndex = 7;
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
