/**
 * 「动态键」表单的访问器。
 *
 * 命令 schema 里有一类表单是 `reactive<Record<string, unknown>>({})`：键由各命令在运行时决定，
 * 静态拿不到键集合 ⇒ 逐字段访问器（本仓 `stores/*` 常用手法）覆盖不全，会让 `form.任意键` 变 undefined。
 *
 * 这里用一个 **Proxy** 把读写整体转发到 store 切片，保留对象语义：
 * - `form.x` / `form.x = v` / `Object.assign(form, {…})` / `const data = form` / `delete form.x`
 * - 响应性：get/set 落到 store 里那个 `reactive` 对象上，所以模板 v-model 的依赖收集照常工作
 * - `ownKeys` / `getOwnPropertyDescriptor` 让 `{...form}`、`Object.keys(form)` 也成立
 *
 * 传选择器（而不是直接传对象）是为了让每次读写都重新取 store 切片 —— 模块求值期不碰 store，
 * 也就不存在「import 顺序 / 早实例化」的坑。
 */
export function dynamicForm(select: () => Record<string, unknown>): Record<string, unknown> {
	return new Proxy({} as Record<string, unknown>, {
		get: (_target, key) => select()[key as string],
		set: (_target, key, value) => {
			select()[key as string] = value;
			return true;
		},
		has: (_target, key) => key in select(),
		ownKeys: () => Reflect.ownKeys(select()),
		getOwnPropertyDescriptor: (_target, key) => {
			const descriptor = Reflect.getOwnPropertyDescriptor(select(), key);
			return descriptor
				? { ...descriptor, configurable: true, enumerable: true }
				: { configurable: true, enumerable: true, value: undefined, writable: true };
		},
		deleteProperty: (_target, key) => {
			delete select()[key as string];
			return true;
		}
	});
}
