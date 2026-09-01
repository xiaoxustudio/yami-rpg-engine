import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import GetMultipleActors from '@app/components/commands/GetMultipleActors.vue';
import { useGetMultipleActorsCommandSchema } from '@app/composables/commands/useGetMultipleActorsCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';
import GetObjectProperty from '@app/components/commands/GetObjectProperty.vue';
import { useGetObjectPropertyCommandSchema } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import GetTarget from '@app/components/commands/GetTarget.vue';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { useGetTargetCommandSchema } from '@app/composables/commands/useGetTargetCommandSchema';
import HttpRequest from '@app/components/commands/HttpRequest.vue';
import { useHttpRequestCommandSchema } from '@app/composables/commands/useHttpRequestCommandSchema';
import JumpToWindow from '@app/components/commands/JumpTo.vue';
import { EventEditor } from '@app/commands/event-editor.ts';
import Label from '@app/components/commands/Label.vue';
import { useLabelCommandSchema } from '@app/composables/commands/useLabelCommandSchema';
import LoadImage from '@app/components/commands/LoadImage.vue';
import { useLoadImageCommandSchema } from '@app/composables/commands/useLoadImageCommandSchema';
import { Enum } from '@app/enum/enum-window.ts';
import LoadScene from '@app/components/commands/LoadScene.vue';
import Loop from '@app/components/commands/Loop.vue';
import { useLoopCommandSchema } from '@app/composables/commands/useLoopCommandSchema';
import MoveActor from '@app/components/commands/MoveActor.vue';

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

	describe('useGetMultipleActorsCommandSchema（getMultipleActors 命令表单 composable：insert/edit/save 裁剪路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
			Data.teams = { list: [{ id: 'team0' }] } as never;
		});

		it('onMounted loadItems 填充 area/selector/activation 选项', async () => {
			const wrapper = mount(GetMultipleActors, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			expect(
				(
					document.getElementById('getMultipleActors-area') as unknown as {
						dataItems?: Array<{ value: string }>;
					}
				).dataItems
			).toHaveLength(2);
			expect(
				(
					document.getElementById('getMultipleActors-selector') as unknown as {
						dataItems?: Array<{ value: string }>;
					}
				).dataItems
			).toHaveLength(4);
			expect(
				(
					document.getElementById('getMultipleActors-activation') as unknown as {
						dataItems?: Array<{ value: string }>;
					}
				).dataItems
			).toHaveLength(3);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(GetMultipleActors, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'getMultipleActors');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('getMultipleActors');
			expect(getControl('getMultipleActors-variable').read()).toEqual({
				type: 'local',
				key: ''
			});
			expect(getControl('getMultipleActors-area').read()).toBe('rectangle');
			expect(getControl('getMultipleActors-width').read()).toBe(1);
			expect(getControl('getMultipleActors-height').read()).toBe(1);
			expect(getControl('getMultipleActors-radius').read()).toBe(0.5);
			expect(getControl('getMultipleActors-selector').read()).toBe('enemy');
			expect(getControl('getMultipleActors-activation').read()).toBe('active');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(GetMultipleActors, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'getMultipleActors',
				params: {
					variable: { type: 'local', key: 'list' },
					position: { type: 'absolute', x: 1, y: 2 },
					area: 'circle',
					radius: 3,
					selector: 'any',
					activation: 'inactive'
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('getMultipleActors');
			expect(getControl('getMultipleActors-variable').read()).toEqual({
				type: 'local',
				key: 'list'
			});
			expect(getControl('getMultipleActors-area').read()).toBe('circle');
			expect(getControl('getMultipleActors-radius').read()).toBe(3);
			expect(getControl('getMultipleActors-selector').read()).toBe('any');
			expect(getControl('getMultipleActors-activation').read()).toBe('inactive');
			wrapper.unmount();
		});

		it('save 路径：rectangle + team 组合保存 area/width/height/teamId 并裁剪 radius', async () => {
			const wrapper = mount(GetMultipleActors, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useGetMultipleActorsCommandSchema();
			Command.cases.getMultipleActors.customLoad!({
				variable: { type: 'local', key: 'list' },
				position: { type: 'absolute', x: 0, y: 0 },
				area: 'rectangle',
				width: 2,
				height: 3,
				radius: 0.5,
				selector: 'friend',
				teamId: 'team1',
				activation: 'active'
			});
			form.width = 4;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.getMultipleActors.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'list' },
				position: { type: 'absolute', x: 0, y: 0 },
				area: 'rectangle',
				width: 4,
				height: 3,
				selector: 'friend',
				teamId: 'team1',
				activation: 'active'
			});
			wrapper.unmount();
		});

		it('save 路径：circle + any 组合保存 radius 并裁剪 width/height/teamId', async () => {
			const wrapper = mount(GetMultipleActors, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.getMultipleActors.customLoad!({
				variable: { type: 'local', key: 'list' },
				position: { type: 'absolute', x: 0, y: 0 },
				area: 'circle',
				radius: 3,
				selector: 'any',
				activation: 'either'
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.getMultipleActors.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'list' },
				position: { type: 'absolute', x: 0, y: 0 },
				area: 'circle',
				radius: 3,
				selector: 'any',
				activation: 'either'
			});
			wrapper.unmount();
		});

		it('save 路径：variable 无效校验失败不保存', async () => {
			const wrapper = mount(GetMultipleActors, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.getMultipleActors.customLoad!({
				variable: { type: 'local', key: '' },
				position: { type: 'absolute', x: 0, y: 0 },
				area: 'rectangle',
				width: 1,
				height: 1,
				selector: 'enemy',
				activation: 'active'
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.getMultipleActors.save!();
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
			const { form } = useGetObjectPropertyCommandSchema();
			CommandSchema.insert(target, 'getObjectProperty');
			expect(Window.open).toHaveBeenCalledWith('getObjectProperty');
			expect(form.variable).toEqual({
				type: 'local',
				key: ''
			});
			expect(form.saveVariable).toEqual({
				type: 'local',
				key: ''
			});
			expect(form.properties).toEqual([]);
			wrapper.unmount();
		});

		it('save 路径：properties 非空时保存 variable/saveVariable/properties', async () => {
			const wrapper = mount(GetObjectProperty, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.getObjectProperty.customLoad!({
				variable: { type: 'global', key: 'g' },
				saveVariable: { type: 'local', key: 'out' },
				properties: [{ text: 'x' }, { text: 'y' }]
			});
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
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useGetTargetCommandSchema（getTarget 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Attribute.getDefAttributeId = vi.fn(() => 'atk') as never;
			Attribute.getAttributeItems = vi.fn(() => [
				{ name: 'Attack', value: 'atk' },
				{ name: 'Defense', value: 'def' }
			]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		const mountWindow = async () => {
			const wrapper = mount(GetTarget, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			return wrapper;
		};

		it('onMounted loadItems 填充 selector/condition 选项', async () => {
			const wrapper = await mountWindow();
			const selector = document.getElementById('getTarget-selector') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const condition = document.getElementById('getTarget-condition') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(selector.dataItems).toHaveLength(6);
			expect(condition.dataItems).toHaveLength(8);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = await mountWindow();
			const { form } = useGetTargetCommandSchema();
			CommandSchema.insert(target, 'getTarget');
			expect(Window.open).toHaveBeenCalledWith('getTarget');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.selector).toBe('enemy');
			expect(form.condition).toBe('max-threat');
			expect(form.attribute).toBe('atk');
			expect(form.divisor).toBe('atk');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = await mountWindow();
			const { form } = useGetTargetCommandSchema();
			CommandSchema.edit(target, {
				id: 'getTarget',
				params: {
					actor: { type: 'player' },
					selector: 'team',
					condition: 'max-attribute-ratio',
					attribute: 'atk',
					divisor: 'def'
				}
			});
			expect(Window.open).toHaveBeenCalledWith('getTarget');
			expect(form.selector).toBe('team');
			expect(form.condition).toBe('max-attribute-ratio');
			expect(form.attribute).toBe('atk');
			expect(form.divisor).toBe('def');
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.getTarget.save 保存', async () => {
			const wrapper = await mountWindow();
			const { form } = useGetTargetCommandSchema();
			Command.cases.getTarget.customLoad!({
				actor: { type: 'trigger' },
				selector: 'enemy',
				condition: 'max-threat'
			});
			form.selector = 'friend';
			form.condition = 'min-attribute-value';
			form.attribute = 'def';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.getTarget.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				selector: 'friend',
				condition: 'min-attribute-value',
				attribute: 'def'
			});
			wrapper.unmount();
		});

		it('save 路径：attribute 为空校验失败不保存', async () => {
			const wrapper = await mountWindow();
			useGetTargetCommandSchema();
			Command.cases.getTarget.customLoad!({
				actor: { type: 'trigger' },
				selector: 'enemy',
				condition: 'max-attribute-value',
				attribute: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.getTarget.save!();
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

	describe('useHttpRequestCommandSchema（httpRequest 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = (v: unknown) => v === null || v === undefined || v === '';
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(HttpRequest, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useHttpRequestCommandSchema();
			CommandSchema.insert(target, 'httpRequest');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('httpRequest');
			expect(form.url).toBe('');
			expect(form.method).toBe('GET');
			expect(form.responseType).toBe('json');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(HttpRequest, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useHttpRequestCommandSchema();
			CommandSchema.edit(target, {
				id: 'httpRequest',
				params: { url: 'https://x', method: 'POST', headers: [{ key: 'k', value: 'v' }] }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('httpRequest');
			expect(form.url).toBe('https://x');
			expect(form.method).toBe('POST');
			wrapper.unmount();
		});

		it('save 校验：url 为空不保存', async () => {
			const wrapper = mount(HttpRequest, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.httpRequest.customLoad!({
				url: '',
				method: 'GET',
				headers: [],
				data: [],
				callback: '',
				timeout: '',
				responseType: 'json',
				withCredentials: false,
				authUser: '',
				authPass: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.httpRequest.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：url 非空且 timeout 转数字保存', async () => {
			const wrapper = mount(HttpRequest, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useHttpRequestCommandSchema();
			Command.cases.httpRequest.customLoad!({
				url: 'https://x',
				method: 'GET',
				headers: [{ key: 'k', value: 'v' }],
				data: [],
				callback: '',
				timeout: '5000',
				responseType: 'json',
				withCredentials: true,
				authUser: '',
				authPass: ''
			});
			form.url = 'https://x';
			form.timeout = 8000;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.httpRequest.save!();
			expect(saved).toHaveBeenCalledWith({
				url: 'https://x',
				method: 'GET',
				headers: [{ key: 'k', value: 'v' }],
				data: [],
				callback: '',
				timeout: 8000,
				responseType: 'json',
				withCredentials: true,
				authUser: '',
				authPass: ''
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 URL 文本', () => {
			const contents = Command.cases.httpRequest.parse!({
				url: 'https://x',
				method: 'GET',
				headers: [],
				data: [],
				callback: '',
				timeout: '',
				responseType: 'json',
				withCredentials: false,
				authUser: '',
				authPass: ''
			});
			expect(contents[0]).toHaveProperty('color');
			expect(contents).toContainEqual({ text: 'https://x' });
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

	describe('useJumpToCommandSchema (jumpTo command insert/edit/save paths and label suggestions)', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		const mountWindow = async () => {
			const wrapper = mount(JumpToWindow, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			return wrapper;
		};

		it('insert path: CommandSchema.insert opens jumpTo window and loads default form', async () => {
			const wrapper = await mountWindow();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			CommandSchema.insert(target, 'jumpTo');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('jumpTo');
			expect(getControl('jumpTo-operation').read()).toBe('jump');
			expect(getControl('jumpTo-label').read()).toBe('');
			wrapper.unmount();
		});

		it('edit path: CommandSchema.edit maps params to form, save-jump saves with label', async () => {
			const wrapper = await mountWindow();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			CommandSchema.edit(target, {
				id: 'jumpTo',
				params: { operation: 'save-jump', label: 'boss' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('jumpTo');
			expect(getControl('jumpTo-operation').read()).toBe('save-jump');
			expect(getControl('jumpTo-label').read()).toBe('boss');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.jumpTo.save!();
			expect(saved).toHaveBeenCalledWith({ operation: 'save-jump', label: 'boss' });
			wrapper.unmount();
		});

		it('save validation: jump with empty label does not save, return saves directly', async () => {
			const wrapper = await mountWindow();
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.jumpTo.customLoad!({ operation: 'jump', label: '  ' });
			await wrapper.vm.$nextTick();
			Command.cases.jumpTo.save!();
			expect(saved).not.toHaveBeenCalled();
			Command.cases.jumpTo.customLoad!({ operation: 'return', label: '' });
			await wrapper.vm.$nextTick();
			Command.cases.jumpTo.save!();
			expect(saved).toHaveBeenCalledWith({ operation: 'return' });
			wrapper.unmount();
		});

		it('loadLabels collects label commands from the event list and sorts by name', async () => {
			const wrapper = await mountWindow();
			const { useJumpToCommandSchema } =
				await import('@app/composables/commands/useJumpToCommandSchema');
			const { loadLabels } = useJumpToCommandSchema();
			Command.forEachCommand = ((
				commands: unknown,
				fn: (command: { id: string; params: { name: string } }) => void
			) => {
				for (const command of commands as Array<{ id: string; params: { name: string } }>) {
					fn(command);
				}
			}) as never;
			EventEditor.commandList = {
				read: () => [
					{ id: 'label', params: { name: 'boss' } },
					{ id: 'comment', params: {} },
					{ id: 'label', params: { name: 'start' } }
				]
			} as never;
			expect(loadLabels()).toEqual([
				{ name: 'boss', icon: 'icon-label' },
				{ name: 'start', icon: 'icon-label' }
			]);
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

	describe('useLabelCommandSchema（label 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form（name 空）', async () => {
			const wrapper = mount(Label, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useLabelCommandSchema();
			CommandSchema.insert(target, 'label');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('label');
			expect(form.name).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(Label, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useLabelCommandSchema();
			CommandSchema.edit(target, { id: 'label', params: { name: 'start' } });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('label');
			expect(form.name).toBe('start');
			wrapper.unmount();
		});

		it('save 校验：name 必填，为空不保存', async () => {
			const wrapper = mount(Label, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.label.customLoad!({ name: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.label.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.label.save 保存', async () => {
			const wrapper = mount(Label, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useLabelCommandSchema();
			Command.cases.label.customLoad!({ name: 'a' });
			form.name = 'start';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.label.save!();
			expect(saved).toHaveBeenCalledWith({ name: 'start' });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 label 名称', () => {
			const contents = Command.cases.label.parse!({ name: 'start' });
			expect(contents[0]).toHaveProperty('color');
			expect(contents[3]).toHaveProperty('text');
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

	describe('useLoadImageCommandSchema（loadImage 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.enumeration = { context: { getString: (id: string) => id } } as never;
			Enum.getStringItems = vi.fn(() => [{ name: 'k0', value: 'k0' }]) as never;
			Enum.getDefStringId = vi.fn(() => 'k0') as never;
			VariableGetter.isNone = (v: unknown) => v === null || v === undefined;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(LoadImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useLoadImageCommandSchema();
			CommandSchema.insert(target, 'loadImage');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('loadImage');
			expect(form.element).toEqual({ type: 'trigger' });
			expect(form.type).toBe('actor-portrait');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(LoadImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useLoadImageCommandSchema();
			CommandSchema.edit(target, {
				id: 'loadImage',
				params: {
					element: { type: 'player' },
					type: 'skill-icon',
					skill: { type: 'trigger' }
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('loadImage');
			expect(form.element).toEqual({ type: 'player' });
			expect(form.type).toBe('skill-icon');
			wrapper.unmount();
		});

		it('save 路径：skill-icon 保存 element + type + skill', async () => {
			const wrapper = mount(LoadImage, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useLoadImageCommandSchema();
			Command.cases.loadImage.customLoad!({
				element: { type: 'trigger' },
				type: 'skill-icon',
				skill: { type: 'trigger' }
			});
			form.type = 'skill-icon';
			form.skill = { type: 'fire' };
			getControl('loadImage-skill').input({ type: 'fire' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.loadImage.save!();
			expect(saved).toHaveBeenCalledWith({
				element: { type: 'trigger' },
				type: 'skill-icon',
				skill: { type: 'fire' }
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor 文本', () => {
			setWords();
			Command.parseElement = vi.fn(
				(e: unknown) => `E:${(e as { type: string }).type}`
			) as never;
			Command.parseActor = vi.fn(
				(a: unknown) => `A:${(a as { type: string }).type}`
			) as never;
			const contents = Command.cases.loadImage.parse!({
				element: { type: 'trigger' },
				type: 'actor-portrait',
				actor: { type: 'player' }
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

	describe('useLoadSceneCommandSchema（loadScene 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(LoadScene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'loadScene');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('loadScene');
			expect(getControl('loadScene-sceneId').read()).toBe('');
			expect(getControl('loadScene-transfer').read()).toBe(true);
			expect(getControl('loadScene-x').read()).toBe(0);
			expect(getControl('loadScene-y').read()).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(LoadScene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'loadScene',
				params: { sceneId: 'scene1', transfer: true, x: 10, y: 20 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('loadScene');
			expect(getControl('loadScene-sceneId').read()).toBe('scene1');
			expect(getControl('loadScene-transfer').read()).toBe(true);
			expect(getControl('loadScene-x').read()).toBe(10);
			expect(getControl('loadScene-y').read()).toBe(20);
			wrapper.unmount();
		});

		it('save 路径：sceneId 为空时校验失败不保存', async () => {
			const wrapper = mount(LoadScene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.loadScene.customLoad!({ sceneId: '', transfer: true, x: 0, y: 0 });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.loadScene.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：transfer=true 时保存 sceneId/transfer/x/y', async () => {
			const wrapper = mount(LoadScene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.loadScene.customLoad!({
				sceneId: 'scene1',
				transfer: true,
				x: 10,
				y: 20
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.loadScene.save!();
			expect(saved).toHaveBeenCalledWith({ sceneId: 'scene1', transfer: true, x: 10, y: 20 });
			wrapper.unmount();
		});

		it('save 路径：transfer=false 时仅保存 sceneId/transfer', async () => {
			const wrapper = mount(LoadScene, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.loadScene.customLoad!({
				sceneId: 'scene1',
				transfer: false,
				x: 10,
				y: 20
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.loadScene.save!();
			expect(saved).toHaveBeenCalledWith({ sceneId: 'scene1', transfer: false });
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

	describe('useLoopCommandSchema（loop 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(Loop, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useLoopCommandSchema();
			CommandSchema.insert(target, 'loop');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('loop');
			expect(form.mode).toBe('all');
			expect(form.conditions).toEqual([]);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(Loop, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useLoopCommandSchema();
			CommandSchema.edit(target, {
				id: 'loop',
				params: { mode: 'any', conditions: [{ type: 'self' }], commands: [] }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('loop');
			expect(form.mode).toBe('any');
			expect(form.conditions).toEqual([{ type: 'self' }]);
			wrapper.unmount();
		});

		it('save 路径：mode 从控件读取并连同 conditions/commands 保存', async () => {
			const wrapper = mount(Loop, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useLoopCommandSchema();
			Command.cases.loop.customLoad!({
				mode: 'all',
				conditions: [],
				commands: [{ id: 'wait', params: { duration: 1 } }]
			});
			form.mode = 'any';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.loop.save!();
			expect(saved).toHaveBeenCalledWith({
				mode: 'any',
				conditions: [],
				commands: [{ id: 'wait', params: { duration: 1 } }]
			});
			wrapper.unmount();
		});

		it('parse 路径：无条件时渲染 loop 内容', () => {
			const contents = Command.cases.loop.parse!({
				mode: 'all',
				conditions: [],
				commands: []
			});
			expect(contents[0]).toEqual({ fold: true });
			expect(contents[1]).toEqual({ color: 'flow' });
			expect(contents[2]).toEqual({ text: 'command.loop' });
			expect(contents[3]).toEqual({ children: [] });
			expect(contents[5]).toEqual({ text: 'command.loop.end' });
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

	describe('useMoveActorCommandSchema（moveActor 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 mode/wait 选项', async () => {
			const wrapper = mount(MoveActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const mode = document.getElementById('moveActor-mode') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const wait = document.getElementById('moveActor-wait') as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			expect(mode.dataItems).toHaveLength(6);
			expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(MoveActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'moveActor');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('moveActor');
			expect(getControl('moveActor-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('moveActor-mode').read()).toBe('straight');
			expect(getControl('moveActor-angle').read()).toBe(0);
			expect(getControl('moveActor-destination').read()).toEqual({
				type: 'absolute',
				x: 0,
				y: 0
			});
			expect(getControl('moveActor-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(MoveActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'moveActor',
				params: {
					actor: { type: 'player' },
					mode: 'teleport',
					destination: { type: 'absolute', x: 5, y: 6 }
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('moveActor');
			expect(getControl('moveActor-actor').read()).toEqual({ type: 'player' });
			expect(getControl('moveActor-mode').read()).toBe('teleport');
			expect(getControl('moveActor-destination').read()).toEqual({
				type: 'absolute',
				x: 5,
				y: 6
			});
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.moveActor.save 保存', async () => {
			const wrapper = mount(MoveActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.moveActor.customLoad!({
				actor: { type: 'trigger' },
				mode: 'straight',
				destination: { type: 'absolute', x: 0, y: 0 },
				wait: false
			});
			getControl('moveActor-mode').input('navigate');
			getControl('moveActor-destination').input({ type: 'absolute', x: 3, y: 4 });
			getControl('moveActor-wait').input(true);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.moveActor.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				mode: 'navigate',
				destination: { type: 'absolute', x: 3, y: 4 },
				wait: true
			});
			wrapper.unmount();
		});
	});
}
