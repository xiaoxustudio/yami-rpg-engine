/**
 * 把元素 API 的方法挂到元素上（ui-kit「元素优先」组件契约的装配点）。
 *
 * **P2b-1：泛型化 + 编译期校验键集合。**
 * 调用方显式给出该组件的 `XxxApi`（`attachApi<CustomBoxApi>(box, { … })`），参数类型取
 * `Partial<Api>`，于是：
 *
 * - **键拼错、或挂了一个接口里没有的名字 ⇒ 编译期报错**（对象字面量的多余属性检查）——
 *   这正是过去缺的那一半：旧签名是 `A extends Record<string, unknown>`，等于对键集**不做任何校验**，
 *   写错名字只会安静地挂上一个谁也不读的属性；
 * - **少挂几个是允许的**：接口里的成员未必都由这里装配（有的靠 `Object.defineProperty`、
 *   有的走 HTML 属性、有的在别处补挂），所以不能要求"必须全覆盖"。
 *
 * ⚠️ **新调用点必须写出类型参数**：不写的话 `Api` 会从实参推断，校验随即失效（退化成旧行为）。
 */
export function attachApi<Api extends object>(el: HTMLElement, api: Partial<Api>): void {
	const source = api as Record<string, unknown>;
	for (const key of Object.keys(source)) {
		(el as unknown as Record<string, unknown>)[key] = source[key];
	}
}
