import { describe, expect, it, vi } from 'vitest';
import { createCommandListElement, type CommandListApiOptions } from '../command-api';
import { rowKeyOf } from '../command-render';

/**
 * P6/M3 切片 1：渲染出的行必须带**派生层发的稳定行 key**（`li.rowKey === rowKeyOf(command)`）。
 * 这一步是 `v-for` 换源的前置条件——M3 换模板时这些 key 直接当 `:key`，没有它们就只能用下标。
 */
interface ListElement extends HTMLElement {
	[k: string]: unknown;
	write: (data: unknown[]) => void;
	update: () => void;
	elements: { count: number } & Record<number, { rowKey?: string }>;
}

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

const makeCommand = (id: string) => ({ id, params: {}, commands: [] });

describe('YMCommandList（M3 切片 1：行 key 接线）', () => {
	it('每行的 rowKey 等于派生层给该命令发的 key', () => {
		const el = createCommandListElement(makeOptions()) as ListElement;
		mockHeight(el);
		el.scroll = vi.fn();
		const commands = [makeCommand('a'), makeCommand('b')];
		el.write(commands);
		expect(el.elements[0].rowKey).toBe(rowKeyOf(commands[0]));
		expect(el.elements[1].rowKey).toBe(rowKeyOf(commands[1]));
	});

	it('重复渲染后 key 不变（同一命令对象复用同一 key）', () => {
		const el = createCommandListElement(makeOptions()) as ListElement;
		mockHeight(el);
		el.scroll = vi.fn();
		const commands = [makeCommand('a')];
		el.write(commands);
		const before = el.elements[0].rowKey;
		el.update();
		expect(el.elements[0].rowKey).toBe(before);
		expect(before).toBe(rowKeyOf(commands[0]));
	});
});
