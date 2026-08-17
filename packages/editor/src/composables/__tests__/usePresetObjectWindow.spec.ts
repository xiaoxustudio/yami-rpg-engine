import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import PresetObject from '@app/components/tools/PresetObject.vue';
import {
	usePresetObjectWindow,
	type PresetObjectNode
} from '@app/composables/usePresetObjectWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/legacy/file/file-system-core.ts', () => ({
	File: { getPath: () => undefined, route: () => '' }
}));

vi.mock('@app/legacy/data/data-object.ts', () => ({
	Data: {
		scenePresets: {} as Record<string, { sceneId: string; data: Record<string, unknown> }>,
		uiPresets: {} as Record<string, { uiId: string; data: Record<string, unknown> }>,
		scenes: {} as Record<string, { objects: PresetObjectNode[] }>,
		ui: {},
		teams: { map: {} }
	}
}));

vi.mock('@app/legacy/scene/scene-window.ts', () => ({
	Scene: { target: null, meta: { guid: 'scene-guid' } }
}));

type PresetObjectListEl = HTMLElement & {
	read(): PresetObjectNode | null;
	update(): void;
	clear(): void;
	select(item: unknown): void;
	selectRelative(direction: string): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	searchNodes(text: string): void;
	elements: Array<{ item: { class: string } }> & { count: number };
};

interface SearcherEl extends HTMLElement {
	write(value: string): void;
}

const getList = (): PresetObjectListEl =>
	document.getElementById('presetObject-list') as unknown as PresetObjectListEl;

const getSearcher = (): SearcherEl =>
	document.getElementById('presetObject-searcher') as unknown as SearcherEl;

const getSceneControl = (): HTMLElement & { read(): string } =>
	document.getElementById('presetObject-sceneId') as unknown as HTMLElement & { read(): string };

const makeNodes = (): PresetObjectNode[] => [
	{
		class: 'folder',
		name: 'Folder',
		children: [{ class: 'actor', name: 'Hero', presetId: 'preset-1' }]
	},
	{ class: 'actor', name: 'Ally', presetId: 'preset-2', teamId: 'team-1' },
	{ class: 'light', name: 'Lamp', presetId: 'preset-3', red: 255, green: 0, blue: 0 },
	{ class: 'region', name: 'Zone', presetId: 'preset-4', color: 'ff0000ff' }
];

const builtNode = (node: PresetObjectNode): PresetObjectNode => ({
	class: node.class,
	name: node.name,
	presetId: node.presetId,
	teamId: node.teamId ?? '',
	color: node.color ?? '',
	red: node.red ?? 0,
	green: node.green ?? 0,
	blue: node.blue ?? 0,
	image: node.image ?? ''
});

const mountAndInit = async (): Promise<{
	wrapper: ReturnType<typeof mount>;
	presetObject: ReturnType<typeof usePresetObjectWindow>;
}> => {
	const wrapper = mount(PresetObject, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	const presetObject = usePresetObjectWindow();
	presetObject.initialize();
	return { wrapper, presetObject };
};

describe('usePresetObjectWindow（场景对象预设窗口 composable：列表构建 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		for (const id of ['tooltip', 'window-ambient']) {
			const el = document.createElement('div');
			el.id = id;
			document.body.appendChild(el);
		}
		Array.empty = [];
		Window.open = vi.fn();
		Window.close = vi.fn();
		vi.mocked(Data).scenePresets = {};
		vi.mocked(Data).scenes = {};
		vi.mocked(Scene).target = null;
		vi.mocked(Scene).meta = { guid: 'scene-guid' };
	});

	it('open 打开窗口、写入目标 presetId 对应场景', async () => {
		const { wrapper, presetObject } = await mountAndInit();
		vi.mocked(Data).scenePresets = { 'preset-1': { sceneId: 'scene-1', data: {} } };
		const target = {
			filter: 'actor',
			input: vi.fn(),
			read: () => 'preset-1'
		} as unknown as Parameters<typeof presetObject.open>[0];
		presetObject.open(target);
		expect(Window.open).toHaveBeenCalledWith('presetObject');
		expect(getSceneControl().read()).toBe('scene-1');
		expect(presetObject.target).toBe(target);
		wrapper.unmount();
	});

	it('confirm 校验通过时回调 presetId 并关闭窗口', async () => {
		const { wrapper, presetObject } = await mountAndInit();
		const input = vi.fn();
		presetObject.open({ filter: 'actor', input });
		const list = getList();
		vi.spyOn(list, 'read').mockReturnValue({
			class: 'actor',
			name: 'Hero',
			presetId: 'preset-9'
		});
		presetObject.confirm();
		expect(input).toHaveBeenCalledWith('preset-9');
		expect(Window.close).toHaveBeenCalledWith('presetObject');
		wrapper.unmount();
	});

	it('confirm 校验失败（未选中节点）不回调不关闭', async () => {
		const { wrapper, presetObject } = await mountAndInit();
		const input = vi.fn();
		presetObject.open({ filter: 'actor', input });
		vi.spyOn(getList(), 'read').mockReturnValue(null);
		presetObject.confirm();
		expect(input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('sceneIdWrite 构建过滤节点、更新列表并选中首项', async () => {
		const { wrapper, presetObject } = await mountAndInit();
		presetObject.open({ filter: 'actor', input: vi.fn() });
		vi.mocked(Data).scenes = { 'scene-1': { objects: makeNodes() } };
		const list = getList();
		const update = vi.spyOn(list, 'update').mockImplementation(() => undefined);
		const select = vi.spyOn(list, 'select').mockImplementation(() => undefined);
		presetObject.sceneIdWrite({ value: 'scene-1' } as Event & { value?: string });
		expect(presetObject.nodes).toEqual([
			{
				class: 'folder',
				name: 'Folder',
				expanded: undefined,
				children: [builtNode({ class: 'actor', name: 'Hero', presetId: 'preset-1' })]
			},
			builtNode({ class: 'actor', name: 'Ally', presetId: 'preset-2', teamId: 'team-1' })
		]);
		expect(update).toHaveBeenCalled();
		expect(select).toHaveBeenCalledWith(presetObject.nodes![0]);
		expect(list.scrollTop).toBe(0);
		wrapper.unmount();
	});

	it('sceneIdWrite 场景无匹配节点时取消选择（folder 保留）', async () => {
		const { wrapper, presetObject } = await mountAndInit();
		presetObject.open({ filter: 'tilemap', input: vi.fn() });
		vi.mocked(Data).scenes = { 'scene-1': { objects: makeNodes() } };
		const list = getList();
		const unselect = vi.spyOn(list, 'unselect').mockImplementation(() => undefined);
		presetObject.sceneIdWrite({ value: 'scene-1' } as Event & { value?: string });
		expect(presetObject.nodes).toEqual([
			{ class: 'folder', name: 'Folder', expanded: undefined, children: [] }
		]);
		expect(unselect).toHaveBeenCalled();
		wrapper.unmount();
	});

	it('sceneIdWrite 无值时不更新列表', async () => {
		const { wrapper, presetObject } = await mountAndInit();
		presetObject.open({ filter: 'actor', input: vi.fn() });
		const update = vi.spyOn(getList(), 'update').mockImplementation(() => undefined);
		presetObject.sceneIdWrite({ value: '' } as Event & { value?: string });
		presetObject.sceneIdWrite({} as Event & { value?: string });
		expect(update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('windowClosed 清空目标、节点、搜索框与列表', async () => {
		const { wrapper, presetObject } = await mountAndInit();
		presetObject.open({ filter: 'actor', input: vi.fn() });
		const list = getList();
		const clear = vi.spyOn(list, 'clear').mockImplementation(() => undefined);
		const write = vi.spyOn(getSearcher(), 'write').mockImplementation(() => undefined);
		presetObject.windowClosed(new Event('closed'));
		expect(presetObject.target).toBeNull();
		expect(presetObject.nodes).toBeNull();
		expect(clear).toHaveBeenCalled();
		expect(write).toHaveBeenCalledWith('');
		wrapper.unmount();
	});

	it('buildNodes 按 className 过滤并递归展开文件夹', () => {
		const built = usePresetObjectWindow().buildNodes(makeNodes(), 'actor');
		expect(built).toEqual([
			{
				class: 'folder',
				name: 'Folder',
				expanded: undefined,
				children: [builtNode({ class: 'actor', name: 'Hero', presetId: 'preset-1' })]
			},
			builtNode({ class: 'actor', name: 'Ally', presetId: 'preset-2', teamId: 'team-1' })
		]);
		expect(usePresetObjectWindow().buildNodes(makeNodes(), 'any')).toHaveLength(4);
	});

	it('getDefaultPresetId 命中 Scene.target 分类时返回其 presetId', () => {
		vi.mocked(Scene).target = { class: 'light', presetId: 'preset-3' };
		expect(usePresetObjectWindow().getDefaultPresetId('light')).toBe('preset-3');
		expect(usePresetObjectWindow().getDefaultPresetId()).toBe('preset-3');
		expect(usePresetObjectWindow().getDefaultPresetId('actor')).toBe('');
		vi.mocked(Scene).target = null;
		expect(usePresetObjectWindow().getDefaultPresetId()).toBe('');
	});

	it('searcherInput 搜索并选中首个非文件夹节点', async () => {
		const { wrapper, presetObject } = await mountAndInit();
		presetObject.open({ filter: 'any', input: vi.fn() });
		const list = getList();
		const searchNodes = vi.spyOn(list, 'searchNodes').mockImplementation(() => undefined);
		const select = vi.spyOn(list, 'select').mockImplementation(() => undefined);
		list.elements = [
			{ item: { class: 'folder' } },
			{ item: { class: 'actor' } },
			{ item: { class: 'light' } }
		] as unknown as PresetObjectListEl['elements'];
		list.elements.count = 3;
		presetObject.searcherInput({ value: 'hero' });
		expect(searchNodes).toHaveBeenCalledWith('hero');
		expect(select).toHaveBeenCalledWith({ class: 'actor' });
		wrapper.unmount();
	});

	it('searcherKeydown 方向键移动选择、翻页键翻页', async () => {
		const { wrapper, presetObject } = await mountAndInit();
		presetObject.open({ filter: 'any', input: vi.fn() });
		const list = getList();
		const selectRelative = vi.spyOn(list, 'selectRelative').mockImplementation(() => undefined);
		const pageUp = vi.spyOn(list, 'pageUp').mockImplementation(() => undefined);
		const pageDown = vi.spyOn(list, 'pageDown').mockImplementation(() => undefined);
		presetObject.searcherKeydown({
			code: 'ArrowDown',
			preventDefault: vi.fn()
		} as unknown as KeyboardEvent);
		expect(selectRelative).toHaveBeenCalledWith('down');
		presetObject.searcherKeydown({
			code: 'ArrowUp',
			preventDefault: vi.fn()
		} as unknown as KeyboardEvent);
		expect(selectRelative).toHaveBeenCalledWith('up');
		presetObject.searcherKeydown({
			code: 'PageUp',
			preventDefault: vi.fn()
		} as unknown as KeyboardEvent);
		expect(pageUp).toHaveBeenCalledWith(true);
		presetObject.searcherKeydown({
			code: 'PageDown',
			preventDefault: vi.fn()
		} as unknown as KeyboardEvent);
		expect(pageDown).toHaveBeenCalledWith(true);
		wrapper.unmount();
	});

	it('legacy PresetObject 入口 initialize/open/confirm 转发 composable', async () => {
		const { PresetObject: PresetObjectController } =
			await import('@app/legacy/tools/scene-preset-window.ts');
		const { wrapper } = await mountAndInit();
		vi.mocked(Data).scenePresets = { 'preset-1': { sceneId: 'scene-1', data: {} } };
		const input = vi.fn();
		PresetObjectController.open({
			filter: 'actor',
			input,
			read: () => 'preset-1'
		} as unknown as Parameters<NonNullable<typeof PresetObjectController.open>>[0]);
		expect(Window.open).toHaveBeenCalledWith('presetObject');
		expect(getSceneControl().read()).toBe('scene-1');
		vi.spyOn(getList(), 'read').mockReturnValue({
			class: 'actor',
			name: 'Hero',
			presetId: 'preset-7'
		});
		PresetObjectController.confirm();
		expect(input).toHaveBeenCalledWith('preset-7');
		expect(Window.close).toHaveBeenCalledWith('presetObject');
		wrapper.unmount();
	});
});
