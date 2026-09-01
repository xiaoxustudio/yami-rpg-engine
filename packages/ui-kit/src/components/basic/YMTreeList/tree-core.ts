export type TreeItem = {
	name: string;
	class?: string;
	children?: TreeItem[];
	parent?: TreeItem | null;
	element?: NodeElement;
	expanded?: boolean;
	id?: string;
	presetId?: string;
	[key: string]: unknown;
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
	createParents: (items: TreeItem[], parent: TreeItem | null) => void;
	deleteCaches: (data: TreeItem[] & { initialized?: unknown }) => void;
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

	const createParents = (items: TreeItem[], parent: TreeItem | null): void => {
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

	const deleteCaches = (data: TreeItem[] & { initialized?: unknown }): void => {
		const uninstall = (items: TreeItem[]): void => {
			for (const item of items) {
				delete item.element;
				delete item.parent;
				if (item.children !== undefined) {
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
