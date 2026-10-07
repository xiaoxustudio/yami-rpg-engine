import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import {
	attachRowData,
	type CommandListApiOptions,
	type CommandListElementApi
} from '../command-api';
import { elementDataOf } from '../../../../utils/element-data';
import YMCommandList from '../YMCommandList.vue';

interface ListElement extends HTMLElement {
	[k: string]: unknown;
	read: () => unknown;
	write: (data: unknown) => void;
	clear: () => HTMLElement;
	deleteCommandBuffers: (commands: unknown[]) => void;
	select: (start: number, end?: number) => void;
	elements: { count: number } & Record<number, unknown>;
}

interface FoldListElement extends ListElement {
	bindRowElement: (element: HTMLElement, index: number) => void;
	updateCommandElementFold: (element: unknown) => void;
	elements: { count: number } & Record<number, { dataItem: unknown; fold?: unknown } | undefined>;
}

/** 空白行 = `createBlankElement` 建的那行（`dataItem` 恒为 null） */
const findBlankRowIndex = (el: FoldListElement): number => {
	for (let i = 0; i < el.elements.count; i++) {
		const source = el.elements[i];
		if (source !== undefined && source.dataItem === null) return i;
	}
	return -1;
};

interface CommandListState {
	start: number | null;
	end: number | null;
	active: number | null;
	origin: number | null;
	focusing?: boolean;
}

const listState = (el: unknown): CommandListState => elementDataOf<CommandListState>(el);

interface CommandWithBuffer {
	id: string;
	params: Record<string, unknown>;
	commands: unknown[];
	buffer?: unknown[];
}

const makeCommand = (id: string): CommandWithBuffer => ({ id, params: {}, commands: [] });

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

class MockHistory {
	save(): void {}
	restore(): void {}
	canUndo(): boolean {
		return false;
	}
	canRedo(): boolean {
		return false;
	}
}

const makeOptions = (): CommandListApiOptions =>
	({
		command: {
			parse: (item: Record<string, unknown>) => [
				{ color: 'normal' },
				{ text: String(item.id) }
			],
			fetchVariables: () => [],
			insert: vi.fn(),
			edit: vi.fn(),
			parseUnlinkedId: (id: string) => id,
			colorizeCodeLines: vi.fn()
		},
		clipboard: { write: vi.fn(), read: () => [], has: () => false },
		commandHistory: MockHistory as unknown as CommandListApiOptions['commandHistory'],
		localize: { language: 'zh-CN', get: (k: string) => k, createGetter: () => (k: string) => k }
	}) as unknown as CommandListApiOptions;

const makeList = async (data: unknown[] = []): Promise<ListElement> => {
	const el = await mountCommandList<ListElement>(makeOptions());
	mockHeight(el);
	el.scroll = vi.fn();
	if (data.length > 0) el.write(data);
	return el;
};

const items = (n: number) => Array.from({ length: n }, (_, i) => makeCommand(`c${i}`));

const mountCommandList = async <T extends HTMLElement = HTMLElement & CommandListElementApi>(
	options: CommandListApiOptions
): Promise<T> => {
	const wrapper = mount(YMCommandList, { props: { options } });
	const el = wrapper.element as unknown as T & { scroll: unknown; clientHeight: number };
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
	el.scroll = (): void => {};
	await nextTick();
	return el;
};

describe('YMCommandList（行生命周期与选区重置）', () => {
	it('clear：清空后行数归零、选区状态复位，且可重新写入', async () => {
		const el = await makeList(items(5));
		listState(el).focusing = true;
		el.select(1);
		await nextTick();
		expect(el.elements.count).toBeGreaterThan(1);

		el.clear();
		expect(el.elements.count).toBe(0);
		expect(listState(el).start).toBeNull();
		expect(listState(el).end).toBeNull();
		expect(listState(el).active).toBeNull();
		expect(listState(el).origin).toBeNull();

		el.write(items(2));
		await nextTick();
		expect(el.elements.count).toBeGreaterThanOrEqual(2);
	});

	it('write 会为每条命令建立渲染缓冲（command.buffer）', async () => {
		const data = items(3);
		await makeList(data);
		for (const command of data) {
			expect(Array.isArray(command.buffer)).toBe(true);
		}
	});

	it('deleteCommandBuffers：回收命令对象上的渲染缓冲（而不是行元素）', async () => {
		const data = items(3);
		const el = await makeList(data);
		const rowsBefore = el.elements.count;

		el.deleteCommandBuffers([data[1]]);

		expect(data[1].buffer).toBeUndefined();
		expect(data[0].buffer).toBeDefined();
		expect(el.elements.count).toBe(rowsBefore);
	});

	it('重新 write 后行数与缓冲都会重建（清空→写入的往返）', async () => {
		const data = items(4);
		const el = await makeList(data);
		el.clear();
		el.write(data);
		await nextTick();
		expect(el.elements.count).toBeGreaterThanOrEqual(4);
		expect(Array.isArray(data[0].buffer)).toBe(true);
	});

	it('command 为 null 但带 fold 把手时，折叠更新器不得抛异常', async () => {
		const el = (await makeList(items(1))) as FoldListElement;
		const row = document.createElement('div') as HTMLElement & { fold?: HTMLElement };
		attachRowData(row, {
			rowKey: 'blank',
			command: null,
			list: [],
			index: 0,
			indent: 0,
			dataKey: false
		});
		elementDataOf<{ dataValue?: number }>(row).dataValue = 999;
		row.fold = document.createElement('span');

		expect(() => el.updateCommandElementFold(row)).not.toThrow();
	});

	it('行元素被复用到不可折叠的行（空白行）时，残留的 fold 把手必须被清掉', async () => {
		const el = (await makeList(items(1))) as FoldListElement;
		const blankIndex = findBlankRowIndex(el);
		expect(blankIndex, '应存在空白行（dataItem 为 null）').toBeGreaterThanOrEqual(0);
		expect(el.elements[blankIndex]?.fold, '空白行本身不可折叠').toBeUndefined();

		const rows = Array.from(
			el.querySelectorAll<HTMLElement & { fold?: HTMLElement }>('.command-item')
		);
		const node = rows[rows.length - 1];
		expect(node, '应至少渲染出一行').toBeTruthy();

		const stale = document.createElement('span');
		stale.className = 'command-fold';
		node.appendChild(stale);
		node.fold = stale;

		expect(() => el.bindRowElement(node, blankIndex)).not.toThrow();
		expect(node.fold, '复用到不可折叠的行后，fold 把手应被清除').toBeUndefined();
		expect(node.querySelector('.command-fold'), '把手对应的 DOM 也应移除').toBeNull();
	});
});
