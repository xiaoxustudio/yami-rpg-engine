import {
	clamp,
	addClass,
	removeClass,
	hasClass,
	hide,
	show,
	seek,
	rect,
	hasScrollBar,
	debounce,
	dispatchChangeEvent,
	dispatchUpdateEvent,
	attachDoubleclick
} from '../../../utils/dom';
import { Timer } from '../../../utils/timer';
import {
	commonListClearElements,
	commonListUpdateHeadAndFoot,
	commonListResize
} from '../../../utils/common-list';
import { createDragAndDropHintElement } from '../../business/YMDragAndDropHint/drag-and-drop-hint-api';
export const treeListStatics = {
	createParents: (function IIFE() {
		const descriptor = {
			configurable: true,
			writable: true,
			value: null
		};
		const createParents = (items: any[], parent: any): void => {
			const length = items.length;
			for (let i = 0; i < length; i++) {
				const item = items[i];
				if (item.parent === undefined) {
					Object.defineProperty(item, 'parent', descriptor);
				}
				item.parent = parent;
				const { children } = item;
				if (children?.length > 0) {
					createParents(children, item);
				}
			}
		};
		return function (items: any[], parent: any): void {
			createParents(items, parent);
		};
	})(),

	deleteCaches: (function IIFE() {
		const uninstall = (items: any[]): void => {
			for (const item of items) {
				delete item.element;
				delete item.parent;
				if (item.children !== undefined) {
					uninstall(item.children);
				}
			}
		};
		return function (data: any): void {
			uninstall(data);
			delete data.initialized;
		};
	})(),

	padding: (function IIFE() {
		const padding: any = document.createElement('div');
		addClass(padding, 'box');
		padding.style.display = 'block';
		padding.style.width = '1px';
		return padding;
	})(),

	textBox: (function IIFE() {
		const textBox: any = document.createElement('div');
		addClass(textBox, 'text-box');
		addClass(textBox, 'node-list-text-box');
		const input = document.createElement('input');
		addClass(input, 'text-box-input');
		addClass(input, 'node-list-text-box-input');
		input.type = 'text';
		textBox.appendChild(input);
		textBox.input = input;
		textBox.hiddenNodes = null;
		textBox.lastText = '';

		textBox.read = function (): string {
			return input.value;
		};

		textBox.write = function (value: string): void {
			input.value = value;
		};

		textBox.getFocus = function (mode: string | null): HTMLInputElement {
			input.focus();
			switch (mode) {
				case 'all':
					input.select();
					input.scrollLeft = 0;
					break;
				case 'end':
					input.setSelectionRange(input.value.length, input.value.length);
					input.scrollLeft = input.scrollWidth;
					break;
			}
			return input;
		};

		textBox.fitContent = function (): void {
			const value = input.value;
			const span = document.createElement('span');
			span.style.position = 'absolute';
			span.style.visibility = 'hidden';
			span.style.whiteSpace = 'pre';
			span.textContent = value || ' ';
			document.body.appendChild(span);
			const width = span.getBoundingClientRect().width + 8;
			span.remove();
			input.style.width = `${width}px`;
		};

		textBox.addEventListener('keydown', function (this: any, event: KeyboardEvent) {
			event.stopPropagation();
			switch (event.code) {
				case 'Enter':
				case 'NumpadEnter':
				case 'Escape': {
					const item = this.parentNode as any;
					const list = item.parentNode as any;
					this.input.blur();
					list.focus();
					break;
				}
			}
		});

		textBox.addEventListener('input', function (this: any) {
			this.fitContent();
		});

		textBox.addEventListener('select', (event: Event) => {
			event.stopPropagation();
		});

		textBox.addEventListener('change', (event: Event) => {
			event.stopPropagation();
		});

		input.addEventListener('blur', () => {
			textBox.dispatchEvent(new FocusEvent('blur'));
		});

		textBox.addEventListener('blur', function (this: any) {
			const element = this.parentNode as any;
			const list = element.parentNode as any;
			const item = (element as any).item;
			const name = this.read().trim();
			for (const node of this.hiddenNodes) {
				removeClass(node, 'hidden');
			}
			this.hiddenNodes = null as any;
			this.remove();
			const last = item.name;
			if (last !== name) {
				item.name = name;
				list.updateItemName(item);
				if (list.recordEventEnabled) {
					const record: any = new Event('record');
					const response = {
						type: 'rename',
						item: item,
						oldValue: last,
						newValue: name
					};
					record.value = response;
					list.dispatchEvent(record);
				}
				dispatchChangeEvent(list);
			} else {
				element.textNode.nodeValue = this.lastText;
			}
		});

		return textBox;
	})()
};

export interface TreeListApiOptions {
	getMenuState?: () => string;
}

const cloneNode = (node: any): any => {
	const copy: any = {};
	for (const key of Object.keys(node)) {
		if (key === 'element' || key === 'parent') continue;
		const value = node[key];
		if (value instanceof Array) {
			copy[key] = value.map(cloneNode);
		} else {
			copy[key] = value;
		}
	}
	return copy;
};

export const treeListPrototype: Record<string, (...args: any[]) => any> = {
	bind: function (this: any, getter: any): any {
		return Object.defineProperty(this, 'data', { get: getter });
	},

	read: function (this: any): any {
		const { selections } = this;
		return selections.length === 1 ? selections[0] : null;
	},

	initialize: function (this: any): void {
		const { data } = this;
		if (!data.initialized) {
			treeListStatics.createParents(this.data, this.root);
			Object.defineProperty(data, 'initialized', {
				configurable: true,
				value: true
			});
		}
	},

	update: function (this: any): void {
		const { elements } = this;
		elements.start = -1;
		elements.count = 0;

		this.initialize();

		switch (this.display) {
			case 'normal':
				if (this.data) {
					this.createIndentedItems(this.data, this.root, 0);
				}
				break;
			case 'search':
				if (this.searchResults.length !== 0) {
					this.createFlatItems(this.searchResults);
				}
		}

		commonListClearElements(this, elements.count);

		if (this.updateEventEnabled) {
			dispatchUpdateEvent(this);
		}

		this.resize();
	},

	refresh: function (this: any): void {
		this.deleteNodeElements(this.data);
		this.update();
	},

	resize: function (this: any): any {
		return commonListResize(this);
	},

	updateHeadAndFoot: function (this: any): any {
		return commonListUpdateHeadAndFoot(this);
	},

	updateOnResize: function (this: any, element: any): void {
		if (element.changed) {
			element.changed = false;
			this.updateNodeElement(element);
		}
	},

	createFlatItems: function (this: any, data: any): void {
		const elements = this.elements;
		const length = data.length;
		for (let i = 0; i < length; i++) {
			const item = data[i];
			elements[elements.count++] = this.createNodeElement(item, 0);
		}
	},

	createIndentedItems: function (this: any, data: any, parent: any, indent: any): void {
		const elements = this.elements;
		const length = data.length;
		for (let i = 0; i < length; i++) {
			const item = data[i];
			elements[elements.count++] = this.createNodeElement(item, indent);
			if (item.parent === undefined) {
				throw new Error('No parent!');
			}
			item.parent = parent;
			if (item.expanded && item.children.length !== 0) {
				this.createIndentedItems(item.children, item, indent + 1);
			}
		}
	},

	searchNodes: function (this: any, keyword: any): void {
		const { data } = this;
		if (!data) return;
		if (keyword instanceof RegExp || keyword.length !== 0) {
			if (this.display === 'normal') {
				this.display = 'search';
			}
			if (typeof keyword === 'string') {
				keyword = keyword.replace(/[(){}\\^$*+?.|[\]]/g, '\\$&');
				keyword = new RegExp(keyword, 'i');
			}
			this.searchNodesAlgorithm(data, (this.keyword = keyword), (this.searchResults = []));
		} else {
			if (this.display === 'search') {
				this.display = 'normal';
				this.keyword = null;
				this.searchResults = [];
			}
		}
		this.update();
	},

	searchNodesDebounced: function (this: any, keyword: any): void {
		(this._searchNodesDebounced ??= debounce((kw: any) => this.searchNodes(kw), 150))(keyword);
	},

	searchNodesAlgorithm: function (this: any, data: any, keyword: any, list: any): void {
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
				this.searchNodesAlgorithm(children, keyword, list);
			}
		}
	},

	createNodeElement: function (this: any, item: any, indent: any): any {
		let element = item.element;
		if (element === undefined) {
			element = document.createElement('node-item');
			element.item = item;
			Object.defineProperty(item, 'element', {
				configurable: true,
				value: element
			});

			if (this.selections.includes(item)) {
				addClass(element, 'selected');
			}
		}
		element.indent = indent;
		element.changed = true;
		return element;
	},

	updateNodeElement: function (this: any, element: any): void {
		const { item } = element;
		if (!element.textNode) {
			let folderMark = null;
			let markVisible = false;
			let markIndent = this.foldable ? 16 : 0;
			if (item.children instanceof Array) {
				folderMark = document.createElement('folder-mark');
				markVisible = true;
				markIndent = 0;
				element.appendChild(folderMark);
			}

			const nodeIcon = this.createIcon(item);
			element.appendChild(nodeIcon);

			const textNode = this.createText(item);
			element.appendChild(textNode);

			element.draggable = true;
			element.expanded = false;
			element.markVisible = markVisible;
			element.markIndent = markIndent;
			element.textIndent = 0;
			element.folderMark = folderMark;
			element.nodeIcon = nodeIcon;
			element.textNode = textNode;

			for (const creator of this.creators) {
				creator(item);
			}
		}

		if (item.expanded !== undefined) {
			const markVisible = item.children.length !== 0;
			if (element.markVisible !== markVisible) {
				element.markVisible = markVisible;
				element.folderMark.style.visibility = markVisible ? 'inherit' : 'hidden';
			}

			const expanded = markVisible && item.expanded;
			if (item.class === 'folder') {
				if (element.expanded !== expanded) {
					element.expanded = expanded;
					switch (expanded) {
						case true:
							addClass(element.folderMark, 'expanded');
							addClass(element.nodeIcon, 'expanded');
							break;
						case false:
							removeClass(element.folderMark, 'expanded');
							removeClass(element.nodeIcon, 'expanded');
							break;
					}
				}
			} else {
				if (element.expanded !== expanded) {
					element.expanded = expanded;
					switch (expanded) {
						case true:
							addClass(element.folderMark, 'expanded');
							break;
						case false:
							removeClass(element.folderMark, 'expanded');
							break;
					}
				}
			}
		}

		const textIndent = element.markIndent + element.indent * 12;
		if (element.textIndent !== textIndent) {
			element.textIndent = textIndent;
			element.style.textIndent = `${textIndent}px`;
		}

		for (const updater of this.updaters) {
			updater(item);
		}
	},

	deleteNodeElements: function (this: any, data: any): void {
		const length = data.length;
		for (let i = 0; i < length; i++) {
			const item = data[i];
			if (item.element !== undefined) {
				delete item.element;
			}
			const { children } = item;
			if (children?.length > 0) {
				this.deleteNodeElements(children);
			}
		}
	},

	createIcon: function (this: any, item: any): HTMLElement {
		const icon = document.createElement('node-icon');
		switch (item.class) {
			case 'folder':
				addClass(icon, 'icon-folder');
				break;
			default:
				addClass(icon, 'icon-file');
				break;
		}
		return icon;
	},

	createText: function (this: any, item: any): Text {
		return document.createTextNode(this.parseName(item));
	},

	parseName: function (this: any, item: any): string {
		return item.name;
	},

	updateItemName: function (this: any, item: any): void {
		if (item?.element?.textNode) {
			const element = item.element;
			const text = element.textNode;
			const last = text.nodeValue;
			const name = this.parseName(item);
			text.nodeValue = name;
			if (this.display === 'search') {
				const keyword = this.keyword;
				if (keyword!.test(last) || keyword!.test(name)) {
					this.searchNodes(this.keyword);
				}
			}
		}
	},

	getItemByProperties: function (this: any, properties: any): any {
		const entries = Object.entries(properties);

		const find = (items: any[]): any => {
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
		return find(this.data);
	},

	contain: function (this: any, node: any, target: any): boolean {
		while (target instanceof Object) {
			if (target === node) {
				return true;
			}
			target = target.parent;
		}
		return false;
	},

	renameNode: function (this: any, item: any, newName: any): void {
		if (item) {
			item.name = newName;
			this.updateItemName(item);
		}
	},

	resetItemName: function (this: any, item: any): void {
		if (item) {
			item.name = this.generateCopyName(item);
			this.updateItemName(item);
		}
	},

	generateUniqueName: function (this: any, item: any): string {
		const flags: Record<string, any> = {};
		const items = item.parent.children;
		for (const sibling of items) {
			flags[sibling.name] = true;
		}
		const name = item.name.replace(/\s\d+$/, '');
		for (let i = 1; true; i++) {
			const newName = `${name} ${i}`;
			if (!flags[newName]) {
				return newName;
			}
		}
	},

	duplicate: function (this: any, item: any): void {
		const copy = cloneNode(item);
		copy.name = this.generateUniqueName(item);
		const index = item.parent.children.indexOf(item);
		const next = item.parent.children[index + 1];
		if (next) {
			this.addNodeTo(copy, next, true);
		} else {
			this.addNodeTo(copy, item.parent);
		}
	},

	addNodeTo: function (this: any, sItem: any, dItem: any, insertBefore: any = false): void {
		if (!sItem) {
			return;
		}

		let dList;
		let dIndex;

		const { data } = this;
		if (!dItem) {
			dItem = data;
		}
		if (dItem === data) {
			dList = data;
			dIndex = dList.length;
		} else if (dItem.children && !insertBefore) {
			dList = dItem.children;
			dIndex = dList.length;
		} else {
			dList = dItem.parent.children;
			if (dList instanceof Array) {
				dIndex = dList.indexOf(dItem);
			}
		}
		if (dList) {
			dList.splice(dIndex, 0, sItem);
			this.unselect();

			if (sItem.parent === undefined) {
				treeListStatics.createParents([sItem], null);
			}

			let item = dItem;
			while (item.parent !== undefined) {
				if (item.expanded === false) {
					item.expanded = true;
				}
				item = item.parent;
			}

			if (this.recordEventEnabled) {
				const record: any = new Event('record');
				const response = {
					type: 'create',
					sItem: sItem,
					dItem: dItem,
					insertBefore: insertBefore
				};
				record.value = response;
				this.dispatchEvent(record);
			}

			!sItem.parent && this.onCreate?.(sItem);
			this.update();
			this.select(sItem);
			this.scrollToSelection();
			dispatchChangeEvent(this);
		}
	},

	deleteNode: function (this: any, item: any): void {
		const items = item.parent.children;
		if (items instanceof Array) {
			const index = items.indexOf(item);
			items.splice(index, 1);

			if (this.recordEventEnabled) {
				const record: any = new Event('record');
				const response = {
					type: 'delete',
					items: items,
					index: index,
					item: item
				};
				record.value = response;
				this.dispatchEvent(record);
			}

			this.unselectIn(item);
			this.onDelete?.(item);
			this.update();
			dispatchChangeEvent(this);
		}
	},

	removeItemTo: function (this: any, sItem: any, dItem: any): void {
		if (sItem === dItem || (this.lockDirectory && dItem === this.root)) {
			return;
		}
		const sParent = sItem.parent;
		if (sParent && dItem) {
			const sList = sParent.children;
			const dList = dItem.children;
			const sIndex = sList.indexOf(sItem);
			sList.splice(sIndex, 1);
			const dIndex = dList.length;
			dList.splice(dIndex, 0, sItem);
			if (sList === dList && sIndex === dIndex) {
				return;
			}
			if (dItem.expanded === false) {
				dItem.expanded = true;
			}

			if (this.recordEventEnabled) {
				const record: any = new Event('record');
				const response = {
					type: 'remove',
					item: sItem,
					source: {
						parent: sParent,
						index: sIndex
					},
					destination: {
						parent: dItem,
						index: dIndex
					}
				};
				record.value = response;
				this.dispatchEvent(record);
			}

			this.insertPaddingAndClear();
			this.update();
			this.onRemove?.(sItem);
			this.scrollToSelection();
			dispatchChangeEvent(this);
		}
	},

	removeItemToInsert: function (this: any, sItem: any, dItem: any): void {
		if (sItem === dItem || (this.lockDirectory && dItem.parent === this.root)) {
			return;
		}
		const sParent = sItem.parent;
		const dParent = dItem.parent;
		if (sParent && dParent) {
			const sList = sParent.children;
			const dList = dParent.children;
			const sIndex = sList.indexOf(sItem);
			sList.splice(sIndex, 1);
			const dIndex = dList.indexOf(dItem);
			dList.splice(dIndex, 0, sItem);
			if (sList === dList && sIndex === dIndex) {
				return;
			}

			if (this.recordEventEnabled) {
				const record: any = new Event('record');
				const response = {
					type: 'remove',
					item: sItem,
					source: {
						parent: sParent,
						index: sIndex
					},
					destination: {
						parent: dParent,
						index: dIndex
					}
				};
				record.value = response;
				this.dispatchEvent(record);
			}

			this.insertPaddingAndClear();
			this.update();
			this.onRemove?.(sItem);
			this.scrollToSelection();
			dispatchChangeEvent(this);
		}
	},

	restore: function (this: any, operation: any, response: any): void {
		if (this.display === 'search') {
			this.searchResults = [];
		}
		switch (response.type) {
			case 'rename': {
				const { item, oldValue, newValue } = response;
				if (operation === 'undo') {
					item.name = oldValue;
				} else {
					item.name = newValue;
				}
				this.updateItemName(item);
				this.expandToItem(item);
				if (!this.textContent) {
					this.update();
				}
				this.select(item);
				this.scrollToSelection();
				dispatchChangeEvent(this);
				break;
			}
			case 'create': {
				const { sItem, dItem, insertBefore } = response;
				if (operation === 'undo') {
					const enabled = this.recordEventEnabled;
					this.recordEventEnabled = false;
					this.deleteNode(sItem);
					this.recordEventEnabled = enabled;
				} else {
					const enabled = this.recordEventEnabled;
					this.recordEventEnabled = false;
					this.addNodeTo(sItem, dItem, insertBefore);
					this.recordEventEnabled = enabled;
					this.onResume?.(sItem);
				}
				break;
			}
			case 'delete': {
				const { items, index, item } = response;
				if (operation === 'undo') {
					if (index <= items.length) {
						items.splice(index, 0, item);
						this.unselect();
						this.expandToItem(item, false);
						this.onResume?.(item);
					}
				} else {
					if (index < items.length) {
						items.splice(index, 1);
						this.unselectIn(item);
						this.onDelete?.(item);
					}
				}

				this.update();
				operation === 'undo' && this.select(item);
				this.scrollToSelection();
				dispatchChangeEvent(this);
				break;
			}
			case 'remove': {
				const { item, source, destination } = response;
				const { parent: sParent, index: sIndex } = source;
				const { parent: dParent, index: dIndex } = destination;
				const sList = sParent.children;
				const dList = dParent.children;
				if (operation === 'undo') {
					if (item.parent !== undefined) {
						item.parent = sParent;
					}
					if (sIndex <= sList.length && dIndex < dList.length) {
						dList.splice(dIndex, 1);
						sList.splice(sIndex, 0, item);
						this.expandToItem(item, false);
					}
				} else {
					if (item.parent !== undefined) {
						item.parent = dParent;
					}
					if (dIndex <= dList.length && sIndex < sList.length) {
						sList.splice(sIndex, 1);
						dList.splice(dIndex, 0, item);
						this.expandToItem(item, false);
					}
				}

				this.insertPaddingAndClear();
				this.update();
				this.select(item);
				this.onRemove?.(item);
				this.scrollToSelection();
				dispatchChangeEvent(this);
				break;
			}
		}
	},

	open: function (this: any, item: any): void {
		if (item && this.openEventEnabled) {
			const open: any = new Event('open');
			open.value = item;
			this.dispatchEvent(open);
		}
	},

	select: function (this: any, item: any): void {
		if (item instanceof Object && this.read() !== item) {
			this.unselect();
			this.selections.push(item);
			if (item.element !== undefined) {
				addClass(item.element, 'selected');
			}
			if (this.selectEventEnabled) {
				const select: any = new Event('select');
				select.value = this.read();
				this.dispatchEvent(select);
			}
		}
	},

	selectWithNoEvent: function (this: any, item: any): void {
		const enabled = this.selectEventEnabled;
		this.selectEventEnabled = false;
		this.select(item);
		this.selectEventEnabled = enabled;
	},

	unselect: function (this: any, item?: any): void {
		let selections: any[] = [];
		if (item === undefined) {
			selections = this.selections;
		}
		if (this.selections.includes(item)) {
			selections = [item];
		}
		if (selections.length !== 0) {
			treeListStatics.textBox.input.blur();
			for (const selected of selections) {
				const { element } = selected;
				if (element !== undefined) {
					removeClass(element, 'selected');
				}
			}
			if (this.unselectEventEnabled) {
				const select: any = new Event('unselect');
				select.value = selections;
				this.dispatchEvent(select);
			}
			this.selections = [];
		}
	},

	unselectIn: function (this: any, item: any): void {
		const targets = [];
		for (let target of this.selections) {
			let node = target;
			while (node) {
				if (node === item) {
					targets.push(target);
					break;
				}
				node = node.parent;
			}
		}
		for (const target of targets) {
			this.unselect(target);
		}
	},

	selectRelative: function (this: any, direction: any): void {
		const elements = this.elements;
		const count = elements.count;
		if (count > 0) {
			let index = -1;
			const last = count - 1;
			const selection = this.read();
			if (selection) {
				index = elements.indexOf(selection.element);
			}
			switch (direction) {
				case 'up':
					if (index !== -1) {
						index = Math.max(index - 1, 0);
					} else {
						index = last;
					}
					break;
				case 'down':
					if (index !== -1) {
						index = Math.min(index + 1, last);
					} else {
						index = 0;
					}
					break;
			}
			this.select(elements[index]?.item);
			this.scrollToSelection();
		}
	},

	expandSelection: function (this: any): void {
		const item = this.read();
		if (item !== null && item.expanded !== undefined && item.element !== undefined) {
			item.expanded = !item.expanded;
			this.update();
			dispatchChangeEvent(this);
		}
	},

	expandToSelection: function (this: any, update = true): void {
		const item = this.read();
		if (item !== null) {
			this.expandToItem(item, update);
		}
	},

	expandToItem: function (this: any, item: any, update = true): void {
		item = item.parent;
		if (!item) return;
		let changed = false;
		while (item.expanded !== undefined) {
			if (!item.expanded) {
				item.expanded = true;
				changed = true;
			}
			item = item.parent;
		}
		if (changed && update) {
			this.update();
			dispatchChangeEvent(this);
		}
	},

	scrollToSelection: function (this: any, mode = 'active'): void {
		const selection = this.read();
		if (selection && hasScrollBar(this)) {
			const elements = this.elements;
			const count = elements.count;
			for (let i = 0; i < count; i++) {
				const { item } = elements[i];
				if (item === selection) {
					let scrollTop;
					switch (mode) {
						case 'active':
							scrollTop = clamp(
								this.scrollTop,
								i * 20 + 20 - this.innerHeight,
								i * 20
							);
							break;
						case 'middle':
							scrollTop = Math.round((i * 20 + 10 - this.innerHeight / 2) / 20) * 20;
							break;
						default:
							return;
					}
					if (this.scrollTop !== scrollTop) {
						this.scrollTop = scrollTop;
					}
					break;
				}
			}
		}
	},

	scrollToHome: function (this: any): void {
		const element = this.elements[0];
		if (element instanceof HTMLElement) {
			this.select((element as any).item);
		}
		this.scroll(0, 0);
	},

	scrollToEnd: function (this: any): void {
		const elements = this.elements;
		const index = elements.count - 1;
		const element = elements[index];
		if (element instanceof HTMLElement) {
			this.select((element as any).item);
		}
		this.scroll(0, this.scrollHeight);
	},

	pageUp: function (this: any, select: any): void {
		const scrollLines = Math.floor(this.clientHeight / 20) - 1;
		if (select) {
			const bottom = this.scrollTop + this.clientHeight;
			const bottomIndex = Math.floor(bottom / 20) - 1;
			let index = this.getElementIndexOfSelection(Infinity);
			index = Math.min(index, bottomIndex) - scrollLines;
			index = Math.max(index, 0);
			this.select(this.elements[index]?.item);
		}
		this.scrollBy(0, -scrollLines * 20);
	},

	pageDown: function (this: any, select: any): void {
		const scrollLines = Math.floor(this.clientHeight / 20) - 1;
		if (select) {
			const count = this.elements.count;
			const topIndex = Math.floor(this.scrollTop / 20);
			let index = this.getElementIndexOfSelection(0);
			index = Math.max(index, topIndex) + scrollLines;
			index = Math.min(index, count - 1);
			this.select(this.elements[index]?.item);
		}
		this.scrollBy(0, +scrollLines * 20);
	},

	getElementIndexOfSelection: function (this: any, defIndex: any): number {
		const item = this.read();
		return item ? this.elements.indexOf(item.element) : defIndex;
	},

	rename: function (this: any, item: any): void {
		if (this.renamable) {
			const { element } = item;
			const { textBox } = treeListStatics;
			if (document.activeElement === this && !textBox.parentNode && element.parentNode) {
				const nodes = [];
				const { folderMark, nodeIcon } = element;
				for (const node of element.childNodes) {
					if (
						node instanceof HTMLElement &&
						node !== folderMark &&
						node !== nodeIcon &&
						addClass(node, 'hidden')
					) {
						nodes.push(node);
					}
				}
				textBox.lastText = element.textNode.nodeValue;
				element.textNode.nodeValue = '';
				element.appendChild(textBox);
				textBox.hiddenNodes = nodes;
				textBox.write(item.name);
				textBox.getFocus('all');
				textBox.fitContent();
			}
		}
	},

	cancelRenaming: function (this: any): void {
		const { timer } = this;
		if (timer.target) {
			timer.target = null;
		}
		if (timer.running) {
			timer.running = false;
			timer.remove();
		}
	},

	insertPaddingAndClear: function (this: any): void {
		const padding = treeListStatics.padding;
		let count = this.elements.count;
		if (this.padded) count++;
		if (padding.count !== count) {
			padding.count = count;
			padding.style.height = `${count * 20}px`;
		}
		const head = this.childNodes[0];
		this.insertBefore(padding, head);
		const { childNodes } = this;
		const { length } = childNodes;
		for (let i = length - 1; i > 0; i--) {
			childNodes[i].remove();
		}
	},

	clearElements: function (this: any, start: any): void {
		commonListClearElements(this, start);
	},

	clear: function (this: any): any {
		if (this.display === 'search') {
			this.display = 'normal';
			this.keyword = null;
			this.searchResults = [];
		}
		this.unselect();
		this.textContent = '';
		commonListClearElements(this, 0);
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.updateHeadAndFoot();
		return this;
	},

	on: function (
		this: any,
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		this.addEventListener(type, listener, options);
		switch (type) {
			case 'select':
				this.selectEventEnabled = true;
				break;
			case 'unselect':
				this.unselectEventEnabled = true;
				break;
			case 'record':
				this.recordEventEnabled = true;
				break;
			case 'popup':
				this.popupEventEnabled = true;
				break;
			case 'open':
				this.openEventEnabled = true;
				break;
			case 'update':
				this.updateEventEnabled = true;
				break;
		}
	},

	keydown: function (this: any, event: any): void {
		if (!this.data) {
			return;
		}
		if (event.cmdOrCtrlKey) {
			switch (event.code) {
				case 'ArrowUp':
					this.scrollTop -= 20;
					break;
				case 'ArrowDown':
					this.scrollTop += 20;
					break;
				default:
					return;
			}
			event.stopImmediatePropagation();
		} else if (event.altKey) {
			return;
		} else {
			switch (event.code) {
				case 'Enter':
				case 'NumpadEnter': {
					const item = this.read();
					if (item) {
						event.preventDefault();
						event.stopPropagation();
						this.open(item);
					}
					break;
				}
				case 'Space':
					event.preventDefault();
					return;
				case 'ArrowRight':
					event.preventDefault();
					this.expandSelection();
					break;
				case 'ArrowUp':
					event.preventDefault();
					this.selectRelative('up');
					break;
				case 'ArrowDown':
					event.preventDefault();
					this.selectRelative('down');
					break;
				case 'F2': {
					const item = this.read();
					if (item) {
						this.cancelRenaming();
						this.rename(item);
					}
					break;
				}
				default:
					return;
			}
			event.stopImmediatePropagation();
		}
	},

	pointerdown: function (this: any, event: any): void {
		this.dragend();
		this.cancelRenaming();
		switch (event.button) {
			case 0: {
				const element = event.target;
				if (element.tagName === 'FOLDER-MARK') {
					event.preventDefault();
					const { item } = element.parentNode;
					item.expanded = !item.expanded;
					this.update();
					dispatchChangeEvent(this);
				} else {
					if (element.tagName === 'NODE-ITEM') {
						if (!hasClass(element, 'selected')) {
							this.select((element as any).item);
						} else if (
							this.renamable &&
							this.getMenuState() === 'closed' &&
							document.activeElement === this &&
							event.clientX > (rect(element.nodeIcon)?.right ?? 0)
						) {
							this.timer.target = event.target;
						}
					}
				}
				break;
			}
			case 2: {
				const element = seek(event.target, 'node-item');
				if (element.tagName === 'NODE-ITEM' && !hasClass(element, 'selected')) {
					this.select((element as any).item);
				}
				break;
			}
		}
	},

	pointerup: function (this: any, event: any): void {
		if (this.dragging || !this.data) {
			return;
		}
		switch (event.button) {
			case 0:
				if (document.activeElement === this && this.timer.target === event.target) {
					this.timer.running = true;
					this.timer.elapsed = 0;
					this.timer.add();
				}
				break;
			case 2:
				if (this.popupEventEnabled && document.activeElement === this) {
					const element = seek(event.target, 'node-item');
					if (element.tagName === 'NODE-ITEM' && hasClass(element, 'selected')) {
						const popup: any = new Event('popup');
						popup.value = (element as any).item;
						popup.clientX = event.clientX;
						popup.clientY = event.clientY;
						this.dispatchEvent(popup);
					} else {
						const popup: any = new Event('popup');
						popup.value = null;
						popup.clientX = event.clientX;
						popup.clientY = event.clientY;
						this.dispatchEvent(popup);
					}
				}
				break;
		}
	},

	doubleclick: function (this: any, event: any): void {
		const element = event.target;
		if (element.tagName === 'NODE-ITEM') {
			this.cancelRenaming();
			const item = (element as any).item;
			if (item.class === 'folder') {
				item.expanded = !item.expanded;
				this.update();
				dispatchChangeEvent(this);
			} else {
				this.open(item);
			}
		}
	},

	dragstart: function (this: any, event: any): void {
		if (
			this.removable &&
			!this.dragging &&
			this.display === 'normal' &&
			this.read() !== null &&
			!treeListStatics.textBox.parentNode &&
			(this.lockDirectory === false || this.read().class !== 'folder')
		) {
			this.dragging = event;
			Object.defineProperty(event, 'offsetY', { writable: true });
			event.preventDefault = () => {};
			event.dataTransfer.hideDragImage();
			event.hint = createDragAndDropHintElement();
			addClass(event.hint, 'for-list');
			this.parentNode!.insertBefore(hide(event.hint), this);
			addClass(this, 'dragging');
			this.addEventListener('dragenter', this.dragenter);
			this.addEventListener('dragleave', this.dragleave);
			this.addEventListener('dragover', this.dragover);
			this.addEventListener('drop', this.drop);
		}
	},

	dragend: function (this: any, event?: any): void {
		if (this.dragging) {
			removeClass(this, 'dragging');
			removeClass(this.dragging.hint.target, 'hint');
			(this.parentNode as any).removeChild(this.dragging.hint);
			this.dragging = null;
			this.removeEventListener('dragenter', this.dragenter);
			this.removeEventListener('dragleave', this.dragleave);
			this.removeEventListener('dragover', this.dragover);
			this.removeEventListener('drop', this.drop);
		}
	},

	dragenter: function (this: any, event: any): void {
		if (this.dragging) {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
		}
	},

	dragleave: function (this: any, event: any): void {
		if (this.dragging && !this.contains(event.relatedTarget)) {
			this.dragging.offsetY = -1;
			hide(this.dragging.hint);
		}
	},

	dragover: function (this: any, event: any): void {
		const { dragging } = this;
		if (dragging) {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
			if (dragging.offsetY === event.offsetY) {
				return;
			}
			dragging.offsetY = event.offsetY;
			const element = seek(event.target, 'node-item');
			const hint: any = show(dragging.hint);
			if (element.tagName === 'NODE-ITEM') {
				const sItem = dragging.target.item;
				const dItem = (element as any).item;
				if (this.contain(sItem, dItem)) {
					{
						hide(hint);
						return;
					}
				}

				const offsetY = event.offsetY;
				const position = dItem.children
					? offsetY < 4
						? 'before'
						: offsetY < 16
							? 'into'
							: 'after'
					: offsetY < 10
						? 'before'
						: 'after';
				switch (position) {
					case 'into':
						if (hint.target !== element || hint.position !== position) {
							const r = hint.measure(element);
							removeClass(hint.target, 'hint');
							hint.target = element;
							hint.position = position;
							hint.moveDown().set(r);
							addClass(element, 'hint');
						}
						break;
					case 'before':
						if (hint.target !== element || hint.position !== position) {
							const r = hint.measure(element);
							r.top -= 1;
							r.height = 2;
							removeClass(hint.target, 'hint');
							hint.target = element;
							hint.position = position;
							hint.moveUp().set(r);
						}
						break;
					case 'after':
						if (hint.target !== element || hint.position !== position) {
							const r = hint.measure(element);
							r.top += r.height - 1;
							r.height = 2;
							removeClass(hint.target, 'hint');
							hint.target = element;
							hint.position = position;
							hint.moveUp().set(r);
						}
						break;
				}
			} else {
				const elements = this.elements;
				const index = elements.count - 1;
				const element = elements[index];
				if (
					element !== undefined &&
					(hint.target !== element || hint.position !== 'append')
				) {
					const r = hint.measure(element);
					r.top += r.height - 1;
					r.height = 2;
					removeClass(hint.target, 'hint');
					hint.target = element;
					hint.position = 'append';
					hint.moveUp().set(r);
				}
			}
		}
	},

	drop: function (this: any, event: any): void {
		const { dragging } = this;
		if (!dragging) {
			return;
		}
		event.stopPropagation();
		const hint = dragging.hint;
		if (!hasClass(hint, 'hidden')) {
			const sItem = dragging.target.item;
			const dItem = hint.target.item;
			if (hint.position !== 'append' && this.contain(sItem, dItem)) {
				return;
			}
			switch (hint.position) {
				case 'into':
					this.removeItemTo(sItem, dItem);
					break;
				case 'before':
					this.removeItemToInsert(sItem, dItem);
					break;
				case 'after':
				case 'append': {
					const elements = this.elements;
					const index = elements.indexOf(hint.target);
					const next = elements[index + 1]?.item;
					if (next) {
						this.removeItemToInsert(sItem, next);
					} else {
						this.removeItemTo(sItem, this.root);
					}
					break;
				}
			}
		}

		this.dragend();
	},

	dataChange: function (this: any, event: any): void {
		if (this.display === 'search') {
			this.searchNodes(this.keyword);
		}
	}
};

export function createTreeListApi(el: HTMLElement, options?: TreeListApiOptions): HTMLElement {
	const list = el as any;
	const getMenuState = options?.getMenuState ?? (() => 'closed');
	list.getMenuState = getMenuState;

	for (const name of Object.keys(treeListPrototype)) {
		list[name] = treeListPrototype[name];
	}

	list._initialized = false;
	list.display = 'normal';
	list.keyword = null;
	list.searchResults = [];
	list.creators = [];
	list.updaters = [];
	const elements: any = [];
	elements.versionId = 0;
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;
	elements.head = null;
	elements.foot = null;
	list.elements = elements;
	list.root = Object.defineProperty({}, 'children', {
		get: () => list.data
	});
	list.timer = new Timer({
		duration: 500,
		callback: (timer: any) => {
			const item = list.read();
			if (item instanceof Object) {
				const target = timer.target;
				const element = item.element;
				if (element.contains(target)) {
					list.rename(item);
				}
			}
			timer.target = null;
			timer.running = false;
		}
	});
	list.selections = [];
	list.dragging = null;
	list.padded = el.hasAttribute('padded');
	list.removable = false;
	list.renamable = false;
	list.foldable = true;
	list.lockDirectory = false;
	list.multipleSelect = false;
	list.selectEventEnabled = false;
	list.unselectEventEnabled = false;
	list.recordEventEnabled = false;
	list.popupEventEnabled = false;
	list.openEventEnabled = false;
	list.updateEventEnabled = false;
	list.tabIndex = 0;

	list.addEventListener('scroll', list.resize);
	list.addEventListener('keydown', list.keydown);
	list.addEventListener('pointerdown', list.pointerdown);
	list.addEventListener('pointerup', list.pointerup);
	attachDoubleclick(list, list.doubleclick);
	list.addEventListener('dragstart', list.dragstart);
	list.addEventListener('dragend', list.dragend);
	list.addEventListener('change', list.dataChange);

	return el;
}

export function createTreeListElement(options?: TreeListApiOptions): HTMLElement {
	const el = document.createElement('div');
	el.classList.add('tree-list');
	createTreeListApi(el, options);
	return el;
}
