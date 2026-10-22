/**
 * 把元素 API 的方法挂到元素上（ui-kit「元素优先」组件契约的装配点）。
 *
 * 调用方必须显式给出 `XxxApi` 类型参数，否则键集合校验失效；少挂几个成员是允许的。
 * 目标可以是任何对象，不限于 `HTMLElement`。
 */
export function attachApi<Api extends object>(target: object, api: Partial<Api>): void {
	const source = api as Record<string, unknown>;
	for (const key of Object.keys(source)) {
		Reflect.set(target, key, source[key]);
	}
}
