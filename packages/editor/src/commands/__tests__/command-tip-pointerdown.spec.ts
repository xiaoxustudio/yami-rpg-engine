import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { YMTreeList } from '@ui-kit';
import { CommandSuggestion } from '@app/commands/command-tip';

/**
 * 回归（实机报错）：
 * ```
 * VM1121:3 [Uncaught Error] TypeError: Cannot read properties of undefined (reading 'class')
 *     at CommandSuggestion.listPointerdown (command-tip.ts:418:53)
 * ```
 * 原因：P4b 把行 item 搬进**元素数据**后，`event.target.item` 这个 expando 一律是 `undefined`。
 * `listPointerdown` 必须走 `treeItemOf` / `treeRowElement`（行 API 的正反向入口）——本用例钉住这条链路。
 */
interface SuggestionRow {
	id: string;
	name: string;
	class: string;
	value: string;
}

interface TreeListEl extends HTMLElement {
	bind(fn: () => SuggestionRow[]): void;
	update(): void;
}

const mountRows = async (
	rows: SuggestionRow[]
): Promise<{ wrapper: ReturnType<typeof mount>; rows: HTMLElement[] }> => {
	const wrapper = mount(YMTreeList, { attachTo: document.body });
	const el = wrapper.element as unknown as TreeListEl;
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	el.bind(() => rows);
	el.update();
	await nextTick();
	return { wrapper, rows: Array.from(el.querySelectorAll<HTMLElement>('.node-item')) };
};

const pointerdown = (target: EventTarget): void => {
	CommandSuggestion.listPointerdown!.call(
		{ pressing: null } as never,
		{ target } as unknown as PointerEvent
	);
};

afterEach(() => {
	document.body.innerHTML = '';
	CommandSuggestion.select = null;
});

describe('CommandSuggestion.listPointerdown（P4b：行 → item 经行 API，不读 expando）', () => {
	it('点行内标签文字：不抛错，pointerup 时选中该行', async () => {
		const data: SuggestionRow[] = [
			{ id: 'a', name: 'Show text', class: 'message', value: 'showText' }
		];
		const { wrapper, rows } = await mountRows(data);
		const text = rows[0].querySelector('.node-text') as HTMLElement;
		const select = vi.fn();
		CommandSuggestion.select = select;

		// 旧实现（`hasClass(element, 'node-item') && element.item.class`）在这里抛 TypeError
		expect(() => {
			pointerdown(text);
		}).not.toThrow();
		// 目标归一：点标签文字也算点这一行（旧实现要求 target 必须是行元素本身）
		rows[0].dispatchEvent(new Event('pointerup', { bubbles: true }));
		expect(select).toHaveBeenCalledWith(data[0]);
		wrapper.unmount();
	});

	it('点行元素本身：同样选中', async () => {
		const data: SuggestionRow[] = [{ id: 'b', name: 'Move', class: 'actor', value: 'move' }];
		const { wrapper, rows } = await mountRows(data);
		const select = vi.fn();
		CommandSuggestion.select = select;

		pointerdown(rows[0]);
		rows[0].dispatchEvent(new Event('pointerup', { bubbles: true }));
		expect(select).toHaveBeenCalledWith(data[0]);
		wrapper.unmount();
	});

	it('folder 行与行外节点：不注册 pointerup（点了也不会选中）', async () => {
		const data: SuggestionRow[] = [{ id: 'f', name: 'Folder', class: 'folder', value: 'f' }];
		const { wrapper, rows } = await mountRows(data);
		const select = vi.fn();
		CommandSuggestion.select = select;

		pointerdown(rows[0]);
		rows[0].dispatchEvent(new Event('pointerup', { bubbles: true }));
		expect(select).not.toHaveBeenCalled();

		// 行外（窗口空白处）不是行：不抛错也不注册
		const outside = document.createElement('div');
		expect(() => {
			pointerdown(outside);
		}).not.toThrow();
		outside.dispatchEvent(new Event('pointerup', { bubbles: true }));
		expect(select).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
