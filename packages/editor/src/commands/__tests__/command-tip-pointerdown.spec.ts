import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { YMTreeList } from '@ui-kit';
import { CommandSuggestion } from '@app/commands/command-tip';

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

describe('CommandSuggestion.listPointerdown（行 → item 经行 API，不读 expando）', () => {
	it('点行内标签文字：不抛错，pointerup 时选中该行', async () => {
		const data: SuggestionRow[] = [
			{ id: 'a', name: 'Show text', class: 'message', value: 'showText' }
		];
		const { wrapper, rows } = await mountRows(data);
		const text = rows[0].querySelector('.node-text') as HTMLElement;
		const select = vi.fn();
		CommandSuggestion.select = select;

		expect(() => {
			pointerdown(text);
		}).not.toThrow();
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

		const outside = document.createElement('div');
		expect(() => {
			pointerdown(outside);
		}).not.toThrow();
		outside.dispatchEvent(new Event('pointerup', { bubbles: true }));
		expect(select).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
