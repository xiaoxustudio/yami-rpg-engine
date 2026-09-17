import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';
import { Data } from '@app/data/data-object.ts';
import DeleteTile from '@app/components/commands/DeleteTile.vue';
import { useDeleteTileCommandSchema } from '@app/composables/commands/useDeleteTileCommandSchema';
import DeleteVariable from '@app/components/commands/DeleteVariable.vue';
import { useDeleteVariableCommandSchema } from '@app/composables/commands/useDeleteVariableCommandSchema';
import DetectTargets from '@app/components/commands/DetectTargets.vue';
import { useDetectTargetsCommandSchema } from '@app/composables/commands/useDetectTargetsCommandSchema';
import DiscardTargets from '@app/components/commands/DiscardTargets.vue';
import { useDiscardTargetsCommandSchema } from '@app/composables/commands/useDiscardTargetsCommandSchema';
import DownloadFile from '@app/components/commands/DownloadFile.vue';
import { useDownloadFileCommandSchema } from '@app/composables/commands/useDownloadFileCommandSchema';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import FixAngle from '@app/components/commands/FixAngle.vue';
import { useFixAngleCommandSchema } from '@app/composables/commands/useFixAngleCommandSchema';
import FollowActor from '@app/components/commands/FollowActor.vue';
import ForEach from '@app/components/commands/ForEach.vue';
import { useForEachCommandSchema } from '@app/composables/commands/useForEachCommandSchema';
import GameData from '@app/components/commands/GameData.vue';
import { useGameDataCommandSchema } from '@app/composables/commands/useGameDataCommandSchema';
import GetActor from '@app/components/commands/GetActor.vue';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { useGetActorCommandSchema } from '@app/composables/commands/useGetActorCommandSchema';
import { dataItemsOf } from '@app/__tests__/element-data-read';

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

	describe('useDeleteTileCommandSchema（deleteTile 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(DeleteTile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteTileCommandSchema();
			CommandSchema.insert(target, 'deleteTile');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteTile');
			expect(form.tilemap).toEqual({ type: 'trigger' });
			expect(form.tilemapX).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(DeleteTile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteTileCommandSchema();
			CommandSchema.edit(target, {
				id: 'deleteTile',
				params: { tilemap: { type: 'player' }, tilemapX: 3, tilemapY: 4 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteTile');
			expect(form.tilemapX).toBe(3);
			expect(form.tilemapY).toBe(4);
			wrapper.unmount();
		});

		it('save 路径：form 改动经 Command.cases.deleteTile.save 保存', async () => {
			const wrapper = mount(DeleteTile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteTileCommandSchema();
			Command.cases.deleteTile.customLoad!({
				tilemap: { type: 'trigger' },
				tilemapX: 0,
				tilemapY: 0
			});
			form.tilemapX = 5;
			form.tilemapY = 6;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.deleteTile.save!();
			expect(saved).toHaveBeenCalledWith({
				tilemap: { type: 'trigger' },
				tilemapX: 5,
				tilemapY: 6
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 tilemap 文本', () => {
			setWords();
			Command.parseTilemap = vi.fn(() => 'TM') as never;
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
			const contents = Command.cases.deleteTile.parse!({
				tilemap: { type: 'trigger' },
				tilemapX: 1,
				tilemapY: 2
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

	describe('useDeleteVariableCommandSchema（deleteVariable 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(DeleteVariable, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteVariableCommandSchema();
			CommandSchema.insert(target, 'deleteVariable');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteVariable');
			expect(form.variable).toEqual({
				type: 'local',
				key: ''
			});
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(DeleteVariable, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDeleteVariableCommandSchema();
			CommandSchema.edit(target, {
				id: 'deleteVariable',
				params: { variable: { type: 'local', key: 'foo' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('deleteVariable');
			expect(form.variable).toEqual({
				type: 'local',
				key: 'foo'
			});
			wrapper.unmount();
		});

		it('save 路径：variable 为 none 时校验失败不保存', async () => {
			const wrapper = mount(DeleteVariable, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.deleteVariable.customLoad!({ variable: { type: 'local', key: '' } });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.deleteVariable.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：variable 非 none 时经 Command.cases.deleteVariable.save 保存', async () => {
			const wrapper = mount(DeleteVariable, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.deleteVariable.customLoad!({ variable: { type: 'local', key: 'foo' } });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.deleteVariable.save!();
			expect(saved).toHaveBeenCalledWith({ variable: { type: 'local', key: 'foo' } });
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

	describe('useDetectTargetsCommandSchema（detectTargets 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 selector/inSight 选项', async () => {
			const wrapper = mount(DetectTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const selector = document.getElementById('detectTargets-selector') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const inSight = document.getElementById('detectTargets-inSight') as unknown as {
				dataItems?: Array<{ name: string; value: boolean }>;
			};
			expect(dataItemsOf(selector)).toHaveLength(6);
			expect(dataItemsOf(inSight)!.map((item) => item.value)).toEqual([true, false]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(DetectTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'detectTargets');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('detectTargets');
			expect(getControl('detectTargets-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('detectTargets-distance').read()).toBe(0);
			expect(getControl('detectTargets-selector').read()).toBe('enemy');
			expect(getControl('detectTargets-inSight').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(DetectTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'detectTargets',
				params: {
					actor: { type: 'trigger' },
					distance: 3,
					selector: 'friend',
					inSight: true
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('detectTargets');
			expect(getControl('detectTargets-distance').read()).toBe(3);
			expect(getControl('detectTargets-selector').read()).toBe('friend');
			expect(getControl('detectTargets-inSight').read()).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：distance 为 0 时校验失败不保存', async () => {
			const wrapper = mount(DetectTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.detectTargets.customLoad!({
				actor: { type: 'trigger' },
				distance: 0,
				selector: 'enemy',
				inSight: false
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.detectTargets.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.detectTargets.save 保存', async () => {
			const wrapper = mount(DetectTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDetectTargetsCommandSchema();
			Command.cases.detectTargets.customLoad!({
				actor: { type: 'trigger' },
				distance: 2,
				selector: 'enemy',
				inSight: false
			});
			form.distance = 5;
			form.selector = 'team';
			form.inSight = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.detectTargets.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				distance: 5,
				selector: 'team',
				inSight: true
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

	describe('useDiscardTargetsCommandSchema（discardTargets 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(DiscardTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDiscardTargetsCommandSchema();
			CommandSchema.insert(target, 'discardTargets');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('discardTargets');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.selector).toBe('any');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(DiscardTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDiscardTargetsCommandSchema();
			CommandSchema.edit(target, {
				id: 'discardTargets',
				params: { actor: { type: 'player' }, selector: 'enemy', distance: 5 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('discardTargets');
			expect(form.selector).toBe('enemy');
			expect(form.distance).toBe(5);
			wrapper.unmount();
		});

		it('save 路径：form 改动经 Command.cases.discardTargets.save 保存', async () => {
			const wrapper = mount(DiscardTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDiscardTargetsCommandSchema();
			Command.cases.discardTargets.customLoad!({
				actor: { type: 'trigger' },
				selector: 'any',
				distance: 0
			});
			form.distance = 10;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.discardTargets.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				selector: 'any',
				distance: 10
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor + selector 文本', () => {
			setWords();
			Command.parseActor = vi.fn(
				(a: unknown) => `A:${(a as { type: string }).type}`
			) as never;
			Command.parseActorSelector = vi.fn((v: unknown) => `S:${String(v)}`) as never;
			const contents = Command.cases.discardTargets.parse!({
				actor: { type: 'trigger' },
				selector: 'any',
				distance: 0
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

	describe('useDownloadFileCommandSchema（downloadFile 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || variable === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(DownloadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'downloadFile');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('downloadFile');
			expect(getControl('downloadFile-url').read()).toBe('');
			expect(getControl('downloadFile-method').read()).toBe('GET');
			expect(getControl('downloadFile-isBackground').read()).toBe(false);
			expect(getControl('downloadFile-isBackground-path').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(DownloadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'downloadFile',
				params: {
					url: { type: 'local', key: 'url' },
					method: 'POST',
					callback: 'cb1',
					isBackground: true,
					isBackgroundPath: 'C:/temp'
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('downloadFile');
			expect(getControl('downloadFile-url').read()).toEqual({ type: 'local', key: 'url' });
			expect(getControl('downloadFile-method').read()).toBe('POST');
			expect(getControl('downloadFile-callback').read()).toBe('cb1');
			expect(getControl('downloadFile-isBackground').read()).toBe(true);
			expect(getControl('downloadFile-isBackground-path').read()).toBe('C:/temp');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.downloadFile.save 保存', async () => {
			const wrapper = mount(DownloadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useDownloadFileCommandSchema();
			Command.cases.downloadFile.customLoad!({
				url: 'http://example.com',
				method: 'GET'
			});
			form.method = 'DELETE';
			form.callback = 'cb2';
			form.rateCallback = 'rc2';
			form.isBackground = true;
			form.isBackgroundPath = 'C:/out';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.downloadFile.save!();
			expect(saved).toHaveBeenCalledWith({
				url: 'http://example.com',
				method: 'DELETE',
				headers: [],
				data: [],
				callback: 'cb2',
				rateCallback: 'rc2',
				isBackground: true,
				isBackgroundPath: 'C:/out'
			});
			wrapper.unmount();
		});

		it('save 路径：url 为 none 校验失败不保存', async () => {
			const wrapper = mount(DownloadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.downloadFile.customLoad!({
				url: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.downloadFile.save!();
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

	describe('useFixAngleCommandSchema（fixAngle 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(FixAngle, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useFixAngleCommandSchema();
			CommandSchema.insert(target, 'fixAngle');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('fixAngle');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.fixed).toBe(true);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(FixAngle, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useFixAngleCommandSchema();
			CommandSchema.edit(target, {
				id: 'fixAngle',
				params: { actor: { type: 'player' }, fixed: false }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('fixAngle');
			expect(form.fixed).toBe(false);
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.fixAngle.save 保存', async () => {
			const wrapper = mount(FixAngle, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useFixAngleCommandSchema();
			Command.cases.fixAngle.customLoad!({ actor: { type: 'trigger' }, fixed: true });
			form.fixed = false;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.fixAngle.save!();
			expect(saved).toHaveBeenCalledWith({ actor: { type: 'trigger' }, fixed: false });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor + fixed 文本', () => {
			setWords();
			Command.parseActor = vi.fn(
				(a: unknown) => `A:${(a as { type: string }).type}`
			) as never;
			const contents = Command.cases.fixAngle.parse!({
				actor: { type: 'trigger' },
				fixed: true
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

	describe('useFollowActorCommandSchema（followActor 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口后 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(FollowActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'followActor');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('followActor');
			expect(getControl('followActor-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('followActor-mode').read()).toBe('circle');
			expect(getControl('followActor-minDist').read()).toBe(1);
			expect(getControl('followActor-navigate').read()).toBe(true);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(FollowActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'followActor',
				params: {
					actor: { type: 'trigger' },
					mode: 'rectangle',
					vertDist: 2,
					navigate: false
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('followActor');
			expect(getControl('followActor-mode').read()).toBe('rectangle');
			expect(getControl('followActor-vertDist').read()).toBe(2);
			expect(getControl('followActor-navigate').read()).toBe(false);
			wrapper.unmount();
		});

		it('save 路径：circle 模式经 Command.cases.followActor.save 保存 offset', async () => {
			const wrapper = mount(FollowActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.followActor.customLoad!({
				actor: { type: 'trigger' },
				target: { type: 'trigger' },
				mode: 'circle',
				offset: 0.5,
				navigate: false,
				once: true
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.followActor.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				target: { type: 'trigger' },
				mode: 'circle',
				minDist: 1,
				maxDist: 2,
				offset: 0.5,
				bufferDist: 0,
				navigate: false,
				once: true,
				wait: false
			});
			wrapper.unmount();
		});

		it('save 路径：navigate 且 once 时保存 bypass 与 wait', async () => {
			const wrapper = mount(FollowActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.followActor.customLoad!({
				mode: 'rectangle',
				vertDist: 2,
				navigate: true,
				bypass: true,
				once: true,
				wait: true
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.followActor.save!();
			expect(saved).toHaveBeenCalledWith(
				expect.objectContaining({
					mode: 'rectangle',
					vertDist: 2,
					navigate: true,
					bypass: true,
					once: true,
					wait: true
				})
			);
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

	describe('useForEachCommandSchema (forEach command insert/edit/save paths)', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		const mountWindow = async () => {
			const wrapper = mount(ForEach, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			return wrapper;
		};

		it('insert path: CommandSchema.insert opens forEach window and loads default form', async () => {
			const wrapper = await mountWindow();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			CommandSchema.insert(target, 'forEach');
			expect(Window.open).toHaveBeenCalledWith('forEach');
			expect(getControl('forEach-data').read()).toBe('list');
			expect(getControl('forEach-variable').read()).toEqual({ type: 'local', key: '' });
			wrapper.unmount();
		});

		it('edit path: CommandSchema.edit maps params to form, customSave saves via form with commands', async () => {
			const wrapper = await mountWindow();
			const target = {
				scrollAndResize: vi.fn(),
				getSelectionPosition: () => ({ x: 100, y: 100 }),
				save: vi.fn()
			};
			const { form } = useForEachCommandSchema();
			CommandSchema.edit(target, {
				id: 'forEach',
				params: {
					data: 'list',
					list: { type: 'local', key: 'items' },
					variable: { type: 'local', key: 'item' },
					commands: [{ id: 'comment' }]
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('forEach');
			expect(form.list).toEqual({ type: 'local', key: 'items' });
			expect(form.variable).toEqual({ type: 'local', key: 'item' });
			form.variable = { type: 'local', key: 'elem' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.forEach.save!();
			expect(saved).toHaveBeenCalledWith({
				data: 'list',
				list: { type: 'local', key: 'items' },
				variable: { type: 'local', key: 'elem' },
				commands: [{ id: 'comment' }]
			});
			wrapper.unmount();
		});

		it('save data branches: attribute/enum/save/touch saved through form', async () => {
			const wrapper = await mountWindow();
			Command.cases.forEach.customLoad!({
				data: 'attribute',
				groupId: 'g1',
				variable: { type: 'local', key: 'k' }
			});
			await wrapper.vm.$nextTick();
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.forEach.customSave!();
			expect(saved).toHaveBeenCalledWith({
				data: 'attribute',
				groupId: 'g1',
				variable: { type: 'local', key: 'k' },
				commands: []
			});
			Command.cases.forEach.customLoad!({
				data: 'save',
				saveIndex: { type: 'local', key: 's' }
			});
			await wrapper.vm.$nextTick();
			Command.cases.forEach.customSave!();
			expect(saved).toHaveBeenLastCalledWith({
				data: 'save',
				saveIndex: { type: 'local', key: 's' },
				commands: []
			});
			wrapper.unmount();
		});

		it('save validation: missing variable focuses control and does not save', async () => {
			const wrapper = await mountWindow();
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.forEach.customLoad!({
				data: 'member',
				variable: { type: 'local', key: '' }
			});
			await wrapper.vm.$nextTick();
			Command.cases.forEach.customSave!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('windowClosed clears commands state', async () => {
			const wrapper = await mountWindow();
			const { useForEachCommandSchema } =
				await import('@app/composables/commands/useForEachCommandSchema');
			const { windowClosed } = useForEachCommandSchema();
			Command.cases.forEach.customLoad!({
				data: 'list',
				list: { type: 'local', key: 'items' },
				variable: { type: 'local', key: 'item' },
				commands: [{ id: 'comment' }]
			});
			await wrapper.vm.$nextTick();
			windowClosed(new Event('closed'));
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.forEach.customLoad!({
				data: 'list',
				list: { type: 'local', key: 'items' },
				variable: { type: 'local', key: 'item' }
			});
			await wrapper.vm.$nextTick();
			Command.cases.forEach.customSave!();
			expect(saved).toHaveBeenCalledWith({
				data: 'list',
				list: { type: 'local', key: 'items' },
				variable: { type: 'local', key: 'item' },
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

	describe('useGameDataCommandSchema（gameData 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(GameData, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useGameDataCommandSchema();
			CommandSchema.insert(target, 'gameData');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('gameData');
			expect(form.operation).toBe('save');
			expect(form.index).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(GameData, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useGameDataCommandSchema();
			CommandSchema.edit(target, {
				id: 'gameData',
				params: { operation: 'load', index: 3 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('gameData');
			expect(form.operation).toBe('load');
			expect(form.index).toBe(3);
			wrapper.unmount();
		});

		it('save 路径：save 操作保存 variables（去空格）', async () => {
			const wrapper = mount(GameData, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useGameDataCommandSchema();
			Command.cases.gameData.customLoad!({ operation: 'save', index: 1, variables: 'a' });
			form.operation = 'save';
			form.index = 1;
			form.variables = ' hp, mp ';
			getControl('gameData-variables').write(' hp, mp ');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.gameData.save!();
			expect(saved).toHaveBeenCalledWith({
				operation: 'save',
				index: 1,
				variables: 'hp, mp'
			});
			wrapper.unmount();
		});

		it('save 路径：load 操作仅保存 operation + index', async () => {
			const wrapper = mount(GameData, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useGameDataCommandSchema();
			Command.cases.gameData.customLoad!({ operation: 'load', index: 2, variables: '' });
			form.operation = 'load';
			form.index = 2;
			form.variables = 'hp';
			getControl('gameData-operation').input('load');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.gameData.save!();
			expect(saved).toHaveBeenCalledWith({ operation: 'load', index: 2 });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 save 操作文本', () => {
			setWords();
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
			Command.setVariableColor = vi.fn((v: unknown) => `V:${String(v)}`) as never;
			const contents = Command.cases.gameData.parse!({
				operation: 'save',
				index: 1,
				variables: 'hp'
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

	describe('useGetActorCommandSchema（getActor 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
			Attribute.getAttributeItems = vi.fn(() => [
				{ name: 'HP', value: 'hp' },
				{ name: 'MaxHP', value: 'maxhp' }
			]) as never;
			Attribute.getDefAttributeId = vi.fn(() => 'hp') as never;
			Data.teams = { list: [{ id: 'team0' }] } as never;
			Data.createTeamItems = vi.fn(() => []) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		const mountWindow = async () => {
			const wrapper = mount(GetActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			return wrapper;
		};

		it('onMounted loadItems 填充 area/selector/condition/activation/exclusion 选项', async () => {
			const wrapper = await mountWindow();
			const area = document.getElementById('getActor-area') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const selector = document.getElementById('getActor-selector') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const condition = document.getElementById('getActor-condition') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const activation = document.getElementById('getActor-activation') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			const exclusion = document.getElementById('getActor-exclusion') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(dataItemsOf(area)).toHaveLength(2);
			expect(dataItemsOf(selector)).toHaveLength(4);
			expect(dataItemsOf(condition)).toHaveLength(7);
			expect(dataItemsOf(activation)).toHaveLength(3);
			expect(dataItemsOf(exclusion)).toHaveLength(3);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = await mountWindow();
			const { form } = useGetActorCommandSchema();
			CommandSchema.insert(target, 'getActor');
			expect(Window.open).toHaveBeenCalledWith('getActor');
			expect(form.variable).toEqual({ type: 'local', key: '' });
			expect(form.area).toBe('square');
			expect(form.size).toBe(1);
			expect(form.radius).toBe(0.5);
			expect(form.selector).toBe('enemy');
			expect(form.teamId).toBe('team0');
			expect(form.condition).toBe('nearest');
			expect(form.activation).toBe('active');
			expect(form.exclusion).toBe('none');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form（含 selector/activation remap）', async () => {
			const wrapper = await mountWindow();
			const { form } = useGetActorCommandSchema();
			CommandSchema.edit(target, {
				id: 'getActor',
				params: {
					variable: { type: 'local', key: 'foo' },
					position: { type: 'absolute', x: 1, y: 2 },
					area: 'circle',
					radius: 2,
					selector: 'team-member',
					teamId: 'team0',
					condition: 'max-attribute-ratio',
					attribute: 'hp',
					divisor: 'maxhp',
					activation: 'either',
					exclusion: 'actor',
					exclusionActor: { type: 'actor', key: 'a1' },
					active: false
				}
			});
			expect(Window.open).toHaveBeenCalledWith('getActor');
			expect(form.variable).toEqual({ type: 'local', key: 'foo' });
			expect(form.area).toBe('circle');
			expect(form.radius).toBe(2);
			expect(form.selector).toBe('team');
			expect(form.condition).toBe('max-attribute-ratio');
			expect(form.attribute).toBe('hp');
			expect(form.divisor).toBe('maxhp');
			expect(form.activation).toBe('either');
			expect(form.exclusion).toBe('actor');
			expect(form.exclusionActor).toEqual({ type: 'actor', key: 'a1' });
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.getActor.save 保存', async () => {
			const wrapper = await mountWindow();
			const { form } = useGetActorCommandSchema();
			Command.cases.getActor.customLoad!({
				variable: { type: 'local', key: 'foo' },
				position: { type: 'absolute', x: 1, y: 2 },
				area: 'square',
				size: 1,
				selector: 'enemy',
				teamId: 'team0',
				condition: 'nearest',
				activation: 'active',
				exclusion: 'none'
			});
			form.area = 'circle';
			form.radius = 1.5;
			form.selector = 'any';
			form.condition = 'min-attribute-ratio';
			form.attribute = 'hp';
			form.divisor = 'maxhp';
			form.exclusion = 'team';
			form.exclusionTeamId = 'team1';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.getActor.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'foo' },
				position: { type: 'absolute', x: 1, y: 2 },
				area: 'circle',
				radius: 1.5,
				selector: 'any',
				condition: 'min-attribute-ratio',
				attribute: 'hp',
				divisor: 'maxhp',
				activation: 'active',
				exclusion: 'team',
				exclusionTeamId: 'team1'
			});
			wrapper.unmount();
		});

		it('save 路径：ratio divisor 未选校验失败不保存', async () => {
			const wrapper = await mountWindow();
			useGetActorCommandSchema();
			Command.cases.getActor.customLoad!({
				variable: { type: 'local', key: 'foo' },
				position: { type: 'absolute', x: 1, y: 2 },
				area: 'square',
				size: 1,
				selector: 'enemy',
				condition: 'min-attribute-ratio',
				attribute: 'hp',
				divisor: '',
				activation: 'active',
				exclusion: 'none'
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.getActor.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});
	});
}
