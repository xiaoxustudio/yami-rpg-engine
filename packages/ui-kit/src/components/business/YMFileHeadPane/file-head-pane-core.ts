export interface FileItem {
	name: string;
	parent?: FileItem;
	subfolders: FileItem[];
}

export interface AddressNode {
	id: number;
	type: 'folder' | 'arrow' | 'link' | 'text';
	text?: string;
	file?: FileItem;
	folders?: FileItem[];
	target?: FileItem;
	disabled?: boolean;
}

export interface BuildAddressNodesInput {
	display: string | undefined;
	selections: FileItem[];
	isFolderItem: (obj: unknown) => boolean;
	nextId: () => number;
	searchCount: number;
}

export interface FileHeadPaneCore {
	buildAddressNodes: (input: BuildAddressNodesInput) => AddressNode[];
}

export function createFileHeadPaneCore(): FileHeadPaneCore {
	const buildChain = (
		folder: FileItem,
		isFolderItem: (obj: unknown) => boolean,
		nextId: () => number
	): AddressNode[] => {
		const chain: AddressNode[] = [];
		while (true) {
			chain.push({ id: nextId(), type: 'folder', text: folder.name });
			const { parent } = folder;
			if (isFolderItem(parent)) {
				chain.push({ id: nextId(), type: 'arrow', folders: parent!.subfolders });
				folder = parent!;
			} else {
				break;
			}
		}
		const root = folder;
		for (const node of chain) {
			if (node.type === 'folder') {
				node.file = root;
			} else {
				node.target = root;
			}
		}
		chain[0].disabled = true;
		return chain.reverse();
	};

	const buildLinks = (folders: FileItem[], nextId: () => number): AddressNode[] => {
		const nodes: AddressNode[] = [];
		const length = folders.length;
		for (let i = 0; i < length; i++) {
			const folder = folders[i];
			nodes.push({ id: nextId(), type: 'folder', text: folder.name, file: folder });
			if (folders[i + 1]) {
				nodes.push({ id: nextId(), type: 'link', text: '&' });
			}
		}
		return nodes;
	};

	const buildAddressNodes = (input: BuildAddressNodesInput): AddressNode[] => {
		const { display, selections, isFolderItem, nextId, searchCount } = input;
		switch (display) {
			case 'normal': {
				if (selections.length === 1) {
					return buildChain(selections[0], isFolderItem, nextId);
				}
				if (selections.length > 1) {
					return buildLinks(selections, nextId);
				}
				return [];
			}
			case 'search':
				return [{ id: nextId(), type: 'text', text: `${searchCount} 个文件` }];
			default:
				return [];
		}
	};

	return { buildAddressNodes };
}
