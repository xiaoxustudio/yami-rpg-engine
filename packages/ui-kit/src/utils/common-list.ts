import { getListConfig } from './list-config';
import { elementDataOf } from './element-data';

export interface CommonListLike {
	scrollTop: number;
	clientHeight: number;
	/**
	 * 助手**只写不读**它（`commonListResize` 里 `el.textContent = ''` 清空用）。
	 * 所以这里必须用 DOM 的原生类型 `string | null`：写成 `string` 会让所有
	 * `HTMLElement` 系的调用方与这个契约「不可比」，于是每个调用点都被迫绕道
	 * `as unknown as CommonListLike`（多一层毫无信息量的逃逸）。
	 */
	textContent: string | null;
	childNodes: NodeListOf<ChildNode>;
	updateOnResize(element: HTMLElement): void;
	appendChild(node: Node): Node;
	insertBefore(node: Node, child: Node | null): Node;
	elements: (HTMLElement & { versionId?: number })[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: HTMLElement | null;
		foot: HTMLElement | null;
	};
}

/** row element versionId now lives in element data (field removed from DATA_FIELDS) */
const versionOf = (el: unknown): { versionId?: number } =>
	elementDataOf<{ versionId?: number }>(el);

export const ROW_HEIGHT = 20;

/** 虚拟滚动窗口 */
export interface VisibleRange {
	start: number;
	end: number;
}

/**
 * 虚拟滚动窗口公式（行高 `ROW_HEIGHT`）—— **全仓唯一一份**。
 *
 * 此前 `param-list-core`、`common-list-core`、`tree-render` 各抄了一遍**逐字相同**的实现，
 * 三处的「与 common-list 现行公式一致」只靠注释与三份内容相同的测试维持；
 * 现在改为共用本函数，公式再改只需要动这里。
 *
 * 调用方分两类，都保留自己的前置守卫：`commonListResize` 先判 `clientHeight === 0` /
 * `count === 0`，`tree-render` 的 `computeWindow` 则把两种空情形都折成 `{0, 0}`。
 */
export const computeVisibleRange = (
	scrollTop: number,
	clientHeight: number,
	count: number
): VisibleRange => {
	const start = Math.min(Math.floor(scrollTop / ROW_HEIGHT), count - 1);
	const length = Math.ceil(clientHeight / ROW_HEIGHT) + 1;
	return { start, end: Math.min(start + length, count) };
};

/**
 * 首行 `marginTop` / 末行 `marginBottom`（撑出滚动高度）—— 同上，只有一份。
 * `padded` 决定末行是否多留一行。
 */
export const computeRowMargins = (
	count: number,
	start: number,
	end: number,
	padded: boolean
): { marginTop: number; marginBottom: number } => {
	const pad = padded ? 1 : 0;
	return {
		marginTop: start * ROW_HEIGHT,
		marginBottom: (count - end + pad) * ROW_HEIGHT
	};
};

export const commonListClearElements = (list: CommonListLike, start: number): void => {
	let i = start;
	while (list.elements[i] !== undefined) {
		list.elements[i++] = undefined as never;
	}
};

/**
 * `commonListUpdateHeadAndFoot` 真正需要的东西只有 `elements` 上的窗口游标 ——
 * 它不碰 DOM，也不调 `updateOnResize`。
 *
 * 所以参数用这个**窄契约**，而不是整个 `CommonListLike`：树列表的宿主（`TreeListHost`）
 * 就没有 `updateOnResize`，用宽契约会把「宿主没有的能力」写进契约，
 * 逼着每个调用方绕道 `as unknown as CommonListLike`。
 */
export type HeadAndFootListLike = Pick<CommonListLike, 'elements'>;

export const commonListUpdateHeadAndFoot = (list: HeadAndFootListLike): void => {
	if (list.elements.head) {
		list.elements.head.style.marginTop = '';
		list.elements.head = null;
	}
	if (list.elements.foot) {
		list.elements.foot.style.marginBottom = '';
		list.elements.foot = null;
	}
	const { count, start, end } = list.elements;
	if (count !== 0) {
		// `padded` 不再是元素上的 expando，统一从列表配置读
		const { marginTop, marginBottom } = computeRowMargins(
			count,
			start,
			end,
			!!getListConfig(list).padded
		);
		list.elements.head = list.elements[start];
		list.elements.head!.style.marginTop = `${marginTop}px`;
		list.elements.foot = list.elements[end - 1];
		list.elements.foot!.style.marginBottom = `${marginBottom}px`;
	}
};

export const commonListResize = (list: CommonListLike): void => {
	const el = list;
	const st = el.scrollTop;
	const ch = el.clientHeight;
	const count = list.elements.count;
	if (ch === 0) return;
	if (count === 0) {
		el.textContent = '';
		return;
	}
	const { start, end } = computeVisibleRange(st, ch, count);
	if (list.elements.start !== start || list.elements.end !== end) {
		list.elements.start = start;
		list.elements.end = end;
		commonListUpdateHeadAndFoot(list);
		const versionId = list.elements.versionId++;
		for (let i = start; i < end; i++) {
			const element = list.elements[i];
			versionOf(element).versionId = versionId;
			list.updateOnResize(element);
		}
		const nodes = el.childNodes;
		const last = nodes.length - 1;
		for (let i = last; i >= 0; i--) {
			const element = nodes[i] as HTMLElement & { versionId?: number };
			if (versionOf(element).versionId !== versionId) {
				element.remove();
			}
		}
		if (list.elements.foot && !list.elements.foot.parentNode) {
			el.appendChild(list.elements.foot);
		}
		for (let i = end - 2; i >= start; i--) {
			const element = list.elements[i];
			if (element.parentNode === null) {
				const next = list.elements[i + 1];
				el.insertBefore(element, next);
			}
		}
	}
};
