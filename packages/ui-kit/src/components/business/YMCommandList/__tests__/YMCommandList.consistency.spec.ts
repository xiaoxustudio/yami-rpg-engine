import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMCommandList from '../YMCommandList.vue';
import { type CommandListApiOptions } from '../command-api';
import { elementDataOf } from '../../../../utils/element-data';

/**
 * 一致性回归：换源后"模型驱动渲染"，因此**每一步操作之后**行模型的 key 序列都应当与 DOM 一致。
 * 这条用例来自一次探针：它当场抓出 `clear()` 之后书里归零、屏幕上仍留着旧行（模型与 DOM 都还是 6 行）。
 * 单点断言（例如只查 `elements.count === 0`）看不到这类问题——所以这里比对的是**两边**。
 */
const makeOptions = (): CommandListApiOptions =>
	({
		command: {
			parse: (item: Record<string, unknown>) => {
				const cmds = item.commands as unknown[] | undefined;
				if (cmds && cmds.length) return [{ fold: true }, { children: cmds }];
				return [{ color: 'normal' }, { text: String(item.id) }];
			},
			fetchVariables: () => [],
			insert: vi.fn(),
			edit: vi.fn(),
			parseUnlinkedId: (id: string) => id,
			colorizeCodeLines: vi.fn()
		},
		clipboard: { write: vi.fn(), read: () => [], has: () => false },
		commandHistory: class {
			save(): void {}
			restore(): void {}
			canUndo(): boolean {
				return false;
			}
			canRedo(): boolean {
				return false;
			}
		},
		localize: { language: 'zh-CN', get: (k: string) => k, createGetter: () => (k: string) => k }
	}) as unknown as CommandListApiOptions;

interface ConsistencyApi extends HTMLElement {
	[k: string]: unknown;
	write: (data: unknown[]) => void;
	select: (start: number, end?: number) => void;
	selectAll: () => void;
	unselect: () => void;
	clear: () => void;
	resize: () => void;
	getRowModel: () => { keys: string[] };
}

describe('YMCommandList（模型 ↔ DOM 一致性）', () => {
	it('一串操作之后，行模型的 key 序列与 DOM 始终一致（含 clear 清空）', async () => {
		const wrapper = mount(YMCommandList, { props: { options: makeOptions() } });
		const el = wrapper.element as unknown as ConsistencyApi;
		Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
		el.scroll = (): void => {};
		await nextTick();

		const nonEmpty = (keys: string[]): string[] => keys.filter((k) => k.length > 0);
		const domKeys = (): string[] =>
			nonEmpty(
				Array.from(el.querySelectorAll<HTMLElement>('.command-item')).map(
					(r) => (r as unknown as { rowKey?: string }).rowKey ?? ''
				)
			);
		const expectConsistent = (): void =>
			expect(domKeys()).toEqual(nonEmpty(el.getRowModel().keys));

		el.write([
			{ id: 'a', params: {}, commands: [] },
			{ id: 'b', params: {}, commands: [{ id: 'c', params: {} }] }
		]);
		await nextTick();
		expectConsistent();

		el.select(0);
		await nextTick();
		expectConsistent();

		el.selectAll();
		await nextTick();
		expectConsistent();

		el.unselect();
		await nextTick();
		expectConsistent();

		el.resize();
		await nextTick();
		expectConsistent();

		el.clear();
		await nextTick();
		// 清空后两边都必须为空（曾经书里归零、DOM 仍留着旧行）
		expect(el.getRowModel().keys).toEqual([]);
		expect(domKeys()).toEqual([]);
	});

	/**
	 * 长序列：把**跨行操作**都串一遍（选择导航、滚动定位、折叠、全选、删除、撤销、resize），
	 * 每一步都要求模型与 DOM 的 key 序列一致。探针实测这 15 步全部一致（折叠 7→4、删除 4→1），
	 * 这条把它固定下来——它是"模型驱动渲染"最直接的守门用例。
	 */
	it('长序列（导航/滚动/折叠/全选/删除/撤销）每一步都保持模型与 DOM 一致', async () => {
		const wrapper = mount(YMCommandList, { props: { options: makeOptions() } });
		const el = wrapper.element as unknown as ConsistencyApi & {
			toggle: () => void;
			fold: (a?: unknown) => void;
			delete: () => void;
			undo: () => void;
			scrollToSelection: (m?: string) => void;
			scrollToRow: (i: number, p?: string) => void;
			selectDown: (a: boolean, b: boolean) => void;
			selectUp: (a: boolean, b: boolean) => void;
			selectMultipleDown: () => void;
			selectMultipleUp: () => void;
		};
		Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
		el.scroll = (): void => {};
		await nextTick();

		const nonEmpty = (keys: string[]): string[] => keys.filter((k) => k.length > 0);
		const domKeys = (): string[] =>
			nonEmpty(
				Array.from(el.querySelectorAll<HTMLElement>('.command-item')).map(
					(r) => (r as unknown as { rowKey?: string }).rowKey ?? ''
				)
			);
		const step = async (fn: () => void): Promise<void> => {
			fn();
			await nextTick();
			expect(domKeys()).toEqual(nonEmpty(el.getRowModel().keys));
		};

		el.write([
			{ id: 'a', params: {}, commands: [] },
			{ id: 'b', params: {}, commands: [{ id: 'c', params: {} }] },
			{ id: 'd', params: {}, commands: [] }
		]);
		await nextTick();
		// `focusing` 是元素数据（原走 `HTMLElement.prototype` 上的访问器）
		elementDataOf<{ focusing?: boolean }>(el).focusing = true;
		expect(domKeys()).toEqual(nonEmpty(el.getRowModel().keys));

		await step(() => el.select(1));
		await step(() => el.toggle());
		await step(() => el.selectDown(true, false));
		await step(() => el.selectUp(true, false));
		await step(() => el.selectMultipleDown());
		await step(() => el.selectMultipleUp());
		await step(() => el.scrollToSelection('active'));
		await step(() => el.scrollToRow(0, 'top'));
		// 折叠会把子行移出可见集
		const beforeFold = el.getRowModel().keys.length;
		await step(() => el.fold());
		expect(el.getRowModel().keys.length).toBeLessThan(beforeFold);
		await step(() => el.selectAll());
		await step(() => el.delete());
		await step(() => el.undo());
		await step(() => el.resize());
		await step(() => el.unselect());
	});
});
