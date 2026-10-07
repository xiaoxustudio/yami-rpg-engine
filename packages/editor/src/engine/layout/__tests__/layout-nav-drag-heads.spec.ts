import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Layout } from '@app/engine/layout/layout.ts';
import { getLayoutStore } from '@app/stores/layout';

interface DragEventLike {
	dataTransfer: { setDragImage: () => void };
	preventDefault: () => void;
	clientX: number;
	clientY: number;
	[k: string]: unknown;
}

const createDragEvent = (): DragEventLike => ({
	dataTransfer: { setDragImage: () => {} },
	preventDefault: () => {},
	clientX: 0,
	clientY: 0
});

let keyGroups: typeof Layout.getKeyGroups;

beforeEach(() => {
	document.body.innerHTML = '';
	keyGroups = Layout.getKeyGroups;
	Layout.getKeyGroups = (() => []) as typeof Layout.getKeyGroups;
	getLayoutStore().dragging = null;
});

afterEach(() => {
	Layout.getKeyGroups = keyGroups;
	Layout.heads = null;
	getLayoutStore().dragging = null;
	document.body.innerHTML = '';
});

describe('Layout nav 拖拽对 heads 占位的健壮性', () => {
	it('navDragstart/navDragend 跳过非元素条目，同时仍处理真实 head', () => {
		const head = document.createElement('div');
		document.body.appendChild(head);
		Layout.heads = [{} as HTMLElement, head, null as unknown as HTMLElement];

		expect(() => Layout.navDragstart!(createDragEvent() as never)).not.toThrow();
		expect(head.style.pointerEvents).toBe('none');

		expect(() => Layout.navDragend!({} as never)).not.toThrow();
		expect(head.style.pointerEvents).toBe('');
	});

	it('heads 全为占位/空时两个钩子都不抛错', () => {
		Layout.heads = [{} as HTMLElement, null as unknown as HTMLElement];
		expect(() => Layout.navDragstart!(createDragEvent() as never)).not.toThrow();
		expect(() => Layout.navDragend!({} as never)).not.toThrow();
	});
});
