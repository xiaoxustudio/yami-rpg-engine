import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMTreeList from '../YMTreeList.vue';

interface TreeData {
	id: string;
	name: string;
	class: string;
	children: TreeData[];
	element?: HTMLElement;
}

interface TreeListElement extends HTMLElement {
	bind: (fn: () => TreeData[]) => void;
	update: () => void;
	elements: {
		count: number;
		start: number;
		end: number;
		length: number;
		[index: number]: HTMLElement & { item?: TreeData; textIndent?: number };
	};
}

const mockViewport = (el: HTMLElement, clientHeight: number): void => {
	Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: clientHeight, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

const makeData = (count: number): TreeData[] => {
	const data: TreeData[] = [];
	for (let i = 0; i < count; i++) {
		data.push({ id: `n${i}`, name: `Row ${i}`, class: 'file', children: [] });
	}
	return data;
};

const spacerStyles = (el: HTMLElement): { top: string; bottom: string } => {
	const spacers = el.querySelectorAll('.tree-scroll-spacer');
	return {
		top: (spacers[0] as HTMLElement).style.height,
		bottom: (spacers[1] as HTMLElement).style.height
	};
};

describe('YMTreeList 虚拟滚动（窗口切片 + 占位 + element 回写桥）', () => {
	it('大数据按 20px 窗口渲染并随 scrollTop 更新', () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as TreeListElement;
		mockViewport(el, 120);
		const data = makeData(300);
		el.bind(() => data);
		el.update();

		expect(el.elements.count).toBe(300);
		expect(el.querySelectorAll('.node-item').length).toBe(7);
		expect(spacerStyles(el)).toEqual({ top: '0px', bottom: '5860px' });
		expect(el.elements[0]).toBeInstanceOf(HTMLElement);
		expect(data[0].element).toBeInstanceOf(HTMLElement);

		el.scrollTop = 2000;
		el.update();

		expect(el.querySelectorAll('.node-item').length).toBe(7);
		expect(el.elements[100]).toBeInstanceOf(HTMLElement);
		const hundred = el.elements[100] as { item?: TreeData } | undefined;
		expect(hundred?.item).toBe(data[100]);
		expect(spacerStyles(el)).toEqual({ top: '2000px', bottom: '3860px' });

		expect(data[0].element).toBeUndefined();
		const ninetyNine = el.elements[99] as { item?: TreeData } | undefined;
		expect(ninetyNine?.item).toBe(data[99]);

		wrapper.unmount();
	});
});
