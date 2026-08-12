import { Variable } from './variable.ts';
import { GUID } from '@/file/guid.ts';

Variable.createId = function (this: typeof Variable) {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.idMap[id]);
	return id;
};

interface VariableNodeShape {
	class?: string;
	id?: string;
	children?: VariableNodeShape[];
}

Variable.register = function (item: unknown) {
	const node = item as VariableNodeShape;
	if (node.class === 'folder') {
		for (const child of node.children!) {
			Variable.register(child);
		}
	} else {
		Variable.idMap[node.id!] = true;
	}
};

Variable.unregister = function (item: unknown) {
	const node = item as VariableNodeShape;
	if (node.class === 'folder') {
		for (const child of node.children!) {
			Variable.unregister(child);
		}
	} else {
		delete Variable.idMap[node.id!];
	}
};

Variable.getVariableById = (function IIFE() {
	interface VariableNode {
		class?: string;
		id?: string;
		children?: VariableNode[];
	}
	const find = (items: VariableNode[], id: string): VariableNode | undefined => {
		const length = items.length;
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.class !== 'folder') {
				if (item.id === id) {
					return item;
				}
			} else {
				const result = find(item.children!, id);
				if (result !== undefined) {
					return result;
				}
			}
		}
		return undefined;
	};
	return function (this: { data: VariableNode[] }, id: string) {
		return find(this.data, id);
	};
})();
