import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import PresetElement from '@app/components/tools/PresetElement.vue';
import {
	usePresetElementWindow,
	type PresetElementNode
} from '@app/composables/usePresetElementWindow';
import { Window } from '@app/tools/window-object.ts';
import { getUIStore } from '@app/stores/ui';
import { Data } from '@app/data/data-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/data/data-object.ts', () => ({
	Data: {
		scenePresets: {} as Record<string, { sceneId: string; data: Record<string, unknown> }>,
		uiPresets: {} as Record<string, { uiId: string; data: Record<string, unknown> }>,
		scenes: {},
		ui: {} as Record<string, { nodes: PresetElementNode[] }>,
		teams: { map: {} }
	}
}));

// `usePresetElementWindow` 读的是 `getUIStore()`。
// 本 spec 已经在 beforeEach 里 `setActivePinia(createPinia())`（见下方），所以直接用真 store ——
// 这比 mock 更接近真实行为：测试不绑定遗留层的形状。

type PresetElementListEl = HTMLElement & {
	read(): PresetElementNode | null;
	update(): void;
	clear(): void;
	select(item: unknown): void;
	selectRelative(direction: string): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	searchNodes(text: string): void;
	elements: Array<{ item: { class: string } }> & { count: number };
	rowCount(): number;
	rowItemAt(index: number): { class: string } | undefined;
};

const getList = (): PresetElementListEl =>
	document.getElementById('presetElement-list') as unknown as PresetElementListEl;

const getUiControl = (): HTMLElement & { read(): string } =>
	document.getElementById('presetElement-uiId') as unknown as HTMLElement & { read(): string };

const makeNodes = (): PresetElementNode[] => [
	{
		class: 'folder',
		name: 'Folder',
		children: [{ class: 'image', name: 'Pic', presetId: 'preset-1' }]
	},
	{ class: 'text', name: 'Label', presetId: 'preset-2' },
	{ class: 'button', name: 'Btn', presetId: 'preset-3' }
];

const builtNode = (node: PresetElementNode): PresetElementNode => ({
	class: node.class,
	name: node.name,
	expanded: node.expanded,
	presetId: node.presetId,
	children: []
});

const builtFolder = (node: PresetElementNode): PresetElementNode => ({
	class: node.class,
	name: node.name,
	expanded: node.expanded,
	presetId: node.presetId,
	children: node.children ? [builtNode(node.children[0])] : []
});

const mountAndInit = async (): Promise<{
	wrapper: ReturnType<typeof mount>;
	presetElement: ReturnType<typeof usePresetElementWindow>;
}> => {
	const wrapper = mount(PresetElement, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	const presetElement = usePresetElementWindow();
	presetElement.initialize();
	return { wrapper, presetElement };
};

describe('usePresetElementWindow（UI 元素预设窗口 composable：列表构建 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		for (const id of ['tooltip', 'window-ambient']) {
			const el = document.createElement('div');
			el.id = id;
			document.body.appendChild(el);
		}
		Window.open = vi.fn();
		Window.close = vi.fn();
		vi.mocked(Data).uiPresets = {};
		vi.mocked(Data).ui = {};
		getUIStore().target = null;
		getUIStore().meta = { guid: 'ui-guid', path: '' };
	});

	it('open 打开窗口、写入目标 presetId 对应 UI', async () => {
		const { wrapper, presetElement } = await mountAndInit();
		vi.mocked(Data).uiPresets = { 'preset-1': { uiId: 'ui-1', data: {} } };
		const target = { input: vi.fn(), read: () => 'preset-1' } as unknown as Parameters<
			typeof presetElement.open
		>[0];
		presetElement.open(target);
		expect(Window.open).toHaveBeenCalledWith('presetElement');
		expect(getUiControl().read()).toBe('ui-1');
		expect(presetElement.target).toBe(target);
		wrapper.unmount();
	});

	it('confirm 校验通过时回调 presetId 并关闭窗口', async () => {
		const { wrapper, presetElement } = await mountAndInit();
		const input = vi.fn();
		presetElement.open({ input });
		vi.spyOn(getList(), 'read').mockReturnValue({
			class: 'text',
			name: 'Label',
			presetId: 'preset-9'
		});
		presetElement.confirm();
		expect(input).toHaveBeenCalledWith('preset-9');
		expect(Window.close).toHaveBeenCalledWith('presetElement');
		wrapper.unmount();
	});

	it('confirm 校验失败（UI 为空）聚焦 UI 控件不回调不关闭', async () => {
		const { wrapper, presetElement } = await mountAndInit();
		const input = vi.fn();
		presetElement.open({ input });
		vi.spyOn(getUiControl(), 'read').mockReturnValue('');
		presetElement.confirm();
		expect(input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('confirm 校验失败（未选中节点）聚焦列表不回调不关闭', async () => {
		const { wrapper, presetElement } = await mountAndInit();
		const input = vi.fn();
		presetElement.open({ input });
		vi.spyOn(getList(), 'read').mockReturnValue(null);
		presetElement.confirm();
		expect(input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('uiIdWrite 构建节点、更新列表并选中首项', async () => {
		const { wrapper, presetElement } = await mountAndInit();
		presetElement.open({ input: vi.fn() });
		vi.mocked(Data).ui = { 'ui-1': { nodes: makeNodes() } };
		const list = getList();
		const update = vi.spyOn(list, 'update').mockImplementation(() => undefined);
		const select = vi.spyOn(list, 'select').mockImplementation(() => undefined);
		presetElement.uiIdWrite({ value: 'ui-1' } as Event & { value?: string });
		expect(presetElement.nodes).toEqual([
			builtFolder({
				class: 'folder',
				name: 'Folder',
				children: [{ class: 'image', name: 'Pic', presetId: 'preset-1' }]
			}),
			builtNode({ class: 'text', name: 'Label', presetId: 'preset-2' }),
			builtNode({ class: 'button', name: 'Btn', presetId: 'preset-3' })
		]);
		expect(update).toHaveBeenCalled();
		expect(select).toHaveBeenCalledWith(presetElement.nodes![0]);
		expect(list.scrollTop).toBe(0);
		wrapper.unmount();
	});

	it('uiIdWrite 无 UI 数据时取消选择', async () => {
		const { wrapper, presetElement } = await mountAndInit();
		presetElement.open({ input: vi.fn() });
		const list = getList();
		const unselect = vi
			.spyOn(list as unknown as Record<'unselect', () => void>, 'unselect')
			.mockImplementation(() => undefined);
		presetElement.uiIdWrite({ value: 'missing-ui' } as Event & { value?: string });
		expect(presetElement.nodes).toHaveLength(0);
		expect(unselect).toHaveBeenCalled();
		wrapper.unmount();
	});

	it('uiIdWrite 无值时不更新列表', async () => {
		const { wrapper, presetElement } = await mountAndInit();
		presetElement.open({ input: vi.fn() });
		const update = vi.spyOn(getList(), 'update').mockImplementation(() => undefined);
		presetElement.uiIdWrite({ value: '' } as Event & { value?: string });
		presetElement.uiIdWrite({} as Event & { value?: string });
		expect(update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('windowClosed 清空目标、节点与列表', async () => {
		const { wrapper, presetElement } = await mountAndInit();
		presetElement.open({ input: vi.fn() });
		const list = getList();
		const clear = vi.spyOn(list, 'clear').mockImplementation(() => undefined);
		presetElement.windowClosed(new Event('closed'));
		expect(presetElement.target).toBeNull();
		expect(presetElement.nodes).toBeNull();
		expect(clear).toHaveBeenCalled();
		wrapper.unmount();
	});

	it('buildNodes 递归展开文件夹且保留预设属性', () => {
		const built = usePresetElementWindow().buildNodes(makeNodes());
		expect(built).toEqual([
			builtFolder({
				class: 'folder',
				name: 'Folder',
				children: [{ class: 'image', name: 'Pic', presetId: 'preset-1' }]
			}),
			builtNode({ class: 'text', name: 'Label', presetId: 'preset-2' }),
			builtNode({ class: 'button', name: 'Btn', presetId: 'preset-3' })
		]);
	});

	it('getDefaultPresetId 返回 UI.target 的 presetId', () => {
		getUIStore().target = { presetId: 'preset-3' } as never;
		expect(usePresetElementWindow().getDefaultPresetId()).toBe('preset-3');
		getUIStore().target = null;
		expect(usePresetElementWindow().getDefaultPresetId()).toBe('');
	});

	it('searcherInput 搜索并选中首个非文件夹节点', async () => {
		const { wrapper, presetElement } = await mountAndInit();
		presetElement.open({ input: vi.fn() });
		const list = getList();
		const searchNodes = vi.spyOn(list, 'searchNodes').mockImplementation(() => undefined);
		const select = vi.spyOn(list, 'select').mockImplementation(() => undefined);
		vi.spyOn(list, 'rowCount').mockImplementation(() => 2);
		vi.spyOn(list, 'rowItemAt').mockImplementation(
			(i: number) => [{ class: 'folder' }, { class: 'text' }][i] as never
		);
		presetElement.searcherInput({ value: 'label' });
		expect(searchNodes).toHaveBeenCalledWith('label');
		expect(select).toHaveBeenCalledWith({ class: 'text' });
		wrapper.unmount();
	});

	it('searcherKeydown 方向键移动选择、翻页键翻页', async () => {
		const { wrapper, presetElement } = await mountAndInit();
		presetElement.open({ input: vi.fn() });
		const list = getList();
		const selectRelative = vi.spyOn(list, 'selectRelative').mockImplementation(() => undefined);
		const pageUp = vi.spyOn(list, 'pageUp').mockImplementation(() => undefined);
		const pageDown = vi.spyOn(list, 'pageDown').mockImplementation(() => undefined);
		presetElement.searcherKeydown({
			code: 'ArrowDown',
			preventDefault: vi.fn()
		} as unknown as KeyboardEvent);
		expect(selectRelative).toHaveBeenCalledWith('down');
		presetElement.searcherKeydown({
			code: 'ArrowUp',
			preventDefault: vi.fn()
		} as unknown as KeyboardEvent);
		expect(selectRelative).toHaveBeenCalledWith('up');
		presetElement.searcherKeydown({
			code: 'PageUp',
			preventDefault: vi.fn()
		} as unknown as KeyboardEvent);
		expect(pageUp).toHaveBeenCalledWith(true);
		presetElement.searcherKeydown({
			code: 'PageDown',
			preventDefault: vi.fn()
		} as unknown as KeyboardEvent);
		expect(pageDown).toHaveBeenCalledWith(true);
		wrapper.unmount();
	});

	it('PresetElement 单例入口 open/confirm 与 composable 一致', async () => {
		const { PresetElement: PresetElementController } =
			await import('@app/composables/usePresetElementWindow');
		const { wrapper } = await mountAndInit();
		vi.mocked(Data).uiPresets = { 'preset-1': { uiId: 'ui-1', data: {} } };
		const input = vi.fn();
		PresetElementController.open({
			input,
			read: () => 'preset-1'
		} as unknown as Parameters<NonNullable<typeof PresetElementController.open>>[0]);
		expect(Window.open).toHaveBeenCalledWith('presetElement');
		expect(getUiControl().read()).toBe('ui-1');
		vi.spyOn(getList(), 'read').mockReturnValue({
			class: 'text',
			name: 'Label',
			presetId: 'preset-7'
		});
		PresetElementController.confirm();
		expect(input).toHaveBeenCalledWith('preset-7');
		expect(Window.close).toHaveBeenCalledWith('presetElement');
		wrapper.unmount();
	});
});
