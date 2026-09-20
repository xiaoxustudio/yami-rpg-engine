export type TreeItem = {
	name: string;
	class?: string;
	children?: TreeItem[];
	parent?: TreeItem | null;
	expanded?: boolean;
	id?: string;
	presetId?: string;
	[key: string]: unknown;
};

/**
 * 树形参数的**最小结构契约**（P2b-4，2026-09-20）。
 *
 * `TreeItem` 带 `[key: string]: unknown` 索引签名 —— 它在 `cloneNode`（`node[key]`）与
 * `findItemByProperties`（`item[key]`）里是**承重的**，删不掉。但**接口没有隐式索引签名**，
 * 于是任何以 `interface` 声明的树形数据（`CustomCommandItem[]` / `AnimationMotion[]` /
 * `PluginData[]` / `CommandObject[]` …）都**不能**赋给 `TreeItem[]`。
 *
 * 这就是调用方被迫写 `as unknown as Parameters<typeof TreeList.deleteCaches>[0]`
 * 的**唯一**原因 —— 不是数据形状不对，是索引签名对不上。
 *
 * `createParents` / `deleteCaches` 这两个 API 实际只用「可挂 `parent` / 可枚举 `children`」，
 * 并不需要索引签名。所以参数改用这个结构类型：调用方零断言，且 `TreeItem` 依然可赋进来
 * （有索引签名的类型赋给无索引签名的目标是合法的）。
 *
 * ⚠️ 注意 `children` 显式接受 `null` —— `CustomFolder.children` 就是
 * `CustomCommandItem[] | null`（父/子可以是**不同**类型，所以这里不能写成单个泛型 `<T>`）。
 */
export type TreeShapeNode = {
	children?: TreeShapeNode[] | null;
	parent?: TreeShapeNode | null;
};

export type NodeElement = HTMLElement & {
	item?: TreeItem;
	indent: number;
	changed: boolean;
	textNode?: Text | null;
	folderMark?: HTMLElement | null;
	nodeIcon: HTMLElement;
	markVisible: boolean;
	markIndent: number;
	textIndent: number;
	expanded: boolean;
	extras?: HTMLElement | null;
};

export interface TreeCore {
	createParents: (items: TreeShapeNode[], parent: TreeShapeNode | null) => void;
	deleteCaches: (data: TreeShapeNode[] & { initialized?: unknown }) => void;
	cloneNode: (node: TreeItem) => TreeItem;
	searchNodesAlgorithm: (data: TreeItem[], keyword: RegExp, list: TreeItem[]) => void;
	generateUniqueName: (item: TreeItem) => string;
	findItemByProperties: (
		items: TreeItem[] | null | undefined,
		properties: object
	) => TreeItem | undefined;
	containsItem: (node: unknown, target: TreeItem | null | undefined) => boolean;
}

export function createTreeCore(): TreeCore {
	const parentDescriptor = {
		configurable: true,
		writable: true,
		value: null
	};

	const createParents = (items: TreeShapeNode[], parent: TreeShapeNode | null): void => {
		const length = items.length;
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.parent === undefined) {
				Object.defineProperty(item, 'parent', parentDescriptor);
			}
			item.parent = parent;
			const { children } = item;
			if (children && children.length > 0) {
				createParents(children, item);
			}
		}
	};

	const deleteCaches = (data: TreeShapeNode[] & { initialized?: unknown }): void => {
		const uninstall = (items: TreeShapeNode[]): void => {
			for (const item of items) {
				delete item.parent;
				// `children` 在树形数据里可以是 `null`（`CustomFolder.children` 就是
				// `CustomCommandItem[] | null`），而 `null` **不等于** `undefined` ——
				// 原先写 `!== undefined` 会让 `null` 被送进 `uninstall()`，在
				// `for (const item of items)` 上抛 "TypeError: items is not iterable"。
				// 用真值判断同时收掉 `undefined` / `null` / `[]`（后两者都是空转，
				// 与 `createParents` 的 `if (children && children.length > 0)` 一致）。
				if (item.children) {
					uninstall(item.children);
				}
			}
		};
		uninstall(data);
		delete data.initialized;
	};

	const cloneNode = (node: TreeItem): TreeItem => {
		const copy: Record<string, unknown> = {};
		for (const key of Object.keys(node)) {
			if (key === 'element' || key === 'parent') continue;
			const value = node[key];
			if (value instanceof Array) {
				copy[key] = value.map(cloneNode);
			} else {
				copy[key] = value;
			}
		}
		return copy as TreeItem;
	};

	const searchNodesAlgorithm = (data: TreeItem[], keyword: RegExp, list: TreeItem[]): void => {
		const length = data.length;
		for (let i = 0; i < length; i++) {
			const item = data[i];
			if (keyword.test(item.name)) {
				list.push(item);
			} else if (typeof item.id === 'string' && keyword.test(item.id)) {
				list.push(item);
			} else if (typeof item.presetId === 'string' && keyword.test(item.presetId)) {
				list.push(item);
			}
			const children = item.children;
			if (children instanceof Array) {
				searchNodesAlgorithm(children, keyword, list);
			}
		}
	};

	const generateUniqueName = (item: TreeItem): string => {
		const flags: Record<string, boolean> = {};
		const items = item.parent!.children!;
		for (const sibling of items) {
			flags[sibling.name] = true;
		}
		const name = item.name.replace(/\s\d+$/, '');
		// oxlint-disable-next-line no-constant-condition
		for (let i = 1; true; i++) {
			const newName = `${name} ${i}`;
			if (!flags[newName]) {
				return newName;
			}
		}
	};

	const findItemByProperties = (
		items: TreeItem[] | null | undefined,
		properties: object
	): TreeItem | undefined => {
		const entries = Object.entries(properties);
		const find = (items: TreeItem[] | null | undefined): TreeItem | undefined => {
			if (!items) return undefined;
			const length = items.length;
			for (let i = 0; i < length; i++) {
				const item = items[i];
				let flag = true;
				for (const [key, value] of entries) {
					if (item[key] !== value) {
						flag = false;
						break;
					}
				}
				if (flag) {
					return item;
				}
				if (item.children) {
					const result = find(item.children);
					if (result !== undefined) {
						return result;
					}
				}
			}
			return undefined;
		};
		return find(items);
	};

	const containsItem = (node: unknown, target: TreeItem | null | undefined): boolean => {
		while (target instanceof Object) {
			if (target === node) {
				return true;
			}
			target = target.parent;
		}
		return false;
	};

	return {
		createParents,
		deleteCaches,
		cloneNode,
		searchNodesAlgorithm,
		generateUniqueName,
		findItemByProperties,
		containsItem
	};
}
