import { Data } from '@app/legacy/data/data-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Variable } from './variable.ts';

interface VariableNode {
	class: string;
	name: string;
	id?: string;
	expanded?: boolean;
	children?: VariableNode[];
}

Variable.unpackVariables = (function IIFE() {
	class ReferencedFolder {
		data: VariableNode;
		class: string;
		name: string;
		children: VariableNode[];
		constructor(item: VariableNode) {
			this.data = item;
			this.class = item.class;
			this.name = item.name;
			this.children = clone(item.children!);
		}

		get expanded() {
			return this.data.expanded;
		}

		set expanded(value: boolean | undefined) {
			this.data.expanded = value;
			File.planToSave!(Data.manifest.project.variables);
		}
	}
	const clone = (items: VariableNode[]): Array<VariableNode | ReferencedFolder> => {
		const length = items.length;
		const copies = new Array(length);
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.class !== 'folder') {
				Variable.idMap[item.id!] = true;
				copies[i] = Object.clone(item);
			} else {
				copies[i] = new ReferencedFolder(item);
			}
		}
		return copies;
	};
	return function (this: typeof Variable) {
		this.idMap = {};
		this.data = clone(Data.variables);
	};
})();

interface PackedVariableNode {
	class: string;
	name: string;
	expanded?: boolean;
	children: PackedVariableNode[];
}

Variable.packVariables = (function IIFE() {
	const clone = (items: VariableNode[]): PackedVariableNode[] => {
		const length = items.length;
		const copies: PackedVariableNode[] = new Array(length) as PackedVariableNode[];
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item) as PackedVariableNode;
			} else {
				copies[i] = {
					class: item.class,
					name: item.name,
					expanded: item.expanded,
					children: clone(item.children!)
				};
			}
		}
		return copies;
	};
	return function (this: { data: VariableNode[] }) {
		Data.variables = clone(this.data);
		Data.createVariableMap();
	};
})();
