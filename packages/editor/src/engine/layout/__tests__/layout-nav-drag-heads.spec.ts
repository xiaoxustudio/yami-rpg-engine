import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Layout } from '@app/engine/layout/layout.ts';
import { getLayoutStore } from '@app/stores/layout';

/**
 * 回归：`Layout.heads` 由 `Layout.initialize` 从各窗口的 `head` 收集，而窗口对象里那些成员
 * 在元素注册表尚未登记时会退化成**模块加载期的 `{}` 占位**（见该处注释）。
 *
 * 旧写法是 `if (head) head.style.pointerEvents = …`：真值判断拦不住 `{}`，而 `{}.style`
 * 是 undefined ⇒ 真机拖页签报
 * `TypeError: Cannot set properties of undefined (setting 'pointerEvents')`
 * （`navDragstart` / `navDragend` 各一次）。
 */
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
	// 本例只针对 heads 遍历：拖拽其它前置（真实分组、region 落点）都不需要
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
		// `{}` 占位 + null 都必须被跳过；真实元素仍要禁用/恢复指针事件
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
