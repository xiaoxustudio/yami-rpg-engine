import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { type CommandListApiOptions } from '../command-api';
import YMCommandList from '../YMCommandList.vue';

/**
 * **可见窗口真的只渲染窗口**（虚拟滚动的承重测试）。
 *
 * 背景：行由模板 `v-for` 按 api 的行模型挂出（`f493ae0e` / `c1fc149e` 两个 wip 提交换的源）。
 * 行模型一度遍历 `0..count`（**整个离屏元素池**）⇒ 模型与 DOM 都是全部行、虚拟滚动失效，
 * 而首/末行的 `marginTop`/`marginBottom` 仍按窗口算 ⇒ 内容高度约为真实值的两倍、滚动映射整体
 * 错位。2026-10-01 用户报的「事件编辑器滚动时有些布局看不见 + 抖动」即此。
 *
 * 本用例是那件事的**仪器**：它必须能变红——把 `rebuildCommandRowModel` 的循环改回
 * `for (let i = 0; i < count; i++)` 后，"只有窗口那么多行" 那条会报 101 vs 21。
 *
 * ⚠️ 元素数 ≠ 命令数：`createItems` 会在末尾追加一条**空白行**（"在此插入指令"），
 * 所以 100 条命令对应 `elements.count === 101`。模型里的 `index` 是**全量下标**。
 */
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
		commandHistory: class {
			save(): void {}
			restore(): void {}
			canUndo(): boolean {
				return false;
			}
			canRedo(): boolean {
				return false;
			}
		} as unknown as CommandListApiOptions['commandHistory'],
		localize: { language: 'zh-CN', get: (k: string) => k, createGetter: () => (k: string) => k }
	}) as unknown as CommandListApiOptions;

interface WindowRow {
	index: number;
	key: string;
	marginTop: number;
	marginBottom: number;
}

interface WindowListElement extends HTMLElement {
	scrollTop: number;
	write: (data: unknown[]) => void;
	resize: () => void;
	elements: { count: number };
	getRowModel: () => {
		start: number;
		end: number;
		keys: string[];
		rows: WindowRow[];
	};
}

const VIEWPORT = 400;
const WINDOW = Math.ceil(VIEWPORT / 20) + 1;

const mountList = async (commands = 100): Promise<WindowListElement> => {
	const wrapper = mount(YMCommandList, { props: { options: makeOptions() } });
	const el = wrapper.element as WindowListElement;
	Object.defineProperty(el, 'clientHeight', { value: VIEWPORT, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: VIEWPORT, configurable: true });
	el.scrollTop = 0;
	(el as unknown as { scroll: unknown }).scroll = (): void => {};
	el.write(
		Array.from({ length: commands }, (_, i) => ({ id: 'cmd' + i, params: {}, commands: [] }))
	);
	await nextTick();
	return el;
};

describe('YMCommandList 虚拟滚动窗口（只渲染可见行）', () => {
	it('模型与 DOM 都只有窗口那么多行，而不是全部', async () => {
		const el = await mountList(100);
		const model = el.getRowModel();
		expect(el.elements.count).toBe(101);
		expect(model.rows.length).toBe(WINDOW);
		expect(el.querySelectorAll('.command-item').length).toBe(WINDOW);
	});

	it('模型从窗口起点开始（行下标是**全局**下标），首/末行 margin 顶出窗口外的行', async () => {
		const el = await mountList(100);
		el.scrollTop = 40 * 20;
		el.resize();
		await nextTick();
		const count = el.elements.count;
		const model = el.getRowModel();
		const last = model.rows[model.rows.length - 1];
		expect(model.start).toBe(40);
		expect(model.rows[0].index).toBe(40);
		expect(model.end).toBe(61);
		expect(model.rows[0].marginTop).toBe(40 * 20);
		expect(last.marginTop).toBe(0);
		expect(last.marginBottom).toBe((count - model.end) * 20);
	});

	it.each([0, 20, 200, 1200, 1980])(
		'滚动到 %ipx：窗口跟着走，且 DOM 行数始终有界（不会随滚动累积）',
		async (top) => {
			const el = await mountList(100);
			const count = el.elements.count;
			el.scrollTop = top;
			el.resize();
			await nextTick();
			const model = el.getRowModel();
			expect(model.start).toBe(Math.min(Math.floor(top / 20), count - 1));
			expect(model.rows.length).toBeLessThanOrEqual(WINDOW);
			expect(el.querySelectorAll('.command-item').length).toBe(model.rows.length);
		}
	);

	it('窗口真的动了才派发 `rowmodel`（渲染方据此重建行，不必在 scroll 上反复重建）', async () => {
		const el = await mountList(100);
		const seen = vi.fn();
		el.addEventListener('rowmodel', seen);
		el.scrollTop = 5;
		el.resize();
		expect(seen).not.toHaveBeenCalled();
		el.scrollTop = 20;
		el.resize();
		expect(seen).toHaveBeenCalledTimes(1);
	});

	it('`update()` 之后模型与 DOM 仍然一致（窗口在 update 事件之前就已经定好）', async () => {
		const el = await mountList(100);
		el.scrollTop = 600;
		el.write(Array.from({ length: 50 }, (_, i) => ({ id: 'x' + i, params: {}, commands: [] })));
		await nextTick();
		const model = el.getRowModel();
		expect(model.start).toBe(30);
		expect(model.end).toBe(51);
		expect(model.rows[0].index).toBe(30);
		expect(el.querySelectorAll('.command-item').length).toBe(model.rows.length);
	});
});
