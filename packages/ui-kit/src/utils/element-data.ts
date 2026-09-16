/**
 * 元素数据（P4b 的存储层）：数据挂进 WeakMap，不污染 DOM 元素自身。
 *
 * **为什么在 ui-kit**：ui-kit 的巨石元素工厂（`YMCommandList/command-api.ts`、`YMTreeList/tree-api.ts`）
 * 也大量读写这些字段（`this.start` 等，两个文件合计 164 处），而 ui-kit **不能依赖 editor**——
 * 于是把这份"存储 + 原型访问器"放到 ui-kit，editor 侧保留同路径的**再导出**（`@app/utils/element-data`
 * 继续可用，`main.ts` 的副作用导入仍然生效）。
 *
 * 行为与迁移前完全一致：仍是 DATA_FIELDS 所列字段的 get/set + `getElementData(el)`
 * （字段数随 P4b 各刀递减，见 docs/remaining-work.md 的 P4b 小节）。
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
	'filter',
	'dataItems',
	'parameters',
	'key',
	'target',
	'count',
	'direction',
	'end',
	'selections',
	'origin',
	'active',
	'anchor',
	'inserting',
	'focusing',
	'expanded',
	'changed',
	'group',
	'item',
	'indent',
	'visible',
	'mode'
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

/**
 * P4b：元素 API 工厂的"只装配一次"守卫。
 *
 * 20 个 `*-api.ts` 原先都写成 `if (box._initialized) return box;` … `box._initialized = true;`，
 * 靠 `HTMLElement.prototype` 上的 `_initialized` 访问器落到 WeakMap。现在改走这两个 helper，
 * `_initialized` 也从 `DATA_FIELDS` 摘掉——调用点仍然是一行，语义完全相同。
 */
export function isApiAttached(el: unknown): boolean {
	return elementDataOf<{ _initialized?: boolean }>(el)._initialized === true;
}

export function markApiAttached(el: unknown): void {
	elementDataOf<{ _initialized?: boolean }>(el)._initialized = true;
}
