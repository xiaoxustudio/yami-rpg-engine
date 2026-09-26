/**
 * 元素数据的存储层：数据挂进 WeakMap，不污染 DOM 元素自身。
 *
 * **不安装原型访问器**：`HTMLElement.prototype` 上没有任何本仓库安装的访问器，因此
 * "`el.start` / `el.item` / …"这类隐式读写**不可用**（`DATA_FIELDS` 与 `defineDataAccessors()`
 * 已退役），所有元素数据都必须经本模块的显式入口读写：
 *
 * - `getElementData(el)`：拿到该元素的原始记录（`Record<string, unknown>`）；
 * - `elementDataOf<T>(el)`：把记录**当成给定形状**读（各 `*-api.ts` 的本地视图都靠它）；
 * - `elementDataValueOf(el)`：`dataValue` 专用——该字段在仓库里有两种承载者（组件 own 访问器 / 元素数据）。
 *
 * **为什么在 ui-kit**：ui-kit 的巨石元素工厂（`YMCommandList/command-api.ts`、`YMTreeList/tree-api.ts`）
 * 也大量使用元素数据（两个文件合计 300+ 处），而 ui-kit **不能依赖 editor**——于是存储层放在 ui-kit，
 * editor 侧保留同路径的**再导出**（`@app/utils/element-data` 继续可用）。
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

export function getElementData(el: HTMLElement): Record<string, unknown> {
	return getElementDataStore(el);
}

/**
 * 把元素数据**当成给定形状**读（`getElementData` 返回 `Record<string, unknown>`，
 * 直接取字段会拿到 `unknown` 而无法参与运算——所以必须按字段给出准确类型）。
 * 传进来的类型必须是"该元素上真实存在的字段形状"（例如 `NodeElement`、`CommandListData`）。
 *
 * 注意：`el` 为 `null`/`undefined` 时会抛 `TypeError: Invalid value used as weak map key`
 * （WeakMap 键必须是非空对象），因此**调用前必须自行判空**。
 */
export function elementDataOf<T>(el: unknown): T {
	return getElementData(el as HTMLElement) as T;
}

/**
 * 读「这个承载者身上的 `dataValue`」——**own 属性优先**（组件自己装的访问器、普通对象夹具），
 * 否则读元素数据。
 *
 * 为什么需要它：`dataValue` 是本仓库唯一一个**同一个字段有两种存储**的字段——选择框一族
 * （`select-box-api` / `YMSelectBox.vue` / `YMColorBox` / `check-box` / `keyboard-box` / `radio-box` /
 * `YMParamList.vue`…）在根元素上装了 own 访问器读写组件内部状态，而列表行元素（命令行、选择列表项、
 * 通用列表项…）用的是元素数据。`el.dataValue` 只覆盖 own 那一半 ⇒ 凡是要同时面对"宿主"和"行元素"
 * 的代码都必须走这个函数。
 */
export function elementDataValueOf(el: unknown): unknown {
	if (el === null || typeof el !== 'object') return undefined;
	if (Object.prototype.hasOwnProperty.call(el, 'dataValue')) {
		return (el as { dataValue?: unknown }).dataValue;
	}
	return el instanceof HTMLElement
		? elementDataOf<{ dataValue?: unknown }>(el).dataValue
		: undefined;
}

/**
 * 元素 API 工厂的"只装配一次"守卫。
 *
 * `*-api.ts` 里写成 `if (isApiAttached(box)) return box;` … `markApiAttached(box);`——
 * `_initialized` 存在元素数据里，不占用元素自身的属性。
 */
export function isApiAttached(el: unknown): boolean {
	return elementDataOf<{ _initialized?: boolean }>(el)._initialized === true;
}

export function markApiAttached(el: unknown): void {
	elementDataOf<{ _initialized?: boolean }>(el)._initialized = true;
}
