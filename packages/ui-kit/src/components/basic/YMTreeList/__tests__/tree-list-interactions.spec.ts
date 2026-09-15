import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMTreeList from '../YMTreeList.vue';
import { treeRowCount, treeRowElement } from '../tree-api';
import { getListConfig } from '../../../../utils/list-config';
import { readPayload } from '../../../../utils/payload-event';

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

interface TreeData {
	id: string;
	name: string;
	class: string;
	expanded?: boolean;
	parent?: TreeData | null;
	element?: HTMLElement;
	children?: TreeData[];
}

interface TreeListElement extends HTMLElement {
	[k: string]: unknown;
	bind: (fn: () => TreeData[]) => void;
	update: () => void;
	read: () => TreeData | null;
	select: (item: TreeData) => void;
	unselect: (item?: TreeData) => void;
	unselectIn: (item: TreeData) => void;
	duplicate: (item: TreeData) => void;
	expandSelection: () => void;
	on: (name: string, cb: (e: Event & { value: unknown }) => void) => void;
	removable: boolean;
	lockDirectory: boolean;
	display: string;
	dragging:
		| null
		| (MouseEvent & { target: HTMLElement; hint: HTMLElement & { [k: string]: unknown } });
	root: TreeData | null;
}

const makeData = (): TreeData[] => [
	{
		id: 'folder1',
		name: 'Folder',
		class: 'folder',
		expanded: true,
		children: [
			{ id: 'child1', name: 'Child 1', class: 'file' },
			{ id: 'child2', name: 'Child 2', class: 'file' }
		]
	},
	{ id: 'item1', name: 'Item 1', class: 'file' }
];

const makeDataTransfer = (): DataTransfer => {
	return {
		dropEffect: 'none',
		effectAllowed: 'all',
		setDragImage: () => {}
	} as unknown as DataTransfer;
};

const fireMouse = (target: HTMLElement, type: string, init: Record<string, unknown>): void => {
	const event = new MouseEvent(type, { bubbles: true, cancelable: true });
	for (const key of Object.keys(init)) {
		Object.defineProperty(event, key, { value: init[key], configurable: true });
	}
	target.dispatchEvent(event);
};

const fireKey = (target: HTMLElement, init: Record<string, unknown>): void => {
	const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
	for (const key of Object.keys(init)) {
		Object.defineProperty(event, key, { value: init[key], configurable: true });
	}
	target.dispatchEvent(event);
};

const mountList = async (): Promise<{
	wrapper: ReturnType<typeof mount>;
	el: TreeListElement;
	data: TreeData[];
}> => {
	const wrapper = mount(YMTreeList, { attachTo: document.body });
	const el = wrapper.element as unknown as TreeListElement;
	mockHeight(el);
	const data = makeData();
	el.bind(() => data);
	await nextTick();
	el.update();
	await nextTick();
	return { wrapper, el, data };
};

describe('YMTreeList 拖拽交互', () => {
	it('dragstart 建立 dragging、hint 与 dragging class', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		el.select(data[1]);
		await nextTick();
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		expect(el.dragging).not.toBe(null);
		const hint = el.dragging!.hint;
		expect(hint.classList.contains('drag-and-drop-hint')).toBe(true);
		expect(hint.classList.contains('for-list')).toBe(true);
		expect(hint.classList.contains('hidden')).toBe(true);
		expect(hint.parentNode).toBe(el.parentNode);
		expect(el.classList.contains('dragging')).toBe(true);
		expect(Object.getOwnPropertyDescriptor(el.dragging!, 'offsetY')).toMatchObject({
			writable: true
		});
		wrapper.unmount();
	});

	it('dragstart 尊重 lockDirectory：folder 被拦截、file 放行', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		getListConfig(el).lockDirectory = true;
		el.select(data[0]);
		await nextTick();
		fireMouse(treeRowElement(data[0]) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		expect(el.dragging).toBe(null);
		el.select(data[1]);
		await nextTick();
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		expect(el.dragging).not.toBe(null);
		wrapper.unmount();
	});

	it('search 模式拒绝 dragstart', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		// 步骤 2：display 切换会重派生行（search 结果为空 → 行卸载），先取行元素再切模式
		const row = treeRowElement(data[0]) as HTMLElement;
		el.display = 'search';
		el.select(data[0]);
		await nextTick();
		fireMouse(row, 'dragstart', { dataTransfer: makeDataTransfer() });
		expect(el.dragging).toBe(null);
		wrapper.unmount();
	});

	it('dragover 按 offsetY 计算 before/into/after 并命中 node-item', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		el.select(data[1]);
		await nextTick();
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		const folder = treeRowElement(data[0]) as HTMLElement;
		fireMouse(folder, 'dragover', { dataTransfer: makeDataTransfer(), offsetY: 2 });
		expect(el.dragging!.hint.position).toBe('before');
		expect(el.dragging!.hint.target).toBe(folder);
		fireMouse(folder, 'dragover', { dataTransfer: makeDataTransfer(), offsetY: 8 });
		expect(el.dragging!.hint.position).toBe('into');
		// 步骤 4：hint class 由派生行渲染，需等一次 patch
		await nextTick();
		expect(folder.classList.contains('hint')).toBe(true);
		fireMouse(folder, 'dragover', { dataTransfer: makeDataTransfer(), offsetY: 20 });
		expect(el.dragging!.hint.position).toBe('after');
		fireMouse(el, 'dragend', {});
		wrapper.unmount();
	});

	it('dragover 无子节点目标按 10px 阈值切分 before/after', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		el.select(data[1]);
		await nextTick();
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		const child = treeRowElement(data[0].children![0]) as HTMLElement;
		fireMouse(child, 'dragover', { dataTransfer: makeDataTransfer(), offsetY: 5 });
		expect(el.dragging!.hint.position).toBe('before');
		fireMouse(child, 'dragover', { dataTransfer: makeDataTransfer(), offsetY: 12 });
		expect(el.dragging!.hint.position).toBe('after');
		fireMouse(el, 'dragend', {});
		wrapper.unmount();
	});

	it('dragover 空白区域产生 append 指示器', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		el.select(data[1]);
		await nextTick();
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		fireMouse(el, 'dragover', { dataTransfer: makeDataTransfer(), offsetY: 100 });
		const hint = el.dragging!.hint;
		expect(hint.position).toBe('append');
		expect(hint.target).toBe(treeRowElement(data[1]) as HTMLElement);
		fireMouse(el, 'dragend', {});
		wrapper.unmount();
	});

	it('drop into folder 追加子节点并派发 remove record', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		const source = data[1];
		const records: { value: unknown }[] = [];
		el.on('record', (e: Event & { value: unknown }) => records.push({ value: e.value }));
		el.select(source);
		await nextTick();
		fireMouse(treeRowElement(source) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		fireMouse(treeRowElement(data[0]) as HTMLElement, 'dragover', {
			dataTransfer: makeDataTransfer(),
			offsetY: 8
		});
		fireMouse(el, 'drop', { dataTransfer: makeDataTransfer() });
		expect(data[0].children!.map((c: TreeData) => c.id)).toEqual(['child1', 'child2', 'item1']);
		expect(records).toEqual([
			{
				value: {
					type: 'remove',
					item: source,
					source: { parent: el.root, index: 1 },
					destination: { parent: data[0], index: 2 }
				}
			}
		]);
		expect(el.classList.contains('dragging')).toBe(false);
		expect(el.dragging).toBe(null);
		wrapper.unmount();
	});

	it('drop before 插入到目标节点前', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		el.select(data[1]);
		await nextTick();
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		fireMouse(treeRowElement(data[0].children![0]) as HTMLElement, 'dragover', {
			dataTransfer: makeDataTransfer(),
			offsetY: 3
		});
		fireMouse(el, 'drop', { dataTransfer: makeDataTransfer() });
		expect(data[0].children!.map((c: TreeData) => c.id)).toEqual(['item1', 'child1', 'child2']);
		expect(data.map((i: TreeData) => i.id)).toEqual(['folder1']);
		wrapper.unmount();
	});

	it('drop after 将 folder 内节点移出到 root 末尾', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		el.select(data[0].children![1]);
		await nextTick();
		fireMouse(treeRowElement(data[0].children![1]) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'dragover', {
			dataTransfer: makeDataTransfer(),
			offsetY: 15
		});
		fireMouse(el, 'drop', { dataTransfer: makeDataTransfer() });
		expect(data[0].children!.map((c: TreeData) => c.id)).toEqual(['child1']);
		expect(data.map((i: TreeData) => i.id)).toEqual(['folder1', 'item1', 'child2']);
		wrapper.unmount();
	});

	it('drop 空白区域 append 到 root 末尾', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		el.select(data[0].children![0]);
		await nextTick();
		fireMouse(treeRowElement(data[0].children![0]) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		fireMouse(el, 'dragover', { dataTransfer: makeDataTransfer(), offsetY: 100 });
		fireMouse(el, 'drop', { dataTransfer: makeDataTransfer() });
		expect(data[0].children!.map((c: TreeData) => c.id)).toEqual(['child2']);
		expect(data.map((i: TreeData) => i.id)).toEqual(['folder1', 'item1', 'child1']);
		wrapper.unmount();
	});

	it('禁止 folder 拖入自身子孙：hint 隐藏、drop 为空操作', async () => {
		const { wrapper, el, data } = await mountList();
		getListConfig(el).removable = true;
		el.select(data[0]);
		await nextTick();
		fireMouse(treeRowElement(data[0]) as HTMLElement, 'dragstart', {
			dataTransfer: makeDataTransfer()
		});
		fireMouse(treeRowElement(data[0].children![0]) as HTMLElement, 'dragover', {
			dataTransfer: makeDataTransfer(),
			offsetY: 3
		});
		expect(el.dragging!.hint.classList.contains('hidden')).toBe(true);
		fireMouse(el, 'drop', { dataTransfer: makeDataTransfer() });
		expect(data[0].children!.map((c: TreeData) => c.id)).toEqual(['child1', 'child2']);
		expect(data.map((i: TreeData) => i.id)).toEqual(['folder1', 'item1']);
		expect(el.dragging).toBe(null);
		wrapper.unmount();
	});
});

describe('YMTreeList 键盘导航', () => {
	it('ArrowDown/ArrowUp 移动选择且在边界不越界', async () => {
		const { wrapper, el, data } = await mountList();
		fireKey(el, { code: 'ArrowDown' });
		expect(el.read()).toBe(data[0]);
		fireKey(el, { code: 'ArrowDown' });
		expect(el.read()).toBe(data[0].children![0]);
		fireKey(el, { code: 'ArrowUp' });
		expect(el.read()).toBe(data[0]);
		fireKey(el, { code: 'ArrowUp' });
		fireKey(el, { code: 'ArrowUp' });
		fireKey(el, { code: 'ArrowUp' });
		expect(el.read()).toBe(data[0]);
		fireKey(el, { code: 'ArrowDown' });
		fireKey(el, { code: 'ArrowDown' });
		fireKey(el, { code: 'ArrowDown' });
		fireKey(el, { code: 'ArrowDown' });
		fireKey(el, { code: 'ArrowDown' });
		expect(el.read()).toBe(data[1]);
		wrapper.unmount();
	});

	it('ArrowDown 无选中从首节点开始、ArrowUp 无选中落到末节点', async () => {
		const { wrapper, el, data } = await mountList();
		fireKey(el, { code: 'ArrowUp' });
		expect(el.read()).toBe(data[1]);
		el.unselect();
		await nextTick();
		fireKey(el, { code: 'ArrowDown' });
		expect(el.read()).toBe(data[0]);
		wrapper.unmount();
	});

	it('Enter 对选中节点派发 open 事件', async () => {
		const { wrapper, el, data } = await mountList();
		let opened: unknown = null;
		el.on('open', (e: Event & { value: unknown }) => (opened = e.value));
		el.select(data[1]);
		await nextTick();
		fireKey(el, { code: 'Enter' });
		expect(opened).toBe(data[1]);
		wrapper.unmount();
	});

	it('ArrowRight 展开选中 folder', async () => {
		const { wrapper, el, data } = await mountList();
		el.select(data[0]);
		await nextTick();
		data[0].expanded = false;
		el.update();
		await nextTick();
		expect(treeRowCount(el)).toBe(2);
		fireKey(el, { code: 'ArrowRight' });
		expect(data[0].expanded).toBe(true);
		expect(treeRowCount(el)).toBe(4);
		wrapper.unmount();
	});

	it('无关按键与 altKey 不改变选择', async () => {
		const { wrapper, el, data } = await mountList();
		el.select(data[1]);
		await nextTick();
		fireKey(el, { code: 'KeyA' });
		expect(el.read()).toBe(data[1]);
		fireKey(el, { code: 'ArrowUp', altKey: true });
		fireKey(el, { code: 'ArrowDown', altKey: true });
		expect(el.read()).toBe(data[1]);
		wrapper.unmount();
	});
});

describe('YMTreeList 右键 popup', () => {
	it('右键选中节点派发 popup，value 为节点并携带坐标', async () => {
		const { wrapper, el, data } = await mountList();
		el.focus();
		let popup: (Event & { value: unknown; clientX: number; clientY: number }) | null = null;
		el.on('popup', (e) => {
			popup = readPayload<{ value: unknown; clientX: number; clientY: number }>(e);
		});
		el.select(data[1]);
		await nextTick();
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'pointerdown', {
			button: 2,
			clientX: 100,
			clientY: 40
		});
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'pointerup', {
			button: 2,
			clientX: 100,
			clientY: 40
		});
		expect(popup!.value).toBe(data[1]);
		expect(popup!.clientX).toBe(100);
		expect(popup!.clientY).toBe(40);
		wrapper.unmount();
	});

	it('右键空白区域派发 popup，value 为 null', async () => {
		const { wrapper, el } = await mountList();
		el.focus();
		let popup: (Event & { value: unknown }) | null = null;
		el.on('popup', (e) => (popup = readPayload<{ value: unknown }>(e)));
		fireMouse(el, 'pointerup', { button: 2, clientX: 10, clientY: 300 });
		expect(popup!.value).toBe(null);
		wrapper.unmount();
	});

	it('右键未选中节点先选中再派发 popup', async () => {
		const { wrapper, el, data } = await mountList();
		el.focus();
		let popup: (Event & { value: unknown }) | null = null;
		el.on('popup', (e) => (popup = readPayload<{ value: unknown }>(e)));
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'pointerdown', {
			button: 2,
			clientX: 100,
			clientY: 40
		});
		expect(el.read()).toBe(data[1]);
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'pointerup', {
			button: 2,
			clientX: 100,
			clientY: 40
		});
		expect(popup!.value).toBe(data[1]);
		wrapper.unmount();
	});

	it('列表未聚焦时不派发 popup', async () => {
		const { wrapper, el, data } = await mountList();
		let popup: (Event & { value: unknown }) | null = null;
		el.on('popup', (e) => (popup = readPayload<{ value: unknown }>(e)));
		el.select(data[1]);
		await nextTick();
		fireMouse(treeRowElement(data[1]) as HTMLElement, 'pointerup', {
			button: 2,
			clientX: 100,
			clientY: 40
		});
		expect(popup).toBe(null);
		wrapper.unmount();
	});
});

describe('YMTreeList unselectIn 与空白点击', () => {
	it('unselectIn 取消子树内选中项', async () => {
		const { wrapper, el, data } = await mountList();
		el.select(data[0].children![1]);
		await nextTick();
		el.unselectIn(data[0]);
		await nextTick();
		expect(el.read()).toBe(null);
		wrapper.unmount();
	});

	it('unselectIn 不影响子树外选中项', async () => {
		const { wrapper, el, data } = await mountList();
		el.select(data[1]);
		await nextTick();
		el.unselectIn(data[0]);
		await nextTick();
		expect(el.read()).toBe(data[1]);
		wrapper.unmount();
	});

	it('unselectIn 派发 unselect 事件且 value 为被移除项', async () => {
		const { wrapper, el, data } = await mountList();
		const removed: unknown[] = [];
		el.on('unselect', (e: Event & { value: unknown }) => removed.push(e.value));
		el.select(data[0].children![1]);
		await nextTick();
		el.unselectIn(data[0]);
		await nextTick();
		expect(removed).toEqual([[data[0].children![1]]]);
		wrapper.unmount();
	});

	it('点击空白区域不清除当前选择', async () => {
		const { wrapper, el, data } = await mountList();
		el.select(data[1]);
		await nextTick();
		fireMouse(el, 'pointerdown', { button: 0, clientX: 5, clientY: 300 });
		fireMouse(el, 'pointerup', { button: 0, clientX: 5, clientY: 300 });
		expect(el.read()).toBe(data[1]);
		wrapper.unmount();
	});
});

describe('YMTreeList duplicate', () => {
	it('duplicate 复制节点到原位后并生成副本后缀名', async () => {
		const { wrapper, el, data } = await mountList();
		const target = data[0].children![0];
		el.select(target);
		await nextTick();
		el.duplicate(target);
		await nextTick();
		expect(data[0].children!.length).toBe(3);
		const copy = data[0].children![1];
		expect(copy).not.toBe(target);
		expect(copy.id).toBe(target.id);
		expect(copy.name).toBe('Child 3');
		expect(treeRowElement(copy) as HTMLElement).toBeDefined();
		expect(treeRowElement(copy) as HTMLElement).not.toBe(target.element);
		expect(el.read()).toBe(copy);
		wrapper.unmount();
	});

	it('duplicate 触发 create record 并选中副本', async () => {
		const { wrapper, el, data } = await mountList();
		const target = data[0].children![0];
		const next = data[0].children![1];
		let record: {
			type: string;
			sItem: TreeData;
			dItem: TreeData;
			insertBefore: boolean;
		} | null = null;
		el.on('record', (e) => {
			const r = e.value as {
				type: string;
				sItem: TreeData;
				dItem: TreeData;
				insertBefore: boolean;
			};
			if (r.type === 'create') record = r;
		});
		el.select(target);
		await nextTick();
		el.duplicate(target);
		await nextTick();
		const copy = data[0].children![1];
		expect(record).toEqual({
			type: 'create',
			sItem: copy,
			dItem: next,
			insertBefore: true
		});
		expect(copy).not.toBe(target);
		expect(el.read()).toBe(copy);
		wrapper.unmount();
	});
});
