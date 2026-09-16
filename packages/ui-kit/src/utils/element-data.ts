/**
 * 元素数据（P4b 的存储层）：数据挂进 WeakMap，不污染 DOM 元素自身。
 *
 * **终态（2026-09-16，P4b 收口）**：`DATA_FIELDS` 与 `defineDataAccessors()` 已删除——
 * `HTMLElement.prototype` 上不再有任何本仓库安装的访问器，因此"`el.start` / `el.item` / …"
 * 这类隐式读写**不复存在**，所有元素数据都必须经本模块的显式入口读写：
 *
 * - `getElementData(el)`：拿到该元素的原始记录（`Record<string, unknown>`）；
 * - `elementDataOf<T>(el)`：把记录**当成给定形状**读（迁移时的主力写法，见各 `*-api.ts` 的本地视图）；
 * - `elementDataValueOf(el)`：`dataValue` 专用——该字段在仓库里有两种承载者（组件 own 访问器 / 元素数据）。
 *
 * **为什么在 ui-kit**：ui-kit 的巨石元素工厂（`YMCommandList/command-api.ts`、`YMTreeList/tree-api.ts`）
 * 也大量使用元素数据（两个文件合计 300+ 处），而 ui-kit **不能依赖 editor**——于是存储层放在 ui-kit，
 * editor 侧保留同路径的**再导出**（`@app/utils/element-data` 继续可用；`main.ts` 的副作用导入
 * 已随访问器退役一并删除）。
 *
 * 历史见 docs/remaining-work.md 的 P4b 小节（21 刀：83 → 26 → 退役）。
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
 * P4b 的迁移入口：把元素数据**当成给定形状**读（`getElementData` 返回 `Record<string, unknown>`，
 * 直接取字段会拿到 `unknown` 而无法参与运算——P4b 第五刀的负结果就是这么来的）。
 * 传进来的类型必须是"该元素上真实存在的字段形状"（例如 `NodeElement`、`CommandListData`）。
 *
 * 注意：`el` 为 `null`/`undefined` 时会抛 `TypeError: Invalid value used as weak map key`
 * （WeakMap 键必须是非空对象），因此**调用前必须自行判空**——这一点在迁移期反复踩过（见 remaining-work）。
 */
export function elementDataOf<T>(el: unknown): T {
	return getElementData(el as HTMLElement) as unknown as T;
}

/**
 * P4b：读「这个承载者身上的 `dataValue`」——**own 属性优先**（组件自己装的访问器、普通对象夹具），
 * 否则读元素数据。
 *
 * 为什么需要它：`dataValue` 是本仓库唯一一个**同一个字段有两种存储**的字段——选择框一族
 * （`select-box-api` / `YMSelectBox.vue` / `YMColorBox` / `check-box` / `keyboard-box` / `radio-box` /
 * `YMParamList.vue`…）在根元素上装了 own 访问器读写组件内部状态，而列表行元素（命令行、选择列表项、
 * 通用列表项…）用的是元素数据。`el.dataValue` 在访问器时代对两者都成立（own 覆盖原型），退役后就只剩
 * own 那一半 ⇒ 凡是要同时面对"宿主"和"行元素"的代码都必须走这个函数。
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
