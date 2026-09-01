import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ControlDialog from '@app/components/commands/ControlDialog.vue';
import { useControlDialogCommandSchema } from '@app/composables/commands/useControlDialogCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';
import CreateActor from '@app/components/commands/CreateActor.vue';
import { useCreateActorCommandSchema } from '@app/composables/commands/useCreateActorCommandSchema';
import { Data } from '@app/data/data-object.ts';
import CreateElement from '@app/components/commands/CreateElement.vue';
import CreateGlobalActor from '@app/components/commands/CreateGlobalActor.vue';
import { useCreateGlobalActorCommandSchema } from '@app/composables/commands/useCreateGlobalActorCommandSchema';
import CreateObject from '@app/components/commands/CreateObject.vue';
import { useCreateObjectCommandSchema } from '@app/composables/commands/useCreateObjectCommandSchema';
import CreateTrigger from '@app/components/commands/CreateTrigger.vue';
import { useCreateTriggerCommandSchema } from '@app/composables/commands/useCreateTriggerCommandSchema';
import DeleteActor from '@app/components/commands/DeleteActor.vue';
import { useDeleteActorCommandSchema } from '@app/composables/commands/useDeleteActorCommandSchema';
import DeleteElement from '@app/components/commands/DeleteElement.vue';
import { useDeleteElementCommandSchema } from '@app/composables/commands/useDeleteElementCommandSchema';
import DeleteGlobalActor from '@app/components/commands/DeleteGlobalActor.vue';
import { useDeleteGlobalActorCommandSchema } from '@app/composables/commands/useDeleteGlobalActorCommandSchema';
import DeleteObject from '@app/components/commands/DeleteObject.vue';
import { useDeleteObjectCommandSchema } from '@app/composables/commands/useDeleteObjectCommandSchema';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

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

	describe('useControlDialogCommandSchema（controlDialog 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(ControlDialog, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useControlDialogCommandSchema();
			CommandSchema.insert(target, 'controlDialog');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('controlDialog');
			expect(form.element).toEqual({ type: 'trigger' });
			expect(form.operation).toBe('pause');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(ControlDialog, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useControlDialogCommandSchema();
			CommandSchema.edit(target, {
				id: 'controlDialog',
				params: { element: { type: 'player' }, operation: 'continue' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('controlDialog');
			expect(form.element).toEqual({ type: 'player' });
			expect(form.operation).toBe('continue');
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.controlDialog.save 保存', async () => {
			const wrapper = mount(ControlDialog, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useControlDialogCommandSchema();
			Command.cases.controlDialog.customLoad!({
				element: { type: 'trigger' },
				operation: 'pause'
			});
			form.operation = 'print-immediately';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.controlDialog.save!();
			expect(saved).toHaveBeenCalledWith({
				element: { type: 'trigger' },
				operation: 'print-immediately'
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 element + 操作文本', () => {
			setWords();
			Command.parseElement = vi.fn(
				(e: unknown) => `E:${(e as { type: string }).type}`
			) as never;
			const contents = Command.cases.controlDialog.parse!({
				element: { type: 'dialog' },
				operation: 'pause'
			});
			expect(contents[0]).toHaveProperty('color');
			expect(contents[2]).toHaveProperty('text');
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

	describe('useCreateActorCommandSchema（createActor 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.teams = { list: [{ id: 'team0', name: 'Team0' }] } as never;
			Data.createTeamItems = vi.fn(() => [{ name: 'Team0', value: 'team0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(CreateActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCreateActorCommandSchema();
			CommandSchema.insert(target, 'createActor');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('createActor');
			expect(form.actorId).toBe('');
			expect(form.position).toEqual({ type: 'absolute', x: 0, y: 0 });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(CreateActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCreateActorCommandSchema();
			CommandSchema.edit(target, {
				id: 'createActor',
				params: { actorId: 'a1', angle: 45 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('createActor');
			expect(form.actorId).toBe('a1');
			expect(form.angle).toBe(45);
			wrapper.unmount();
		});

		it('save 校验：actorId 为空不保存', async () => {
			const wrapper = mount(CreateActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.createActor.customLoad!({
				actorId: '',
				teamId: 'team0',
				position: { type: 'absolute', x: 0, y: 0 },
				angle: 0
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.createActor.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：DOM 改动经 Command.cases.createActor.save 保存', async () => {
			const wrapper = mount(CreateActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCreateActorCommandSchema();
			Command.cases.createActor.customLoad!({
				actorId: 'a1',
				teamId: 'team0',
				position: { type: 'absolute', x: 0, y: 0 },
				angle: 0
			});
			form.actorId = 'a2';
			form.position = { type: 'absolute', x: 5, y: 6 };
			form.angle = 90;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.createActor.save!();
			expect(saved).toHaveBeenCalledWith({
				actorId: 'a2',
				teamId: 'team0',
				position: { type: 'absolute', x: 5, y: 6 },
				angle: 90
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor 文本', () => {
			setWords();
			// oxlint-disable-next-line no-base-to-string
			Command.parseFileName = vi.fn((v: unknown) => `F:${String(v)}`) as never;
			// oxlint-disable-next-line no-base-to-string
			Command.parseTeam = vi.fn((v: unknown) => `T:${String(v)}`) as never;
			Command.parsePosition = vi.fn(() => 'POS') as never;
			// oxlint-disable-next-line no-base-to-string
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
			const contents = Command.cases.createActor.parse!({
				actorId: 'a1',
				teamId: 'team0',
				position: { type: 'absolute', x: 0, y: 0 },
				angle: 45
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

	describe('useCreateElementCommandSchema（createElement 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口后 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(CreateElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'createElement');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('createElement');
			expect(getControl('createElement-operation').read()).toBe('append-all-to-root');
			expect(getControl('createElement-parent').read()).toEqual({ type: 'trigger' });
			expect(getControl('createElement-uiId').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(CreateElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'createElement',
				params: {
					operation: 'append-one-to-element',
					parent: { type: 'trigger' },
					presetId: 'p1'
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('createElement');
			expect(getControl('createElement-operation').read()).toBe('append-one-to-element');
			expect(getControl('createElement-parent').read()).toEqual({ type: 'trigger' });
			expect(getControl('createElement-presetId').read()).toBe('p1');
			wrapper.unmount();
		});

		it('save 路径：append-all-to-root 且 uiId 为空时校验失败不保存', async () => {
			const wrapper = mount(CreateElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.createElement.customLoad!({ operation: 'append-all-to-root', uiId: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.createElement.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：append-one-to-element 经 Command.cases.createElement.save 保存', async () => {
			const wrapper = mount(CreateElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.createElement.customLoad!({
				operation: 'append-one-to-element',
				parent: { type: 'trigger' },
				presetId: 'p1'
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.createElement.save!();
			expect(saved).toHaveBeenCalledWith({
				operation: 'append-one-to-element',
				parent: { type: 'trigger' },
				presetId: 'p1'
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

	describe('useCreateGlobalActorCommandSchema（createGlobalActor 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.teams = { list: [{ id: 'team0', name: 'Team0' }] } as never;
			Data.createTeamItems = vi.fn(() => [{ name: 'Team0', value: 'team0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(CreateGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCreateGlobalActorCommandSchema();
			CommandSchema.insert(target, 'createGlobalActor');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('createGlobalActor');
			expect(form.actorId).toBe('');
			expect(form.teamId).toBe('team0');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(CreateGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCreateGlobalActorCommandSchema();
			CommandSchema.edit(target, {
				id: 'createGlobalActor',
				params: { actorId: 'a1', teamId: 'team1' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('createGlobalActor');
			expect(form.actorId).toBe('a1');
			expect(form.teamId).toBe('team1');
			wrapper.unmount();
		});

		it('save 校验：actorId 必填，为空不保存', async () => {
			const wrapper = mount(CreateGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.createGlobalActor.customLoad!({ actorId: '', teamId: 'team0' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.createGlobalActor.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：DOM 改动经 Command.cases.createGlobalActor.save 保存', async () => {
			const wrapper = mount(CreateGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.createGlobalActor.customLoad!({ actorId: 'a1', teamId: 'team0' });
			getControl('createGlobalActor-actorId').input('a2');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.createGlobalActor.save!();
			expect(saved).toHaveBeenCalledWith({ actorId: 'a2', teamId: 'team0' });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor 文本', () => {
			setWords();
			// oxlint-disable-next-line no-base-to-string
			Command.parseFileName = vi.fn((v: unknown) => `F:${String(v)}`) as never;
			// oxlint-disable-next-line no-base-to-string
			Command.parseTeam = vi.fn((v: unknown) => `T:${String(v)}`) as never;
			const contents = Command.cases.createGlobalActor.parse!({
				actorId: 'a1',
				teamId: 'team0'
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

	describe('useCreateObjectCommandSchema（createObject 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(CreateObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCreateObjectCommandSchema();
			CommandSchema.insert(target, 'createObject');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('createObject');
			expect(form.presetId).toBe('');
			expect(form.position).toEqual({ type: 'actor', actor: { type: 'trigger' } });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(CreateObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCreateObjectCommandSchema();
			CommandSchema.edit(target, {
				id: 'createObject',
				params: { presetId: 'p1', position: { type: 'absolute', x: 1, y: 2 } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('createObject');
			expect(form.presetId).toBe('p1');
			expect(form.position).toEqual({ type: 'absolute', x: 1, y: 2 });
			wrapper.unmount();
		});

		it('save 校验：presetId 必填，为空不保存', async () => {
			const wrapper = mount(CreateObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.createObject.customLoad!({
				presetId: '',
				position: { type: 'actor', actor: { type: 'trigger' } }
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.createObject.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：DOM 改动经 Command.cases.createObject.save 保存', async () => {
			const wrapper = mount(CreateObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.createObject.customLoad!({
				presetId: 'p1',
				position: { type: 'actor', actor: { type: 'trigger' } }
			});
			getControl('createObject-presetId').input('p2');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.createObject.save!();
			expect(saved).toHaveBeenCalledWith({
				presetId: 'p2',
				position: { type: 'actor', actor: { type: 'trigger' } }
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 preset 文本', () => {
			setWords();
			// oxlint-disable-next-line no-base-to-string
			Command.parsePresetObject = vi.fn((v: unknown) => `P:${String(v)}`) as never;
			Command.parsePosition = vi.fn(() => 'POS') as never;
			const contents = Command.cases.createObject.parse!({
				presetId: 'p1',
				position: { type: 'actor', actor: { type: 'trigger' } }
			});
			expect(contents[0]).toHaveProperty('color');
			expect(contents[2]).toHaveProperty('text');
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

	describe('useCreateTriggerCommandSchema（createTrigger 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(CreateTrigger, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCreateTriggerCommandSchema();
			CommandSchema.insert(target, 'createTrigger');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('createTrigger');
			expect(form.triggerId).toBe('');
			expect(form.caster).toEqual({ type: 'trigger' });
			expect(form.distance).toBe(0);
			expect(form.scale).toBe(1);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(CreateTrigger, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCreateTriggerCommandSchema();
			CommandSchema.edit(target, {
				id: 'createTrigger',
				params: { triggerId: 't1', distance: 5 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('createTrigger');
			expect(form.triggerId).toBe('t1');
			expect(form.distance).toBe(5);
			wrapper.unmount();
		});

		it('save 校验：triggerId 为空不保存', async () => {
			const wrapper = mount(CreateTrigger, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.createTrigger.customLoad!({
				triggerId: '',
				caster: { type: 'trigger' },
				origin: { type: 'actor', actor: { type: 'trigger' } },
				angle: { type: 'direction', degrees: 0 },
				distance: 0,
				scale: 1,
				timeScale: 1
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.createTrigger.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.createTrigger.save 保存', async () => {
			const wrapper = mount(CreateTrigger, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCreateTriggerCommandSchema();
			Command.cases.createTrigger.customLoad!({
				triggerId: 't1',
				caster: { type: 'trigger' },
				origin: { type: 'actor', actor: { type: 'trigger' } },
				angle: { type: 'direction', degrees: 0 },
				distance: 0,
				scale: 1,
				timeScale: 1
			});
			form.triggerId = 't2';
			form.distance = 3;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.createTrigger.save!();
			expect(saved).toHaveBeenCalledWith({
				triggerId: 't2',
				caster: { type: 'trigger' },
				origin: { type: 'actor', actor: { type: 'trigger' } },
				angle: { type: 'direction', degrees: 0 },
				distance: 3,
				scale: 1,
				timeScale: 1
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 trigger 文本', () => {
			setWords();
			// oxlint-disable-next-line no-base-to-string
			Command.parseVariableFile = vi.fn((v: unknown) => `F:${String(v)}`) as never;
			Command.parseActor = vi.fn(() => 'ACTOR') as never;
			Command.parsePosition = vi.fn(() => 'POS') as never;
			Command.parseAngle = vi.fn(() => 'ANG') as never;
			// oxlint-disable-next-line no-base-to-string
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
			const contents = Command.cases.createTrigger.parse!({
				triggerId: 't1',
				caster: { type: 'trigger' },
				origin: { type: 'actor', actor: { type: 'trigger' } },
				angle: { type: 'direction', degrees: 0 },
				distance: 0,
				scale: 1,
				timeScale: 1
			});
			expect(contents[0]).toHaveProperty('color');
			expect(contents[2]).toHaveProperty('text');
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useDeleteActorCommandSchema（deleteActor 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(DeleteActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteActorCommandSchema();
			CommandSchema.insert(target, 'deleteActor');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteActor');
			expect(form.actor).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(DeleteActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteActorCommandSchema();
			CommandSchema.edit(target, {
				id: 'deleteActor',
				params: { actor: { type: 'player' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteActor');
			expect(form.actor).toEqual({ type: 'player' });
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.deleteActor.save 保存', async () => {
			const wrapper = mount(DeleteActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteActorCommandSchema();
			Command.cases.deleteActor.customLoad!({ actor: { type: 'trigger' } });
			form.actor = { type: 'player' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.deleteActor.save!();
			expect(saved).toHaveBeenCalledWith({ actor: { type: 'player' } });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor 文本', () => {
			Command.parseActor = vi.fn(
				(a: unknown) => `A:${(a as { type: string }).type}`
			) as never;
			const contents = Command.cases.deleteActor.parse!({ actor: { type: 'player' } });
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

	describe('useDeleteElementCommandSchema（deleteElement 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(DeleteElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteElementCommandSchema();
			CommandSchema.insert(target, 'deleteElement');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteElement');
			expect(form.operation).toBe('delete-element');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(DeleteElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteElementCommandSchema();
			CommandSchema.edit(target, {
				id: 'deleteElement',
				params: { operation: 'delete-children', element: { type: 'button' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteElement');
			expect(form.operation).toBe('delete-children');
			expect(form.element).toEqual({ type: 'button' });
			wrapper.unmount();
		});

		it('save 路径：delete-children 保存 operation + element', async () => {
			const wrapper = mount(DeleteElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteElementCommandSchema();
			Command.cases.deleteElement.customLoad!({
				operation: 'delete-children',
				element: { type: 'button' }
			});
			form.operation = 'delete-children';
			form.element = { type: 'dialog' };
			getControl('deleteElement-element').input({ type: 'dialog' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.deleteElement.save!();
			expect(saved).toHaveBeenCalledWith({
				operation: 'delete-children',
				element: { type: 'dialog' }
			});
			wrapper.unmount();
		});

		it('save 路径：delete-all 仅保存 operation', async () => {
			const wrapper = mount(DeleteElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteElementCommandSchema();
			Command.cases.deleteElement.customLoad!({
				operation: 'delete-all',
				element: { type: 'button' }
			});
			form.operation = 'delete-all';
			form.element = { type: 'dialog' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.deleteElement.save!();
			expect(saved).toHaveBeenCalledWith({ operation: 'delete-all' });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 element 文本', () => {
			setWords();
			Command.parseElement = vi.fn(
				(e: unknown) => `E:${(e as { type: string }).type}`
			) as never;
			const contents = Command.cases.deleteElement.parse!({
				operation: 'delete-children',
				element: { type: 'button' }
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

	describe('useDeleteGlobalActorCommandSchema（deleteGlobalActor 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(DeleteGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'deleteGlobalActor');
			expect(Window.open).toHaveBeenCalledWith('deleteGlobalActor');
			expect(getControl('deleteGlobalActor-actorId').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(DeleteGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteGlobalActorCommandSchema();
			CommandSchema.edit(target, {
				id: 'deleteGlobalActor',
				params: { actorId: 'hero.json' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteGlobalActor');
			expect(form.actorId).toBe('hero.json');
			wrapper.unmount();
		});

		it('save 路径：required actorId 为空时校验失败不保存', async () => {
			const wrapper = mount(DeleteGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.deleteGlobalActor.customLoad!({ actorId: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.deleteGlobalActor.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.deleteGlobalActor.save 保存', async () => {
			const wrapper = mount(DeleteGlobalActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteGlobalActorCommandSchema();
			Command.cases.deleteGlobalActor.customLoad!({ actorId: '' });
			form.actorId = 'enemy.json';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.deleteGlobalActor.save!();
			expect(saved).toHaveBeenCalledWith({ actorId: 'enemy.json' });
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

	describe('useDeleteObjectCommandSchema（deleteObject 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(DeleteObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteObjectCommandSchema();
			CommandSchema.insert(target, 'deleteObject');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteObject');
			expect(form.object).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(DeleteObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteObjectCommandSchema();
			CommandSchema.edit(target, {
				id: 'deleteObject',
				params: { object: { type: 'player' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteObject');
			expect(form.object).toEqual({ type: 'player' });
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.deleteObject.save 保存', async () => {
			const wrapper = mount(DeleteObject, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteObjectCommandSchema();
			Command.cases.deleteObject.customLoad!({ object: { type: 'trigger' } });
			form.object = { type: 'player' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.deleteObject.save!();
			expect(saved).toHaveBeenCalledWith({ object: { type: 'player' } });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 object 文本', () => {
			Command.parseObject = vi.fn(
				(o: unknown) => `O:${(o as { type: string }).type}`
			) as never;
			const contents = Command.cases.deleteObject.parse!({ object: { type: 'player' } });
			expect(contents[0]).toHaveProperty('color');
			expect(contents[2]).toHaveProperty('text');
		});
	});
}
