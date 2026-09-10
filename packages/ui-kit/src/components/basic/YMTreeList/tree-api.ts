/* oxlint-disable eslint/no-restricted-properties */
import { h, render } from 'vue';
import { attachApi } from '../../../utils/attach-api';
import { getListConfig } from '../../../utils/list-config';
import {
	hideDragImage,
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
	type CommonListLike,
	commonListClearElements,
	commonListUpdateHeadAndFoot,
	commonListResize
} from '../../../utils/common-list';
import {
	createDragAndDropHintElement,
	type DragAndDropHintApi
} from '../../business/YMDragAndDropHint/drag-and-drop-hint-api';
import { createTreeCore, type NodeElement, type TreeItem } from './tree-core';
import {
	createTreeRenderState,
	flattenRows,
	computeWindow,
	setItemClass,
	bindRowElement,
	ROW_HEIGHT,
	type TreeRenderState
} from './tree-render';

const treeCore = createTreeCore();

// 步骤 2 渲染开关（docs/tree-list-vfor-plan.md）：默认沿用命令式渲染，
// 打开后行由 YMTreeList.vue 的 v-for 渲染（数据派生 + 虚拟窗口 + element 回写桥）。
let vueRowRender = true;

export const isVueRowRenderEnabled = (): boolean => vueRowRender;

export const setVueRowRenderEnabled = (enabled: boolean): void => {
	vueRowRender = enabled;
};

// oxlint-disable-next-line no-explicit-any
const renderStateOf = (list: any): TreeRenderState | undefined => list?.renderState;

const isSSR = typeof document === 'undefined';

const renderElement = (vnode: ReturnType<typeof h>): HTMLElement => {
	const host = isSSR ? (null as unknown as HTMLDivElement) : document.createElement('div');
	render(vnode, host);
	const element = host.firstElementChild as HTMLElement;
	host.removeChild(element);
	return element;
};

type TextBox = HTMLDivElement & {
	input: HTMLInputElement;
	hiddenNodes: HTMLElement[] | null;
	lastText: string;
	read: () => string;
	write: (value: string) => void;
	getFocus: (mode: string | null) => HTMLInputElement;
	fitContent: () => void;
};

export const treeListStatics = {
	createParents: (items: TreeItem[], parent: TreeItem | null): void => {
		treeCore.createParents(items, parent);
	},

	deleteCaches: (data: TreeItem[] & { initialized?: unknown }): void => {
		treeCore.deleteCaches(data);
	},

	padding: (function IIFE() {
		if (isSSR) {
			return null as unknown as HTMLDivElement & { count?: number };
		}
		const padding: HTMLDivElement & { count?: number } = document.createElement('div');
		addClass(padding, 'box');
		padding.style.display = 'block';
		padding.style.width = '1px';
		return padding;
	})(),

	textBox: (function IIFE() {
		if (isSSR) {
			return null as unknown as TextBox;
		}
		const textBox = document.createElement('div') as TextBox;
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

		textBox.addEventListener('keydown', function (this: HTMLElement, event: KeyboardEvent) {
			event.stopPropagation();
			switch (event.code) {
				case 'Enter':
				case 'NumpadEnter':
				case 'Escape': {
					const item = this.parentNode as HTMLElement & { parentNode: HTMLElement };
					const list = item.parentNode;
					(this as HTMLDivElement & { input: HTMLInputElement }).input.blur();
					list.focus();
					break;
				}
			}
		});

		textBox.addEventListener(
			'input',
			function (this: HTMLDivElement & { fitContent: () => void }) {
				this.fitContent();
			}
		);

		textBox.addEventListener('select', (event: Event) => {
			event.stopPropagation();
		});

		textBox.addEventListener('change', (event: Event) => {
			event.stopPropagation();
		});

		input.addEventListener('blur', () => {
			textBox.dispatchEvent(new FocusEvent('blur'));
		});

		// oxlint-disable-next-line no-explicit-any
		textBox.addEventListener('blur', function (this: any) {
			const element = this.parentNode;
			const list = element.parentNode;
			const item = element.item;
			const name = this.read().trim();
			for (const node of this.hiddenNodes) {
				removeClass(node, 'hidden');
			}
			this.hiddenNodes = null;
			this.remove();
			const last = item.name;
			if (last !== name) {
				item.name = name;
				list.updateItemName(item);
				if (list.recordEventEnabled) {
					const record: ValueEvent = new Event('record') as ValueEvent;
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
	renderNodeExtras?: (item: TreeItem, container: HTMLElement) => void;
	renderNodeIcon?: (item: TreeItem, container: HTMLElement) => void;
}

type NodeItemElement = HTMLElement & {
	item?: TreeItem;
};

type ValueEvent = Event & { value: unknown };

type PopupEvent = Event & { value: unknown; clientX: number; clientY: number };

type TreeListDragEvent = DragEvent & {
	offsetY?: number;
	hint?: DragAndDropHintApi;
};

// oxlint-disable-next-line no-explicit-any
export const treeListPrototype: Record<string, (...args: any[]) => any> = {
	bind: function (
		this: HTMLElement & { [k: string]: unknown },
		getter: () => TreeItem[]
	): HTMLElement {
		return Object.defineProperty(this, 'data', { get: getter });
	},

	read: function (this: HTMLElement & { [k: string]: unknown }): TreeItem | null {
		const selections = this.selections as TreeItem[];
		return selections.length === 1 ? selections[0] : null;
	},

	initialize: function (this: HTMLElement & { [k: string]: unknown }): void {
		const data = this.data as TreeItem[] & { initialized?: unknown };
		if (data && !data.initialized) {
			treeListStatics.createParents(data, this.root as TreeItem | null);
			Object.defineProperty(data, 'initialized', {
				configurable: true,
				value: true
			});
		}
	},

	// oxlint-disable-next-line no-explicit-any
	update: function (this: any): void {
		if (this.renderState !== undefined) {
			this.syncRenderRows();
			if (this.updateEventEnabled) {
				dispatchUpdateEvent(this);
			}
			return;
		}
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

	// oxlint-disable-next-line no-explicit-any
	refresh: function (this: any): void {
		this.deleteNodeElements(this.data);
		this.update();
	},

	resize: function (this: HTMLElement & { [k: string]: unknown }): void {
		if (renderStateOf(this) !== undefined) {
			(this as unknown as { syncElementsShim: () => void }).syncElementsShim();
			return;
		}
		return commonListResize(this as unknown as CommonListLike);
	},

	updateHeadAndFoot: function (this: HTMLElement & { [k: string]: unknown }): void {
		return commonListUpdateHeadAndFoot(this as unknown as CommonListLike);
	},

	// oxlint-disable-next-line no-explicit-any
	updateOnResize: function (this: any, element: NodeElement): void {
		if (element.changed) {
			element.changed = false;
			this.updateNodeElement(element);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	createFlatItems: function (this: any, data: TreeItem[]): void {
		const elements = this.elements;
		const length = data.length;
		for (let i = 0; i < length; i++) {
			const item = data[i];
			elements[elements.count++] = this.createNodeElement(item, 0);
		}
	},

	createIndentedItems: function (
		// oxlint-disable-next-line no-explicit-any
		this: any,
		data: TreeItem[],
		parent: TreeItem | null,
		indent: number
	): void {
		const elements = this.elements;
		const length = data.length;
		for (let i = 0; i < length; i++) {
			const item = data[i];
			elements[elements.count++] = this.createNodeElement(item, indent);
			if (item.parent === undefined) {
				throw new Error('No parent!');
			}
			item.parent = parent;
			if (item.expanded && item.children!.length !== 0) {
				this.createIndentedItems(item.children!, item, indent + 1);
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	searchNodes: function (this: any, keyword: string | RegExp): void {
		const { data } = this;
		if (!data) return;
		if (keyword instanceof RegExp || (keyword as string).length !== 0) {
			if (this.display === 'normal') {
				this.display = 'search';
			}
			if (typeof keyword === 'string') {
				keyword = keyword.replace(/[(){}\\^$*+?.|[\]]/g, '\\$&');
				keyword = new RegExp(keyword, 'i');
			}
			this.searchNodesAlgorithm(
				data,
				(this.keyword = keyword) as RegExp,
				(this.searchResults = [])
			);
		} else {
			if (this.display === 'search') {
				this.display = 'normal';
				this.keyword = null;
				this.searchResults = [];
			}
		}
		this.update();
	},

	// oxlint-disable-next-line no-explicit-any
	searchNodesDebounced: function (this: any, keyword: string | RegExp): void {
		(this._searchNodesDebounced ??= debounce(
			(kw: string | RegExp) => this.searchNodes(kw),
			150
		))(keyword);
	},

	searchNodesAlgorithm: function (
		// oxlint-disable-next-line no-explicit-any
		this: any,
		data: TreeItem[],
		keyword: RegExp,
		list: TreeItem[]
	): void {
		treeCore.searchNodesAlgorithm(data, keyword, list);
	},

	createNodeElement: function (
		this: HTMLElement & { [k: string]: unknown },
		item: TreeItem,
		indent: number
	): NodeElement {
		let element: NodeElement | undefined = item.element;
		if (element === undefined) {
			element = document.createElement('div') as unknown as NodeElement;
			addClass(element, 'node-item');
			element.item = item;
			Object.defineProperty(item, 'element', {
				configurable: true,
				value: element
			});

			if ((this.selections as (TreeItem | undefined)[]).includes(item)) {
				addClass(element, 'selected');
			}
		}
		element.indent = indent;
		element.changed = true;
		return element;
	},

	// oxlint-disable-next-line no-explicit-any
	updateNodeElement: function (this: any, element: NodeElement): void {
		const { item } = element;
		if (!element.textNode) {
			let folderMark = null;
			let markVisible = false;
			let markIndent = getListConfig(this).foldable ? 16 : 0;
			if (item!.children instanceof Array) {
				folderMark = renderElement(h('span', { class: 'folder-mark' }));
				markVisible = true;
				markIndent = 0;
				element.appendChild(folderMark);
			}

			let nodeIcon: HTMLElement;
			if (typeof this.renderNodeIcon === 'function') {
				nodeIcon = document.createElement('div');
				addClass(nodeIcon, 'tree-node-icon');
			} else {
				nodeIcon = this.createIcon(item!);
			}
			element.appendChild(nodeIcon);

			const textNode = this.createText(item!);
			element.appendChild(textNode);

			element.draggable = true;
			element.expanded = false;
			element.markVisible = markVisible;
			element.markIndent = markIndent;
			element.textIndent = 0;
			element.folderMark = folderMark;
			element.nodeIcon = nodeIcon;
			element.textNode = textNode;

			for (const creator of getListConfig(this).creators) {
				creator(item!);
			}

			if (typeof this.renderNodeExtras === 'function') {
				const extras = document.createElement('div');
				addClass(extras, 'tree-node-extras');
				element.appendChild(extras);
				element.extras = extras;
			}
		}

		if (item!.expanded !== undefined) {
			const markVisible = item!.children!.length !== 0;
			if (element.markVisible !== markVisible) {
				element.markVisible = markVisible;
				element.folderMark!.style.visibility = markVisible ? 'inherit' : 'hidden';
			}

			const expanded = markVisible && item!.expanded;
			if (item!.class === 'folder') {
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

		for (const updater of getListConfig(this).updaters) {
			updater(item);
		}

		if (element.extras && typeof this.renderNodeExtras === 'function') {
			this.renderNodeExtras(item!, element.extras);
		}

		if (typeof this.renderNodeIcon === 'function') {
			this.renderNodeIcon(item!, element.nodeIcon);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	deleteNodeElements: function (this: any, data: TreeItem[]): void {
		const length = data.length;
		for (let i = 0; i < length; i++) {
			const item = data[i];
			if (item.element !== undefined) {
				delete item.element;
			}
			const { children } = item;
			if (children && children.length > 0) {
				this.deleteNodeElements(children);
			}
		}
	},

	createIcon: function (
		this: HTMLElement & { [k: string]: unknown },
		item: TreeItem
	): HTMLElement {
		const icon = renderElement(
			h('span', {
				class: ['node-icon', item.class === 'folder' ? 'icon-folder' : 'icon-file']
			})
		);
		return icon;
	},

	// oxlint-disable-next-line no-explicit-any
	createText: function (this: any, item: TreeItem): Text {
		return document.createTextNode(this.parseName(item));
	},

	parseName: function (this: HTMLElement & { [k: string]: unknown }, item: TreeItem): string {
		return item.name;
	},

	// oxlint-disable-next-line no-explicit-any
	updateItemName: function (this: any, item: TreeItem): void {
		if (item?.element?.textNode) {
			const element = item.element;
			const text = element.textNode!;
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

	getItemByProperties: function (
		this: HTMLElement & { [k: string]: unknown },
		properties: object
	): TreeItem | undefined {
		return treeCore.findItemByProperties(this.data as TreeItem[], properties);
	},

	contain: function (
		this: HTMLElement & { [k: string]: unknown },
		node: unknown,
		target: TreeItem | null | undefined
	): boolean {
		return treeCore.containsItem(node, target);
	},

	// oxlint-disable-next-line no-explicit-any
	renameNode: function (this: any, item: TreeItem | null, newName: string): void {
		if (item) {
			item.name = newName;
			this.updateItemName(item);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	resetItemName: function (this: any, item: TreeItem | null): void {
		if (item) {
			item.name = this.generateCopyName(item);
			this.updateItemName(item);
		}
	},

	generateUniqueName: function (
		this: HTMLElement & { [k: string]: unknown },
		item: TreeItem
	): string {
		return treeCore.generateUniqueName(item);
	},

	// oxlint-disable-next-line no-explicit-any
	duplicate: function (this: any, item: TreeItem): void {
		const copy = treeCore.cloneNode(item);
		copy.name = this.generateUniqueName(item);
		const index = item.parent!.children!.indexOf(item);
		const next = item.parent!.children![index + 1];
		if (next) {
			this.addNodeTo(copy, next, true);
		} else {
			this.addNodeTo(copy, item.parent);
		}
	},

	addNodeTo: function (
		// oxlint-disable-next-line no-explicit-any
		this: any,
		sItem: TreeItem,
		dItem: TreeItem | null | undefined,
		insertBefore: boolean = false
	): void {
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
		} else if (dItem!.children && !insertBefore) {
			dList = dItem!.children;
			dIndex = dList.length;
		} else {
			dList = dItem!.parent!.children;
			if (dList instanceof Array) {
				dIndex = dList.indexOf(dItem!);
			}
		}
		if (dList) {
			dList.splice(dIndex, 0, sItem);
			// 步骤 2：unselect() 会触发派生重算，新节点必须先把 parent 建好（否则派生抛 No parent!）
			if (sItem.parent === undefined) {
				treeListStatics.createParents([sItem], null);
			}
			this.unselect();

			let item = dItem!;
			while (item.parent !== undefined) {
				if (item.expanded === false) {
					item.expanded = true;
				}
				item = item.parent!;
			}

			if (this.recordEventEnabled) {
				const record: ValueEvent = new Event('record') as ValueEvent;
				const response = {
					type: 'create',
					sItem: sItem,
					dItem: dItem,
					insertBefore: insertBefore
				};
				record.value = response;
				this.dispatchEvent(record);
			}

			if (!sItem.parent) getListConfig(this).onCreate?.(sItem);
			this.update();
			this.select(sItem);
			this.scrollToSelection();
			dispatchChangeEvent(this);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	deleteNode: function (this: any, item: TreeItem): void {
		const items = item.parent!.children!;
		if (items instanceof Array) {
			const index = items.indexOf(item);
			items.splice(index, 1);

			if (this.recordEventEnabled) {
				const record: ValueEvent = new Event('record') as ValueEvent;
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
			getListConfig(this).onDelete?.(item);
			this.update();
			dispatchChangeEvent(this);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	removeItemTo: function (this: any, sItem: TreeItem, dItem: TreeItem | null | undefined): void {
		if (sItem === dItem || (getListConfig(this).lockDirectory && dItem === this.root)) {
			return;
		}
		const sParent = sItem.parent;
		if (sParent && dItem) {
			const sList = sParent.children!;
			const dList = dItem.children!;
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
				const record: ValueEvent = new Event('record') as ValueEvent;
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
			getListConfig(this).onRemove?.(sItem);
			this.scrollToSelection();
			dispatchChangeEvent(this);
		}
	},

	removeItemToInsert: function (
		// oxlint-disable-next-line no-explicit-any
		this: any,
		sItem: TreeItem,
		dItem: TreeItem | null | undefined
	): void {
		if (sItem === dItem || (getListConfig(this).lockDirectory && dItem!.parent === this.root)) {
			return;
		}
		const sParent = sItem.parent;
		const dParent = dItem!.parent;
		if (sParent && dParent) {
			const sList = sParent.children!;
			const dList = dParent.children!;
			const sIndex = sList.indexOf(sItem);
			sList.splice(sIndex, 1);
			const dIndex = dList.indexOf(dItem!);
			dList.splice(dIndex, 0, sItem);
			if (sList === dList && sIndex === dIndex) {
				return;
			}

			if (this.recordEventEnabled) {
				const record: ValueEvent = new Event('record') as ValueEvent;
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
			getListConfig(this).onRemove?.(sItem);
			this.scrollToSelection();
			dispatchChangeEvent(this);
		}
	},

	restore: function (
		// oxlint-disable-next-line no-explicit-any
		this: any,
		operation: string,
		response: { type: string; [k: string]: unknown }
	): void {
		if (this.display === 'search') {
			this.searchResults = [];
		}
		switch (response.type) {
			case 'rename': {
				const { item, oldValue, newValue } = response as unknown as {
					item: TreeItem;
					oldValue: string;
					newValue: string;
				};
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
				const { sItem, dItem, insertBefore } = response as unknown as {
					sItem: TreeItem;
					dItem: TreeItem | null | undefined;
					insertBefore: boolean;
				};
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
					getListConfig(this).onResume?.(sItem);
				}
				break;
			}
			case 'delete': {
				const { items, index, item } = response as unknown as {
					items: TreeItem[];
					index: number;
					item: TreeItem;
				};
				if (operation === 'undo') {
					if (index <= items.length) {
						items.splice(index, 0, item);
						this.unselect();
						this.expandToItem(item, false);
						getListConfig(this).onResume?.(item);
					}
				} else {
					if (index < items.length) {
						items.splice(index, 1);
						this.unselectIn(item);
						getListConfig(this).onDelete?.(item);
					}
				}

				this.update();
				if (operation === 'undo') this.select(item);
				this.scrollToSelection();
				dispatchChangeEvent(this);
				break;
			}
			case 'remove': {
				const { item, source, destination } = response as unknown as {
					item: TreeItem;
					source: { parent: TreeItem; index: number };
					destination: { parent: TreeItem; index: number };
				};
				const { parent: sParent, index: sIndex } = source;
				const { parent: dParent, index: dIndex } = destination;
				const sList = sParent.children!;
				const dList = dParent.children!;
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
				getListConfig(this).onRemove?.(item);
				this.scrollToSelection();
				dispatchChangeEvent(this);
				break;
			}
		}
	},

	open: function (
		this: HTMLElement & { [k: string]: unknown },
		item: TreeItem | null | undefined
	): void {
		if (item && this.openEventEnabled) {
			const open: ValueEvent = new Event('open') as ValueEvent;
			open.value = item;
			this.dispatchEvent(open);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	select: function (this: any, item: TreeItem | null | undefined): void {
		if (item instanceof Object && this.read() !== item) {
			this.unselect();
			this.selections.push(item);
			if (item.element !== undefined) {
				addClass(item.element, 'selected');
			}
			// 步骤 2：行 class 由数据派生，选中变化需刷新派生行
			if (this.renderState !== undefined) this.syncRenderRows();
			if (this.selectEventEnabled) {
				const select: ValueEvent = new Event('select') as ValueEvent;
				select.value = this.read();
				this.dispatchEvent(select);
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	selectWithNoEvent: function (this: any, item: TreeItem | null | undefined): void {
		const enabled = this.selectEventEnabled;
		this.selectEventEnabled = false;
		this.select(item);
		this.selectEventEnabled = enabled;
	},

	unselect: function (this: HTMLElement & { [k: string]: unknown }, item?: TreeItem): void {
		let selections: TreeItem[] = [];
		if (item === undefined) {
			selections = this.selections as TreeItem[];
		}
		if ((this.selections as (TreeItem | undefined)[]).includes(item)) {
			selections = [item!];
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
				const select: ValueEvent = new Event('unselect') as ValueEvent;
				select.value = selections;
				this.dispatchEvent(select);
			}
			this.selections = [];
			if (this.renderState !== undefined) {
				(this as unknown as { syncRenderRows: () => void }).syncRenderRows();
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	unselectIn: function (this: any, item: TreeItem): void {
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

	// oxlint-disable-next-line no-explicit-any
	selectRelative: function (this: any, direction: string): void {
		const vueRows = this.renderState !== undefined;
		const rows: { item: TreeItem }[] | null = vueRows ? this.renderState.rows.value : null;
		const elements = this.elements;
		const count = vueRows ? rows!.length : elements.count;
		if (count > 0) {
			let index = -1;
			const last = count - 1;
			const selection = this.read();
			if (selection) {
				index = vueRows
					? this.rowIndexOf(selection)
					: (elements.indexOf(selection.element) as number);
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
			this.select(vueRows ? rows![index]?.item : elements[index]?.item);
			this.scrollToSelection();
		}
	},

	// oxlint-disable-next-line no-explicit-any
	expandSelection: function (this: any): void {
		const item = this.read();
		if (item !== null && item.expanded !== undefined && item.element !== undefined) {
			item.expanded = !item.expanded;
			this.update();
			dispatchChangeEvent(this);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	expandToSelection: function (this: any, update = true): void {
		const item = this.read();
		if (item !== null) {
			this.expandToItem(item, update);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	expandToItem: function (this: any, item: TreeItem | null | undefined, update = true): void {
		item = item!.parent!;
		if (!item) return;
		let changed = false;
		while (item.expanded !== undefined) {
			if (!item.expanded) {
				item.expanded = true;
				changed = true;
			}
			item = item.parent!;
		}
		if (changed && update) {
			this.update();
			dispatchChangeEvent(this);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	scrollToSelection: function (this: any, mode = 'active'): void {
		const selection = this.read();
		if (selection && hasScrollBar(this)) {
			const elements = this.elements;
			const vueRows = this.renderState !== undefined;
			const count = vueRows ? this.renderState.rows.value.length : elements.count;
			let found = -1;
			for (let i = 0; i < count; i++) {
				const item = vueRows ? this.renderState.rows.value[i]?.item : elements[i]?.item;
				if (item === selection) {
					found = i;
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
						if (vueRows) this.syncElementsShim();
					}
					break;
				}
			}
			if (!vueRows && found === -1) {
				/* 未找到选中行：与旧实现一致保持不滚动 */
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	scrollToHome: function (this: any): void {
		const element = this.elements[0];
		if (element instanceof HTMLElement) {
			this.select((element as NodeItemElement).item);
		}
		this.scroll(0, 0);
	},

	// oxlint-disable-next-line no-explicit-any
	scrollToEnd: function (this: any): void {
		const elements = this.elements;
		const index = elements.count - 1;
		const element = elements[index];
		if (element instanceof HTMLElement) {
			this.select((element as NodeItemElement).item);
		}
		this.scroll(0, this.scrollHeight);
	},

	// oxlint-disable-next-line no-explicit-any
	rowItemAt: function (this: any, index: number): TreeItem | undefined {
		if (this.renderState !== undefined) return this.renderState.rows.value[index]?.item;
		return (this.elements[index] as NodeElement | undefined)?.item;
	},

	// oxlint-disable-next-line no-explicit-any
	rowCount: function (this: any): number {
		if (this.renderState !== undefined) return this.renderState.rows.value.length;
		return this.elements.count;
	},

	// oxlint-disable-next-line no-explicit-any
	pageUp: function (this: any, select: boolean): void {
		const scrollLines = Math.floor(this.clientHeight / 20) - 1;
		if (select) {
			const bottom = this.scrollTop + this.clientHeight;
			const bottomIndex = Math.floor(bottom / 20) - 1;
			let index = this.getElementIndexOfSelection(Infinity);
			index = Math.min(index, bottomIndex) - scrollLines;
			index = Math.max(index, 0);
			this.select(this.rowItemAt(index));
		}
		this.scrollBy(0, -scrollLines * 20);
	},

	// oxlint-disable-next-line no-explicit-any
	pageDown: function (this: any, select: boolean): void {
		const scrollLines = Math.floor(this.clientHeight / 20) - 1;
		if (select) {
			const count = this.rowCount();
			const topIndex = Math.floor(this.scrollTop / 20);
			let index = this.getElementIndexOfSelection(0);
			index = Math.max(index, topIndex) + scrollLines;
			index = Math.min(index, count - 1);
			this.select(this.rowItemAt(index));
		}
		this.scrollBy(0, +scrollLines * 20);
	},

	// oxlint-disable-next-line no-explicit-any
	getElementIndexOfSelection: function (this: any, defIndex: number): number {
		const item = this.read();
		if (!item) return defIndex;
		if (this.renderState !== undefined) {
			const index = this.rowIndexOf(item);
			return index === -1 ? defIndex : index;
		}
		return this.elements.indexOf(item.element);
	},

	rename: function (this: HTMLElement & { [k: string]: unknown }, item: TreeItem): void {
		if (getListConfig(this).renamable) {
			const { element } = item;
			const { textBox } = treeListStatics;
			if (document.activeElement === this && !textBox.parentNode && element!.parentNode) {
				const nodes = [];
				const { folderMark, nodeIcon } = element!;
				for (const node of element!.childNodes) {
					if (
						node instanceof HTMLElement &&
						node !== folderMark &&
						node !== nodeIcon &&
						addClass(node, 'hidden')
					) {
						nodes.push(node);
					}
				}
				textBox.lastText = element!.textNode!.nodeValue as string;
				element!.textNode!.nodeValue = '';
				element!.appendChild(textBox);
				textBox.hiddenNodes = nodes;
				textBox.write(item.name);
				textBox.getFocus('all');
				textBox.fitContent();
			}
		}
	},

	cancelRenaming: function (this: HTMLElement & { [k: string]: unknown }): void {
		const timer = this.timer as Timer;
		if (timer.target) {
			timer.target = null;
		}
		if (timer.running) {
			timer.running = false;
			timer.remove();
		}
	},

	insertPaddingAndClear: function (this: HTMLElement & { [k: string]: unknown }): void {
		// 步骤 2：v-for 路径下 DOM 归 Vue 管理，锚定占位由模板 spacer 承担，这里不再动 DOM
		if (renderStateOf(this) !== undefined) return;
		const padding = treeListStatics.padding;
		let count = (this.elements as CommonListLike['elements']).count;
		if (getListConfig(this).padded) count++;
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

	clearElements: function (this: HTMLElement & { [k: string]: unknown }, start: number): void {
		commonListClearElements(this as unknown as CommonListLike, start);
	},

	// oxlint-disable-next-line no-explicit-any
	clear: function (this: any): HTMLElement {
		if (this.display === 'search') {
			this.display = 'normal';
			this.keyword = null;
			this.searchResults = [];
		}
		this.unselect();
		if (this.renderState !== undefined) {
			// 步骤 2：Vue 管理的行不能手清 DOM（会炸掉 vnode），只清数据 + bump
			this.syncRenderRows([]);
			return this;
		}
		this.textContent = '';
		commonListClearElements(this, 0);
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.updateHeadAndFoot();
		return this;
	},

	on: function (
		this: HTMLElement & { [k: string]: unknown },
		type: string,
		listener: (event: Event) => void,
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

	// oxlint-disable-next-line no-explicit-any
	keydown: function (this: any, event: KeyboardEvent & { cmdOrCtrlKey: boolean }): void {
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

	// oxlint-disable-next-line no-explicit-any
	pointerdown: function (this: any, event: PointerEvent): void {
		this.dragend();
		this.cancelRenaming();
		switch (event.button) {
			case 0: {
				const element = event.target as NodeElement;
				if (hasClass(element, 'folder-mark')) {
					event.preventDefault();
					const { item } = element.parentNode as NodeElement;
					item!.expanded = !item!.expanded;
					this.update();
					dispatchChangeEvent(this);
				} else {
					if (hasClass(element, 'node-item')) {
						if (!hasClass(element, 'selected')) {
							this.select(element.item);
						} else if (
							getListConfig(this).renamable &&
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
				const element = seek(event.target, '.node-item');
				if (hasClass(element, 'node-item') && !hasClass(element, 'selected')) {
					this.select((element as NodeItemElement).item);
				}
				break;
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	pointerup: function (this: any, event: PointerEvent): void {
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
					const element = seek(event.target, '.node-item');
					if (hasClass(element, 'node-item') && hasClass(element, 'selected')) {
						const popup: PopupEvent = new Event('popup') as PopupEvent;
						popup.value = (element as NodeItemElement).item;
						popup.clientX = event.clientX;
						popup.clientY = event.clientY;
						this.dispatchEvent(popup);
					} else {
						const popup: PopupEvent = new Event('popup') as PopupEvent;
						popup.value = null;
						popup.clientX = event.clientX;
						popup.clientY = event.clientY;
						this.dispatchEvent(popup);
					}
				}
				break;
		}
	},

	// oxlint-disable-next-line no-explicit-any
	doubleclick: function (this: any, event: MouseEvent): void {
		const element = event.target as NodeItemElement;
		if (hasClass(element, 'node-item')) {
			this.cancelRenaming();
			const item = element.item!;
			if (item.class === 'folder') {
				item.expanded = !item.expanded;
				this.update();
				dispatchChangeEvent(this);
			} else {
				this.open(item);
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	dragstart: function (this: any, event: TreeListDragEvent): void {
		if (
			getListConfig(this).removable &&
			!this.dragging &&
			this.display === 'normal' &&
			this.read() !== null &&
			!treeListStatics.textBox.parentNode &&
			(getListConfig(this).lockDirectory === false || this.read()!.class !== 'folder')
		) {
			this.dragging = event;
			Object.defineProperty(event, 'offsetY', { writable: true });
			event.preventDefault = () => {};
			hideDragImage(event.dataTransfer);
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

	// oxlint-disable-next-line no-explicit-any
	dragend: function (this: any, _event?: DragEvent): void {
		if (this.dragging) {
			removeClass(this, 'dragging');
			removeClass(this.dragging.hint.target, 'hint');
			this.parentNode.removeChild(this.dragging.hint);
			this.dragging = null;
			this.removeEventListener('dragenter', this.dragenter);
			this.removeEventListener('dragleave', this.dragleave);
			this.removeEventListener('dragover', this.dragover);
			this.removeEventListener('drop', this.drop);
		}
	},

	dragenter: function (this: HTMLElement & { [k: string]: unknown }, event: DragEvent): void {
		if (this.dragging) {
			event.preventDefault();
			event.dataTransfer!.dropEffect = 'move';
		}
	},

	dragleave: function (this: HTMLElement & { [k: string]: unknown }, event: DragEvent): void {
		if (this.dragging && !this.contains(event.relatedTarget as Node)) {
			(this.dragging as TreeListDragEvent).offsetY = -1;
			hide((this.dragging as TreeListDragEvent).hint);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	dragover: function (this: any, event: TreeListDragEvent): void {
		const { dragging } = this;
		if (dragging) {
			event.preventDefault();
			event.dataTransfer!.dropEffect = 'move';
			if (dragging.offsetY === event.offsetY) {
				return;
			}
			dragging.offsetY = event.offsetY;
			const element = seek(event.target, '.node-item');
			const hint = show(dragging.hint) as DragAndDropHintApi;
			if (hasClass(element, 'node-item')) {
				const sItem = dragging.target.item;
				const dItem = (element as NodeItemElement).item!;
				if (this.contain(sItem, dItem)) {
					{
						hide(hint);
						return;
					}
				}

				const offsetY = event.offsetY!;
				const position = dItem!.children
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

	// oxlint-disable-next-line no-explicit-any
	drop: function (this: any, event: DragEvent): void {
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

	// oxlint-disable-next-line no-explicit-any
	dataChange: function (this: any, _event: Event): void {
		if (this.display === 'search') {
			this.searchNodes(this.keyword);
		}
	}
};

export function createTreeListApi(el: HTMLElement, options?: TreeListApiOptions): HTMLElement {
	// oxlint-disable-next-line no-explicit-any
	const list = el as HTMLElement & { [k: string]: any };
	const getMenuState = options?.getMenuState ?? (() => 'closed');
	list.renderNodeExtras = options?.renderNodeExtras;
	list.renderNodeIcon = options?.renderNodeIcon;
	// 步骤 2：v-for 行渲染（数据派生）开关，关闭时保持旧命令式渲染路径
	if (vueRowRender) {
		list.renderState = createTreeRenderState();
	}
	attachApi(list, { getMenuState });

	for (const name of Object.keys(treeListPrototype)) {
		list[name] = treeListPrototype[name];
	}

	list._initialized = false;
	list.display = 'normal';
	list.keyword = null;
	list.searchResults = [];
	const listConfig = getListConfig(list);
	list.creators = listConfig.creators = [];
	list.updaters = listConfig.updaters = [];
	const elements = [] as unknown as (NodeElement | undefined)[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: unknown;
		foot: unknown;
	};
	elements.versionId = 0;
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;
	elements.head = null;
	elements.foot = null;
	list.elements = elements;
	if (vueRowRender) {
		list.syncRenderRows = function (
			this: HTMLElement & { [k: string]: unknown },
			overrideRows?: unknown
		): void {
			const state = renderStateOf(this) as TreeRenderState;
			// oxlint-disable-next-line no-explicit-any
			const self = this as any;
			self.initialize();
			const rows =
				overrideRows !== undefined
					? (overrideRows as ReturnType<typeof flattenRows>)
					: flattenRows(state, {
							display: self.display,
							data: self.data ?? null,
							searchResults: self.searchResults ?? [],
							foldable: getListConfig(self).foldable === true,
							parseName: (item: TreeItem) => self.parseName(item),
							selections: (self.selections ?? []) as TreeItem[],
							hintItem: self.dragging?.hint?.target?.item ?? null,
							root: (self.root ?? null) as TreeItem | null
						});
			state.rows.value = rows;
			state.bump();
			(self.syncElementsShim as () => void)();
		};
		list.syncElementsShim = function (this: HTMLElement & { [k: string]: unknown }): void {
			const state = renderStateOf(this) as TreeRenderState;
			// oxlint-disable-next-line no-explicit-any
			const self = this as any;
			const rows = state.rows.value;
			const { start, end } = computeWindow(
				self.scrollTop ?? 0,
				self.clientHeight ?? 0,
				rows.length
			);
			state.start.value = start;
			state.end.value = end;
			elements.count = rows.length;
			elements.start = start;
			elements.end = end;
			for (let i = 0; i < rows.length; i++) {
				const el = state.rowElements.get(rows[i].key);
				elements[i] = el !== undefined ? el : (undefined as never);
			}
			commonListClearElements(self as unknown as CommonListLike, rows.length);
		};
		list.rowIndexOf = function (
			this: HTMLElement & { [k: string]: unknown },
			item: TreeItem
		): number {
			const state = renderStateOf(this) as TreeRenderState;
			const rows = state.rows.value;
			for (let i = 0; i < rows.length; i++) {
				if (rows[i].item === item) return i;
			}
			return -1;
		};
		list.setItemClass = function (
			this: HTMLElement & { [k: string]: unknown },
			item: TreeItem,
			className: string,
			on = true
		): void {
			const state = renderStateOf(this) as TreeRenderState;
			setItemClass(state, item, className, on);
		};
		list.rowHeight = ROW_HEIGHT;
		// 行元素绑定桥（模板 :ref 回调）：维护 item.element 与内部字段，并跑 creators/updaters 钩子
		list.bindRow = function (
			this: HTMLElement & { [k: string]: unknown },
			item: TreeItem,
			el: unknown
		): void {
			const state = renderStateOf(this);
			if (state === undefined) return;
			// oxlint-disable-next-line no-explicit-any
			const self = this as any;
			const firstBind = el instanceof HTMLElement && item.element !== el;
			bindRowElement(state, item, el);
			if (firstBind) {
				for (const creator of getListConfig(self).creators) creator(item);
			}
		};
		list.bindNodeIcon = function (
			this: HTMLElement & { [k: string]: unknown },
			item: TreeItem,
			el: HTMLElement
		): void {
			if (item.element !== undefined) item.element.nodeIcon = el;
		};
		list.bindNodeExtras = function (
			this: HTMLElement & { [k: string]: unknown },
			item: TreeItem,
			el: HTMLElement
		): void {
			if (item.element !== undefined) item.element.extras = el;
		};
		list.applyRowUpdaters = function (this: HTMLElement & { [k: string]: unknown }): void {
			const state = renderStateOf(this);
			if (state === undefined) return;
			// oxlint-disable-next-line no-explicit-any
			const self = this as any;
			const updaters = getListConfig(self).updaters as ((item: TreeItem) => void)[];
			for (const el of state.rowElements.values()) {
				const item = el.item;
				if (item === undefined) continue;
				// 图标：提供 renderNodeIcon 时交给回调填充；否则回退 createIcon（编辑器可覆写该原型方法）
				if (typeof self.renderNodeIcon === 'function') {
					if (el.nodeIcon) self.renderNodeIcon(item, el.nodeIcon);
				} else if (
					el.nodeIcon === undefined ||
					el.nodeIcon === null ||
					el.nodeIcon.classList?.contains('tree-node-icon-placeholder')
				) {
					const created = self.createIcon(item) as HTMLElement;
					if (el.nodeIcon != null && el.nodeIcon.parentNode === el) {
						el.nodeIcon.replaceWith(created);
					} else {
						el.appendChild(created);
					}
					el.nodeIcon = created;
				}
				for (const updater of updaters) updater(item);
				if (typeof self.renderNodeExtras === 'function' && el.extras) {
					self.renderNodeExtras(item, el.extras);
				}
			}
		};
	}
	list.root = Object.defineProperty({}, 'children', {
		get: () => list.data
	});
	list.timer = new Timer({
		duration: 500,
		callback: (timer: Timer) => {
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
