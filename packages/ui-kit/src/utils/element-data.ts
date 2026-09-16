/**
 * 元素数据（P4b 的存储层）：数据挂进 WeakMap，不污染 DOM 元素自身。
 *
 * **为什么在 ui-kit**：ui-kit 的巨石元素工厂（`YMCommandList/command-api.ts`、`YMTreeList/tree-api.ts`）
 * 也大量读写这些字段（`this.start` 等，两个文件合计 164 处），而 ui-kit **不能依赖 editor**——
 * 于是把这份"存储 + 原型访问器"放到 ui-kit，editor 侧保留同路径的**再导出**（`@app/utils/element-data`
 * 继续可用，`main.ts` 的副作用导入仍然生效）。
 *
 * 行为与迁移前完全一致：仍是 69 个字段的 get/set + `getElementData(el)`。
 */
const elementDataMap = new WeakMap<HTMLElement, Record<string, unknown>>();

function getElementDataStore(el: HTMLElement): Record<string, unknown> {
	let data = elementDataMap.get(el);
	if (!data) {
		data = {};
		elementDataMap.set(el, data);
	}
	return data;
}

const DATA_FIELDS = [
	'dataValue',
	'dragging',
	'start',
	'number',
	'selection',
	'decimals',
	'initialized',
	'filter',
	'page',
	'dataItems',
	'head',
	'strBox',
	'parameters',
	'key',
	'folders',
	'target',
	'links',
	'count',
	'direction',
	'end',
	'foot',
	'selections',
	'versionId',
	'origin',
	'active',
	'anchor',
	'inserting',
	'focusing',
	'_initialized',
	'rawScrollLeft',
	'rawScrollTop',
	'expanded',
	'changed',
	'group',
	'item',
	'indent',
	'timer',
	'visible',
	'proxy',
	'relations',
	'mode',
	'info',
	'invalid',
	'varBox',
	'numBox'
] as const;

function defineDataAccessors(): void {
	for (const field of DATA_FIELDS) {
		Object.defineProperty(HTMLElement.prototype, field, {
			configurable: true,
			get(this: HTMLElement) {
				return getElementDataStore(this)[field];
			},
			set(this: HTMLElement, value: unknown) {
				getElementDataStore(this)[field] = value;
			}
		});
	}
}

defineDataAccessors();

export function getElementData(el: HTMLElement): Record<string, unknown> {
	return getElementDataStore(el);
}

/**
 * P4b 的迁移助手：把元素数据**当成给定形状**读（`getElementData` 返回 `Record<string, unknown>`，
 * 直接取字段会拿到 `unknown` 而无法参与运算——P4b 第五刀的负结果就是这么来的）。
 * 传进来的类型必须是"该元素上真实存在的字段形状"（例如 `NodeElement`、`FolderElement`），
 * 迁移时逐个字段把 `el.x` 换成 `elementDataOf<Shape>(el).x`。
 */
export function elementDataOf<T>(el: unknown): T {
	return getElementData(el as HTMLElement) as unknown as T;
}
