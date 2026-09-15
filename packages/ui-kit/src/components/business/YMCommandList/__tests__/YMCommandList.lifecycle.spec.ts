import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createCommandListElement, type CommandListApiOptions } from '../command-api';
import YMCommandList from '../YMCommandList.vue';

/**
 * P6/M1 补测（第五批）：**为命令列表的换源做前置加固**。
 * M3 换源会动"行元素归属"，因此先把"行的清空/缓存回收/选区重置"这些**跨行的可观察行为**钉住，
 * 换源后一旦行生命周期出错，用例会直接指出是哪一类。
 *
 * 断言的语义都按**实现**写（不是按直觉）：例如 `deleteCommandBuffers` 回收的是命令对象上的
 * **渲染缓冲**（`command.buffer`），而不是行元素本身。
 */
interface ListElement extends HTMLElement {
	[k: string]: unknown;
	read: () => unknown;
	write: (data: unknown) => void;
	clear: () => HTMLElement;
	deleteCommandBuffers: (commands: unknown[]) => void;
	select: (start: number, end?: number) => void;
	start: number | null;
	end: number | null;
	active: number | null;
	origin: number | null;
	focusing?: boolean;
	elements: { count: number } & Record<number, unknown>;
}

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
			parse: (item: Record<string, unknown>) => [{ color: 'normal' }, { text: String(item.id) }],
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

const makeList = async (data: unknown[] = []): Promise<unknown> => {
	const el = await mountCommandList<ListElement>(makeOptions());
	mockHeight(el);
	el.scroll = vi.fn();
	if (data.length > 0) el.write(data);
	return el;
};

const items = (n: number) => Array.from({ length: n }, (_, i) => makeCommand(`c${i}`));


/** 挂载组件并在下一拍读取行元素（换源后行由模板渲染） */
const mountCommandList = async <T extends HTMLElement>(options: CommandListApiOptions): Promise<T> => {
	const wrapper = mount(YMCommandList, { props: { options } });
	const el = wrapper.element as unknown as T & { scroll: unknown; clientHeight: number };
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
	el.scroll = (): void => {};
	await nextTick();
	return el;
};

describe('YMCommandList（M1 补测：行生命周期与选区重置——换源前置加固）', () => {
	it('clear：清空后行数归零、选区状态复位，且可重新写入', async () => {
		const el = await makeList(items(5));
		el.focusing = true;
		el.select(1);
		await nextTick();
		expect(el.elements.count).toBeGreaterThan(1);

		el.clear();
		expect(el.elements.count).toBe(0);
		expect(el.start).toBeNull();
		expect(el.end).toBeNull();
		expect(el.active).toBeNull();
		expect(el.origin).toBeNull();

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

		expect(data[1].buffer).toBeUndefined(); // 缓冲被删
		expect(data[0].buffer).toBeDefined(); // 其它命令不受影响
		expect(el.elements.count).toBe(rowsBefore); // 行数不变：这是缓冲回收，不是行删除
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
});
