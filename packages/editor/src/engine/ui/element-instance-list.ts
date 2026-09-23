import { remove as removeFromArray } from '@app/utils/array';

export class UIInstanceList extends Array {
	setProperty(key: string, value: unknown): void {
		const keys = key.split('-');
		const last = keys.length - 1;
		const property = keys[last];
		for (const element of this) {
			let node = element;
			for (let i = 0; i < last; i++) {
				node = node[keys[i]];
			}
			node[property] = value;
		}
	}

	resize(): void {
		for (const element of this) {
			element.resize();
		}
	}

	/**
	 * 把自己从列表里摘掉（`UIElement.destroy()` 用）。
	 *
	 * ⚠️ **2026-09-22 第 117 轮补上 —— 这是一个一直存在、但没人测到的崩溃。**
	 * `element-base.ts` 的 `destroy()` 里一直写着 `node.instances.remove(this)`，
	 * 而本类**从来没有 `remove`** ⇒ 只要 `node` 存在，那一行就抛
	 * `TypeError: node.instances.remove is not a function`。
	 *
	 * 一直没被发现有两个原因，都值得记：
	 * 1. `element-base.ts:16` 把 `instances` **声明**成 `{ remove: (element: unknown) => void }`
	 *    —— **类型在说谎**，于是 `tsc` 认为这个方法一定存在（另一处 `element-page.ts:64`
	 *    又只声明了 `setProperty` / `resize`，两处描述的是同一个对象的不同子集）；
	 * 2. 既有用例 `new Container()` **不带 node**，`destroy()` 在 `if (!node) return;` 就返回了，
	 *    而真实路径（`ui-transform.ts` 的 `deleteElement`、`ui-file.ts` 的
	 *    `context.editor.root!.destroy()`）**一定带 node**。
	 *
	 * 实现直接复用 `@app/utils/array` 的同名自由函数，避免「同一个 indexOf + splice 写两遍」。
	 */
	remove(element: unknown): boolean {
		return removeFromArray(this, element);
	}
}
