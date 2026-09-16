import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { elementDataOf } from '../../../../utils/element-data';
import YMCommandList from '../YMCommandList.vue';
import { type CommandListApiOptions, type CommandListElementApi } from '../command-api';

interface CommandListElement extends HTMLElement {
	[k: string]: unknown;
	read: () => unknown;
	write: (data: unknown) => void;
	update: () => void;
	select: (start: number, end?: number) => void;
	unselect: () => void;
	selectAll: () => void;
	insert: (id?: string) => void;
	edit: (data?: unknown) => void;
	copy: () => void;
	paste: () => void;
	delete: () => void;
	undo: () => void;
	redo: () => void;
	save: (command: unknown) => void;
	toggle: () => void;
	clear: () => HTMLElement;
	resize: () => void;
	data: unknown;
	elements: { count: number };
	history: { canUndo: () => boolean; canRedo: () => boolean };
}

/**
 * P4b：命令列表自己的状态（选区窗口 / 聚焦）走**显式元素数据**——原实现读 `HTMLElement.prototype`
 * 上的访问器；字段从 `DATA_FIELDS` 摘除后，`el.start` 这类读法会静默变成 `undefined`。
 */
interface CommandListState {
	start: number | null;
	focusing?: boolean;
}

const listState = (el: unknown): CommandListState => elementDataOf<CommandListState>(el);

const makeCommand = (id: string, params: Record<string, unknown> = {}) => ({
	id,
	params,
	commands: []
});

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

class MockHistory {
	stack: { array: unknown[]; snapshot: unknown[] }[] = [];
	index = 0;
	save(data: { array?: unknown[]; commands?: unknown[] }): void {
		this.stack = this.stack.slice(0, this.index);
		this.stack.push({
			array: data.array as unknown[],
			snapshot: JSON.parse(JSON.stringify(data.array ?? []))
		});
		this.index = this.stack.length;
	}
	restore(mode: string): void {
		if (mode === 'undo' && this.index > 0) {
			this.index--;
			const { array, snapshot } = this.stack[this.index];
			array.splice(0, array.length, ...snapshot);
		} else if (mode === 'redo' && this.index < this.stack.length) {
			this.index++;
		}
	}
	canUndo(): boolean {
		return this.index > 0;
	}
	canRedo(): boolean {
		return this.index < this.stack.length;
	}
}

const makeOptions = (overrides: Partial<CommandListApiOptions> = {}): CommandListApiOptions => ({
	command: {
		parse: (item: Record<string, unknown>) => [{ color: 'normal' }, { text: String(item.id) }],
		fetchVariables: () => [],
		insert: vi.fn(),
		edit: vi.fn(),
		parseUnlinkedId: (id: string) => id,
		colorizeCodeLines: vi.fn()
	},
	clipboard: {
		write: vi.fn(),
		read: () => [],
		has: () => false
	},
	commandHistory: MockHistory as unknown as CommandListApiOptions['commandHistory'],
	localize: {
		language: 'zh-CN',
		get: (key: string) => key,
		createGetter: () => (key: string) => key
	},
	...overrides
});


/** 挂载组件并在下一拍读取行元素（换源后行由模板渲染） */
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

describe('YMCommandList', () => {
	it('mounts with command-list class and id', async () => {
		const wrapper = mount(YMCommandList, { props: { id: 'cmd-list' } });
		expect(wrapper.element.classList.contains('command-list')).toBe(true);
		expect(wrapper.element.id).toBe('cmd-list');
	});

	it('createCommandListElement creates list with api', async () => {
		const el = await mountCommandList<CommandListElement>(makeOptions());
		expect(el.classList.contains('command-list')).toBe(true);
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.update).toBe('function');
		expect(typeof el.select).toBe('function');
		expect(typeof el.unselect).toBe('function');
		expect(typeof el.insert).toBe('function');
		expect(typeof el.edit).toBe('function');
		expect(typeof el.copy).toBe('function');
		expect(typeof el.paste).toBe('function');
		expect(typeof el.delete).toBe('function');
		expect(typeof el.undo).toBe('function');
		expect(typeof el.redo).toBe('function');
		expect(typeof el.save).toBe('function');
		expect(typeof el.toggle).toBe('function');
		expect(typeof el.clear).toBe('function');
	});

	it('write renders command items and read returns data', async () => {
		const el = await mountCommandList<CommandListElement>(makeOptions());
		mockHeight(el);
		const data = [makeCommand('showText'), makeCommand('showChoices')];
		el.write(data);
		await nextTick();
		expect(el.read()).toBe(data);
		expect(el.elements.count).toBeGreaterThan(0);
		const items = Array.from(el.querySelectorAll('.command-item'));
		expect(items.length).toBeGreaterThan(0);
		expect(el.textContent).toContain('showText');
	});

	it('select highlights items', async () => {
		const el = await mountCommandList<CommandListElement>(makeOptions());
		mockHeight(el);
		el.write([makeCommand('a'), makeCommand('b'), makeCommand('c')]);
		await nextTick();
		listState(el).focusing = true;
		el.select(1);
		await nextTick();
		expect(listState(el).start).toBe(1);
		const items = Array.from(el.querySelectorAll('.command-item'));
		expect(items[1].classList.contains('selected')).toBe(true);
	});

	it('delete removes commands and saves history', async () => {
		const el = await mountCommandList<CommandListElement>(makeOptions());
		mockHeight(el);
		const data = [makeCommand('a'), makeCommand('b'), makeCommand('c')];
		el.write(data);
		await nextTick();
		el.focus();
		el.select(1);
		await nextTick();
		el.delete();
		expect(data.map((d) => d.id)).toEqual(['a', 'c']);
		expect(el.history.canUndo()).toBe(true);
	});

	it('undo restores deleted commands', async () => {
		const el = await mountCommandList<CommandListElement>(makeOptions());
		mockHeight(el);
		const data = [makeCommand('a'), makeCommand('b')];
		el.write(data);
		await nextTick();
		el.focus();
		el.select(1);
		await nextTick();
		el.delete();
		el.undo();
		expect(data.map((d) => d.id)).toEqual(['a', 'b']);
	});

	it('copy writes to clipboard', async () => {
		const clipboard = { write: vi.fn(), read: () => [], has: () => false };
		const el = await mountCommandList<CommandListElement>(makeOptions({ clipboard }));
		const data = [makeCommand('a'), makeCommand('b')];
		el.write(data);
		await nextTick();
		el.focus();
		el.select(0, 1);
		await nextTick();
		el.copy();
		expect(clipboard.write).toHaveBeenCalledWith('yami.commands', data);
	});

	it('paste inserts clipboard commands', async () => {
		const pasted = [makeCommand('pasted')];
		const clipboard = { write: vi.fn(), read: () => pasted, has: () => true };
		const el = await mountCommandList<CommandListElement>(makeOptions({ clipboard }));
		mockHeight(el);
		const data = [makeCommand('a')];
		el.write(data);
		await nextTick();
		el.focus();
		el.select(0);
		await nextTick();
		el.paste();
		expect(data.map((d) => d.id)).toEqual(['pasted', 'a']);
	});

	it('toggle disables commands', async () => {
		const el = await mountCommandList<CommandListElement>(makeOptions());
		mockHeight(el);
		const data = [makeCommand('a'), makeCommand('b')];
		el.write(data);
		await nextTick();
		el.focus();
		el.select(0, 1);
		await nextTick();
		el.toggle();
		expect(data.map((d) => d.id)).toEqual(['!a', '!b']);
	});

	it('save replaces command at selection', async () => {
		const el = await mountCommandList<CommandListElement>(makeOptions());
		mockHeight(el);
		const data = [makeCommand('a'), makeCommand('b')];
		el.write(data);
		await nextTick();
		el.focus();
		el.select(1);
		await nextTick();
		el.save(makeCommand('replaced'));
		expect(data.map((d) => d.id)).toEqual(['a', 'replaced']);
	});

	it('clear resets data and elements', async () => {
		const el = await mountCommandList<CommandListElement>(makeOptions());
		el.write([makeCommand('a')]);
		await nextTick();
		el.clear();
		expect(el.read()).toBe(null);
		expect(el.elements.count).toBe(0);
	});

	it('fold 元素渲染为 span.command-fold 且 pointerdown 命中折叠切换', async () => {
		const options = makeOptions();
		options.command!.parse = ((item: Record<string, unknown>) => {
			const cmds = item.commands as unknown[] | undefined;
			if (cmds && cmds.length) {
				return [{ fold: true }, { children: cmds }];
			}
			return [{ color: 'normal' }, { text: String(item.id) }];
		}) as NonNullable<CommandListApiOptions['command']>['parse'];
		const el = await mountCommandList<CommandListElement>(options);
		mockHeight(el);
		el.write([{ id: 'block', params: {}, commands: [{ id: 'a', params: {} }] }]);
		await nextTick();

		const fold = el.querySelector('.command-fold') as HTMLElement | null;
		expect(fold).toBeTruthy();
		expect(fold?.tagName).toBe('SPAN');
		expect(fold?.classList.contains('command-fold')).toBe(true);

		const li = fold?.closest('.command-item') as
			| (HTMLElement & { dataItem?: { folded?: boolean } })
			| null;
		expect(li).toBeTruthy();
		const foldedBefore = !!li?.dataItem?.folded;
		fold?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(!!li?.dataItem?.folded).toBe(!foldedBefore);
	});

	/**
	 * 插入路径（`command.insert`）此前没有用例覆盖。这里走**键盘**触发（输入字母即插入），
	 * 它在 jsdom 里可靠；"点击末尾空白行插入"那条指针路径留给真机冒烟（空白行本身已由
	 * 行模型/用例覆盖在案，这里只补"插入真的被调用"这一环）。
	 */
	it('输入字母 → 走 command.insert（插入路径覆盖率补齐）', async () => {
		const insert = vi.fn();
		const options = makeOptions();
		options.command!.insert = insert;
		const el = await mountCommandList<CommandListElement>(options);
		mockHeight(el);
		el.write([makeCommand('a')]);
		await nextTick();
		// keydown 分支要求列表处于聚焦态（`focusing`）且有选区
		listState(el).focusing = true;
		el.focus();
		el.select(0);
		await nextTick();

		el.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS', key: 's', bubbles: true }));
		await nextTick();
		expect(insert).toHaveBeenCalled();
	});

	/**
	 * 回归：`updateCommandElement` 是"追加"语义，而回写桥会在挂载/刷新/`:ref` 多处被调用——
	 * 曾经因此把行内文本叠成**两份**（实测）。桥现在会先清空行内（保留 fold 把手）再重建。
	 */
	it('行内文本不重复：每个内容片段只出现一次', async () => {
		const options = makeOptions();
		options.command!.parse = (() => [
			{ color: 'normal' },
			{ text: 'a' },
			{ color: 'normal' },
			{ text: 'b' }
		]) as never;
		const el = await mountCommandList<CommandListElement>(options);
		mockHeight(el);
		el.write([makeCommand('one')]);
		await nextTick();
		el.resize();
		await nextTick();

		const texts = Array.from(el.querySelectorAll('.command-text')).map((t) => t.textContent);
		expect(texts).toEqual(['a', 'b']);
	});
});
