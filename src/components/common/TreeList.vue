<template>
	<div class="tree-list" ref="root" :id="props.id"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
	addClass,
	dispatchChangeEvent,
	dispatchUpdateEvent,
	hasClass,
	hasScrollBar,
	hide,
	off,
	rect,
	removeClass,
	seek,
	show
} from '@/util/element-utils';
import { attachDoubleclick } from '@/util/doubleclick';
import { createDragAndDropHint } from '@/components/drag-and-drop-hint';
import { debounce } from '@/util/safe';
import { CommonList } from '@/components/common-list';
import { Menu } from '@/components/menu-list';
import { TreeList } from '@/components/tree-list';
import { Timer } from '@/util/timer';

interface TreeListElement extends HTMLElement {
	[k: string]: any;
	bind(getter: any): any;
	read(): any;
	initialize(): void;
	update(): void;
	refresh(): void;
	resize(): any;
	updateHeadAndFoot(): any;
	open(item: any): void;
	select(item: any): void;
	selectWithNoEvent(item: any): void;
	unselect(item?: any): void;
	selectRelative(direction: any): void;
	expandSelection(): void;
	scrollToSelection(mode?: string): void;
	scrollToHome(): void;
	scrollToEnd(): void;
	pageUp(select: any): void;
	pageDown(select: any): void;
	rename(item: any): void;
	cancelRenaming(): void;
	clear(): TreeListElement;
	searchNodes(keyword: any): void;
	searchNodesDebounced(keyword: any): void;
	duplicate(item: any): void;
	deleteNode(item: any): void;
	addNodeTo(sItem: any, dItem: any, insertBefore?: boolean): void;
	restore(operation: any, response: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	keydown(event: any): void;
	pointerdown(event: any): void;
	pointerup(event: any): void;
	doubleclick(event: any): void;
	dragstart(event: any): void;
	dragend(event?: any): void;
	dragover(event: any): void;
	drop(event: any): void;
	dataChange(event: any): void;
	updateItemName(item: any): void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<TreeListElement | null>(null);

let el = null as unknown as TreeListElement;

const bind = (getter: any): any => Object.defineProperty(el, 'data', { get: getter });

const read = (): any => {
	const { selections } = el;
	return selections.length === 1 ? selections[0] : null;
};

const initialize = (): void => {
	const { data } = el;
	if (!data.initialized) {
		TreeList.createParents(el.data, el.root);
		Object.defineProperty(data, 'initialized', {
			configurable: true,
			value: true
		});
	}
};

const update = (): void => {
	const { elements } = el;
	elements.start = -1;
	elements.count = 0;

	el.initialize();

	switch (el.display) {
		case 'normal':
			if (el.data) {
				el.createIndentedItems(el.data, el.root, 0);
			}
			break;
		case 'search':
			if (el.searchResults.length !== 0) {
				el.createFlatItems(el.searchResults);
			}
	}

	el.clearElements(elements.count);

	if (el.updateEventEnabled) {
		dispatchUpdateEvent(el);
	}

	el.resize();
};

const refresh = (): void => {
	el.deleteNodeElements(el.data);
	el.update();
};

const resize = (): any => CommonList.resize(el as unknown as CommonList);

const updateHeadAndFoot = (): any =>
	CommonList.updateHeadAndFoot(el as unknown as CommonList);

const updateOnResize = (element: any): void => {
	if (element.changed) {
		element.changed = false;
		el.updateNodeElement(element);
	}
};

const createFlatItems = (data: any): void => {
	const elements = el.elements;
	const length = data.length;
	for (let i = 0; i < length; i++) {
		const item = data[i];
		elements[elements.count++] = el.createNodeElement(item, 0);
	}
};

const createIndentedItems = (data: any, parent: any, indent: any): void => {
	const elements = el.elements;
	const length = data.length;
	for (let i = 0; i < length; i++) {
		const item = data[i];
		elements[elements.count++] = el.createNodeElement(item, indent);
		if (item.parent === undefined) {
			throw new Error('No parent!');
		}
		item.parent = parent;
		if (item.expanded && item.children.length !== 0) {
			el.createIndentedItems(item.children, item, indent + 1);
		}
	}
};

const searchNodes = (keyword: any): void => {
	const { data } = el;
	if (!data) return;
	if (keyword instanceof RegExp || keyword.length !== 0) {
		if (el.display === 'normal') {
			el.display = 'search';
		}
		if (typeof keyword === 'string') {
			keyword = keyword.replace(/[(){}\\^$*+?.|[\]]/g, '\\$&');
			keyword = new RegExp(keyword, 'i');
		}
		el.searchNodesAlgorithm(data, (el.keyword = keyword), (el.searchResults = []));
	} else {
		if (el.display === 'search') {
			el.display = 'normal';
			el.keyword = null;
			el.searchResults = [];
		}
	}
	el.update();
};

const searchNodesDebounced = (keyword: any): void => {
	(el._searchNodesDebounced ??= debounce((kw) => el.searchNodes(kw), 150))(keyword);
};

const searchNodesAlgorithm = (data: any, keyword: any, list: any): void => {
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
			el.searchNodesAlgorithm(children, keyword, list);
		}
	}
};

const createNodeElement = (item: any, indent: any): any => {
	let element = item.element;
	if (element === undefined) {
		element = document.createElement('node-item');
		element.item = item;
		Object.defineProperty(item, 'element', {
			configurable: true,
			value: element
		});

		if (el.selections.includes(item)) {
			addClass(element, 'selected');
		}
	}
	element.indent = indent;
	element.changed = true;
	return element;
};

const updateNodeElement = (element: any): void => {
	const { item } = element;
	if (!element.textNode) {
		let folderMark = null;
		let markVisible = false;
		let markIndent = el.foldable ? 16 : 0;
		if (item.children instanceof Array) {
			folderMark = document.createElement('folder-mark');
			markVisible = true;
			markIndent = 0;
			element.appendChild(folderMark);
		}

		const nodeIcon = el.createIcon(item);
		element.appendChild(nodeIcon);

		const textNode = el.createText(item);
		element.appendChild(textNode);

		element.draggable = true;
		element.expanded = false;
		element.markVisible = markVisible;
		element.markIndent = markIndent;
		element.textIndent = 0;
		element.folderMark = folderMark;
		element.nodeIcon = nodeIcon;
		element.textNode = textNode;

		for (const creator of el.creators) {
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

	for (const updater of el.updaters) {
		updater(item);
	}
};

const deleteNodeElements = (data: any): void => {
	const length = data.length;
	for (let i = 0; i < length; i++) {
		const item = data[i];
		if (item.element !== undefined) {
			delete item.element;
		}
		const { children } = item;
		if (children?.length > 0) {
			el.deleteNodeElements(children);
		}
	}
};

const createIcon = (item: any): any => {
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
};

const createText = (item: any): any => document.createTextNode(el.parseName(item));

const parseName = (item: any): any => item.name;

const updateItemName = (item: any): void => {
	if (item?.element?.textNode) {
		const element = item.element;
		const text = element.textNode;
		const last = text.nodeValue;
		const name = el.parseName(item);
		text.nodeValue = name;
		if (el.display === 'search') {
			const keyword = el.keyword;
			if (keyword!.test(last) || keyword!.test(name)) {
				el.searchNodes(el.keyword);
			}
		}
	}
};

const getItemByProperties = (properties: any): any => {
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
	return find(el.data);
};

const contain = (node: any, target: any): any => {
	while (target instanceof Object) {
		if (target === node) {
			return true;
		}
		target = target.parent;
	}
	return false;
};

const renameNode = (item: any, newName: any): void => {
	if (item) {
		item.name = newName;
		el.updateItemName(item);
	}
};

const resetItemName = (item: any): void => {
	if (item) {
		item.name = el.generateCopyName(item);
		el.updateItemName(item);
	}
};

const generateUniqueName = (item: any): any => {
	const flags: Record<string, any> = {};
	const items = item.parent.children;
	for (const item of items) {
		flags[item.name] = true;
	}
	const name = item.name.replace(/\s\d+$/, '');
	for (let i = 1; true; i++) {
		const newName = `${name} ${i}`;
		if (!flags[newName]) {
			return newName;
		}
	}
};

const duplicate = (item: any): void => {
	const copy = Object.clone(item);
	copy.name = el.generateUniqueName(item);
	const index = item.parent.children.indexOf(item);
	const next = item.parent.children[index + 1];
	if (next) {
		el.addNodeTo(copy, next, true);
	} else {
		el.addNodeTo(copy, item.parent);
	}
};

const addNodeTo = (sItem: any, dItem: any, insertBefore: any = false): void => {
	if (!sItem) {
		return;
	}

	let dList;
	let dIndex;

	const { data } = el;
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
		el.unselect();

		if (sItem.parent === undefined) {
			TreeList.createParents([sItem], null);
		}

		let item = dItem;
		while (item.parent !== undefined) {
			if (item.expanded === false) {
				item.expanded = true;
			}
			item = item.parent;
		}

		if (el.recordEventEnabled) {
			const record = new Event('record');
			const response = {
				type: 'create',
				sItem: sItem,
				dItem: dItem,
				insertBefore: insertBefore
			};
			record.value = response;
			el.dispatchEvent(record);
		}

		!sItem.parent && el.onCreate?.(sItem);
		el.update();
		el.select(sItem);
		el.scrollToSelection();
		dispatchChangeEvent(el);
	}
};

const deleteNode = (item: any): void => {
	const items = item.parent.children;
	if (items instanceof Array) {
		const index = items.indexOf(item);
		items.splice(index, 1);

		if (el.recordEventEnabled) {
			const record = new Event('record');
			const response = {
				type: 'delete',
				items: items,
				index: index,
				item: item
			};
			record.value = response;
			el.dispatchEvent(record);
		}

		el.unselectIn(item);
		el.onDelete?.(item);
		el.update();
		dispatchChangeEvent(el);
	}
};

const removeItemTo = (sItem: any, dItem: any): void => {
	if (sItem === dItem || (el.lockDirectory && dItem === el.root)) {
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

		if (el.recordEventEnabled) {
			const record = new Event('record');
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
			el.dispatchEvent(record);
		}

		el.insertPaddingAndClear();
		el.update();
		el.onRemove?.(sItem);
		el.scrollToSelection();
		dispatchChangeEvent(el);
	}
};

const removeItemToInsert = (sItem: any, dItem: any): void => {
	if (sItem === dItem || (el.lockDirectory && dItem.parent === el.root)) {
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

		if (el.recordEventEnabled) {
			const record = new Event('record');
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
			el.dispatchEvent(record);
		}

		el.insertPaddingAndClear();
		el.update();
		el.onRemove?.(sItem);
		el.scrollToSelection();
		dispatchChangeEvent(el);
	}
};

const restore = (operation: any, response: any): void => {
	if (el.display === 'search') {
		el.searchResults = Array.empty;
	}
	switch (response.type) {
		case 'rename': {
			const { item, oldValue, newValue } = response;
			if (operation === 'undo') {
				item.name = oldValue;
			} else {
				item.name = newValue;
			}
			el.updateItemName(item);
			el.expandToItem(item);
			if (!el.textContent) {
				el.update();
			}
			el.select(item);
			el.scrollToSelection();
			dispatchChangeEvent(el);
			break;
		}
		case 'create': {
			const { sItem, dItem, insertBefore } = response;
			if (operation === 'undo') {
				const enabled = el.recordEventEnabled;
				el.recordEventEnabled = false;
				el.deleteNode(sItem);
				el.recordEventEnabled = enabled;
			} else {
				const enabled = el.recordEventEnabled;
				el.recordEventEnabled = false;
				el.addNodeTo(sItem, dItem, insertBefore);
				el.recordEventEnabled = enabled;
				el.onResume?.(sItem);
			}
			break;
		}
		case 'delete': {
			const { items, index, item } = response;
			if (operation === 'undo') {
				if (index <= items.length) {
					items.splice(index, 0, item);
					el.unselect();
					el.expandToItem(item, false);
					el.onResume?.(item);
				}
			} else {
				if (index < items.length) {
					items.splice(index, 1);
					el.unselectIn(item);
					el.onDelete?.(item);
				}
			}

			el.update();
			operation === 'undo' && el.select(item);
			el.scrollToSelection();
			dispatchChangeEvent(el);
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
					el.expandToItem(item, false);
				}
			} else {
				if (item.parent !== undefined) {
					item.parent = dParent;
				}
				if (dIndex <= dList.length && sIndex < sList.length) {
					sList.splice(sIndex, 1);
					dList.splice(dIndex, 0, item);
					el.expandToItem(item, false);
				}
			}

			el.insertPaddingAndClear();
			el.update();
			el.select(item);
			el.onRemove?.(item);
			el.scrollToSelection();
			dispatchChangeEvent(el);
			break;
		}
	}
};

const open = (item: any): void => {
	if (item && el.openEventEnabled) {
		const open = new Event('open');
		open.value = item;
		el.dispatchEvent(open);
	}
};

const select = (item: any): void => {
	if (item instanceof Object && el.read() !== item) {
		el.unselect();
		el.selections.push(item);
		if (item.element !== undefined) {
			addClass(item.element, 'selected');
		}
		if (el.selectEventEnabled) {
			const select = new Event('select');
			select.value = el.read();
			el.dispatchEvent(select);
		}
	}
};

const selectWithNoEvent = (item: any): void => {
	const enabled = el.selectEventEnabled;
	el.selectEventEnabled = false;
	el.select(item);
	el.selectEventEnabled = enabled;
};

const unselect = (item?: any): void => {
	let selections = Array.empty;
	if (item === undefined) {
		selections = el.selections;
	}
	if (el.selections.includes(item)) {
		selections = [item];
	}
	if (selections.length !== 0) {
		TreeList.textBox.input.blur();
		for (const item of selections) {
			const { element } = item;
			if (element !== undefined) {
				removeClass(element, 'selected');
			}
		}
		if (el.unselectEventEnabled) {
			const select = new Event('unselect');
			select.value = selections;
			el.dispatchEvent(select);
		}
		el.selections = [];
	}
};

const unselectIn = (item: any): void => {
	const targets = [];
	for (let target of el.selections) {
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
		el.unselect(target);
	}
};

const selectRelative = (direction: any): void => {
	const elements = el.elements;
	const count = elements.count;
	if (count > 0) {
		let index = -1;
		const last = count - 1;
		const selection = el.read();
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
		el.select(elements[index]?.item);
		el.scrollToSelection();
	}
};

const expandSelection = (): void => {
	const item = el.read();
	if (item !== null && item.expanded !== undefined && item.element !== undefined) {
		item.expanded = !item.expanded;
		el.update();
		dispatchChangeEvent(el);
	}
};

const expandToSelection = (update = true): void => {
	const item = el.read();
	if (item !== null) {
		el.expandToItem(item, update);
	}
};

const expandToItem = (item: any, update = true): void => {
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
		el.update();
		dispatchChangeEvent(el);
	}
};

const scrollToSelection = (mode = 'active'): void => {
	const selection = el.read();
	if (selection && hasScrollBar(el)) {
		const elements = el.elements;
		const count = elements.count;
		for (let i = 0; i < count; i++) {
			const { item } = elements[i];
			if (item === selection) {
				let scrollTop;
				switch (mode) {
					case 'active':
						scrollTop = Math.clamp(
							el.scrollTop,
							i * 20 + 20 - el.innerHeight,
							i * 20
						);
						break;
					case 'middle':
						scrollTop = Math.round((i * 20 + 10 - el.innerHeight / 2) / 20) * 20;
						break;
					default:
						return;
				}
				if (el.scrollTop !== scrollTop) {
					el.scrollTop = scrollTop;
				}
				break;
			}
		}
	}
};

const scrollToHome = (): void => {
	const element = el.elements[0];
	if (element instanceof HTMLElement) {
		el.select(element.item);
	}
	el.scroll(0, 0);
};

const scrollToEnd = (): void => {
	const elements = el.elements;
	const index = elements.count - 1;
	const element = elements[index];
	if (element instanceof HTMLElement) {
		el.select(element.item);
	}
	el.scroll(0, el.scrollHeight);
};

const pageUp = (select: any): void => {
	const scrollLines = Math.floor(el.clientHeight / 20) - 1;
	if (select) {
		const bottom = el.scrollTop + el.clientHeight;
		const bottomIndex = Math.floor(bottom / 20) - 1;
		let index = el.getElementIndexOfSelection(Infinity);
		index = Math.min(index, bottomIndex) - scrollLines;
		index = Math.max(index, 0);
		el.select(el.elements[index]?.item);
	}
	el.scrollBy(0, -scrollLines * 20);
};

const pageDown = (select: any): void => {
	const scrollLines = Math.floor(el.clientHeight / 20) - 1;
	if (select) {
		const count = el.elements.count;
		const topIndex = Math.floor(el.scrollTop / 20);
		let index = el.getElementIndexOfSelection(0);
		index = Math.max(index, topIndex) + scrollLines;
		index = Math.min(index, count - 1);
		el.select(el.elements[index]?.item);
	}
	el.scrollBy(0, +scrollLines * 20);
};

const getElementIndexOfSelection = (defIndex: any): any => {
	const item = el.read();
	return item ? el.elements.indexOf(item.element) : defIndex;
};

const rename = (item: any): void => {
	if (el.renamable) {
		const { element } = item;
		const { textBox } = TreeList;
		if (document.activeElement === el && !textBox.parentNode && element.parentNode) {
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
};

const cancelRenaming = (): void => {
	const { timer } = el;
	if (timer.target) {
		timer.target = null;
	}
	if (timer.running) {
		timer.running = false;
		timer.remove();
	}
};

const insertPaddingAndClear = (): void => {
	const padding = TreeList.padding;
	let count = el.elements.count;
	if (el.padded) count++;
	if (padding.count !== count) {
		padding.count = count;
		padding.style.height = `${count * 20}px`;
	}
	const head = el.childNodes[0];
	el.insertBefore(padding, head);
	const { childNodes } = el;
	const { length } = childNodes;
	for (let i = length - 1; i > 0; i--) {
		childNodes[i].remove();
	}
};

const clearElements = (start: any): any =>
	CommonList.clearElements(el as unknown as CommonList, start);

const clear = (): TreeListElement => {
	if (el.display === 'search') {
		el.display = 'normal';
		el.keyword = null;
		el.searchResults = [];
	}
	el.unselect();
	el.textContent = '';
	el.clearElements(0);
	el.elements.count = 0;
	el.elements.start = -1;
	el.elements.end = -1;
	el.updateHeadAndFoot();
	return el;
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	el.addEventListener(type, listener, options);
	switch (type) {
		case 'select':
			el.selectEventEnabled = true;
			break;
		case 'unselect':
			el.unselectEventEnabled = true;
			break;
		case 'record':
			el.recordEventEnabled = true;
			break;
		case 'popup':
			el.popupEventEnabled = true;
			break;
		case 'open':
			el.openEventEnabled = true;
			break;
		case 'update':
			el.updateEventEnabled = true;
			break;
	}
};

const keydown = (event: any): void => {
	if (!el.data) {
		return;
	}
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'ArrowUp':
				el.scrollTop -= 20;
				break;
			case 'ArrowDown':
				el.scrollTop += 20;
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
				const item = el.read();
				if (item) {
					event.preventDefault();
					event.stopPropagation();
					el.open(item);
				}
				break;
			}
			case 'Space':
				event.preventDefault();
				return;
			case 'ArrowRight':
				event.preventDefault();
				el.expandSelection();
				break;
			case 'ArrowUp':
				event.preventDefault();
				el.selectRelative('up');
				break;
			case 'ArrowDown':
				event.preventDefault();
				el.selectRelative('down');
				break;
			case 'F2': {
				const item = el.read();
				if (item) {
					el.cancelRenaming();
					el.rename(item);
				}
				break;
			}
			default:
				return;
		}
		event.stopImmediatePropagation();
	}
};

const pointerdown = (event: any): void => {
	el.dragend();
	el.cancelRenaming();
	switch (event.button) {
		case 0: {
			const element = event.target;
			if (element.tagName === 'FOLDER-MARK') {
				event.preventDefault();
				const { item } = element.parentNode;
				item.expanded = !item.expanded;
				el.update();
				dispatchChangeEvent(el);
			} else {
				if (element.tagName === 'NODE-ITEM') {
					if (!hasClass(element, 'selected')) {
						el.select(element.item);
					} else if (
						el.renamable &&
						Menu.state === 'closed' &&
						document.activeElement === el &&
						event.clientX > (rect(element.nodeIcon)?.right ?? 0)
					) {
						el.timer.target = event.target;
					}
				}
			}
			break;
		}
		case 2: {
			const element = seek(event.target, 'node-item');
			if (element.tagName === 'NODE-ITEM' && !hasClass(element, 'selected')) {
				el.select(element.item);
			}
			break;
		}
	}
};

const pointerup = (event: any): void => {
	if (el.dragging || !el.data) {
		return;
	}
	switch (event.button) {
		case 0:
			if (document.activeElement === el && el.timer.target === event.target) {
				el.timer.running = true;
				el.timer.elapsed = 0;
				el.timer.add();
			}
			break;
		case 2:
			if (el.popupEventEnabled && document.activeElement === el) {
				const element = seek(event.target, 'node-item');
				if (element.tagName === 'NODE-ITEM' && hasClass(element, 'selected')) {
					const popup = new Event('popup');
					popup.value = element.item;
					popup.clientX = event.clientX;
					popup.clientY = event.clientY;
					el.dispatchEvent(popup);
				} else {
					const popup = new Event('popup');
					popup.value = null;
					popup.clientX = event.clientX;
					popup.clientY = event.clientY;
					el.dispatchEvent(popup);
				}
			}
			break;
	}
};

const doubleclick = (event: any): void => {
	const element = event.target;
	if (element.tagName === 'NODE-ITEM') {
		el.cancelRenaming();
		const item = element.item;
		if (item.class === 'folder') {
			item.expanded = !item.expanded;
			el.update();
			dispatchChangeEvent(el);
		} else {
			el.open(item);
		}
	}
};

const dragstart = (event: any): void => {
	if (
		el.removable &&
		!el.dragging &&
		el.display === 'normal' &&
		el.read() !== null &&
		!TreeList.textBox.parentNode &&
		(el.lockDirectory === false || el.read().class !== 'folder')
	) {
		el.dragging = event;
		Object.defineProperty(event, 'offsetY', { writable: true });
		event.preventDefault = Function.empty;
		event.dataTransfer.hideDragImage();
		event.hint = createDragAndDropHint();
		addClass(event.hint, 'for-list');
		el.parentNode!.insertBefore(hide(event.hint), el);
		addClass(el, 'dragging');
		el.addEventListener('dragenter', el.dragenter);
		el.addEventListener('dragleave', el.dragleave);
		el.addEventListener('dragover', el.dragover);
		el.addEventListener('drop', el.drop);
	}
};

const dragend = (event?: any): void => {
	if (el.dragging) {
		removeClass(el, 'dragging');
		removeClass(el.dragging.hint.target, 'hint');
		(el.parentNode as any).removeChild(el.dragging.hint);
		el.dragging = null;
		off(el, 'dragenter', el.dragenter);
		off(el, 'dragleave', el.dragleave);
		off(el, 'dragover', el.dragover);
		off(el, 'drop', el.drop);
	}
};

const dragenter = (event: any): void => {
	if (el.dragging) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}
};

const dragleave = (event: any): void => {
	if (el.dragging && !el.contains(event.relatedTarget)) {
		el.dragging.offsetY = -1;
		hide(el.dragging.hint);
	}
};

const dragover = (event: any): void => {
	const { dragging } = el;
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
			const dItem = element.item;
			if (el.contain(sItem, dItem)) {
				return hide(hint);
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
						const rect = hint.measure(element);
						removeClass(hint.target, 'hint');
						hint.target = element;
						hint.position = position;
						hint.moveDown().set(rect);
						addClass(element, 'hint');
					}
					break;
				case 'before':
					if (hint.target !== element || hint.position !== position) {
						const rect = hint.measure(element);
						rect.top -= 1;
						rect.height = 2;
						removeClass(hint.target, 'hint');
						hint.target = element;
						hint.position = position;
						hint.moveUp().set(rect);
					}
					break;
				case 'after':
					if (hint.target !== element || hint.position !== position) {
						const rect = hint.measure(element);
						rect.top += rect.height - 1;
						rect.height = 2;
						removeClass(hint.target, 'hint');
						hint.target = element;
						hint.position = position;
						hint.moveUp().set(rect);
					}
					break;
			}
		} else {
			const elements = el.elements;
			const index = elements.count - 1;
			const element = elements[index];
			if (
				element !== undefined &&
				(hint.target !== element || hint.position !== 'append')
			) {
				const rect = hint.measure(element);
				rect.top += rect.height - 1;
				rect.height = 2;
				removeClass(hint.target, 'hint');
				hint.target = element;
				hint.position = 'append';
				hint.moveUp().set(rect);
			}
		}
	}
};

const drop = (event: any): void => {
	const { dragging } = el;
	if (!dragging) {
		return;
	}
	event.stopPropagation();
	const hint = dragging.hint;
	if (!hasClass(hint, 'hidden')) {
		const sItem = dragging.target.item;
		const dItem = hint.target.item;
		if (hint.position !== 'append' && el.contain(sItem, dItem)) {
			return;
		}
		switch (hint.position) {
			case 'into':
				el.removeItemTo(sItem, dItem);
				break;
			case 'before':
				el.removeItemToInsert(sItem, dItem);
				break;
			case 'after':
			case 'append': {
				const elements = el.elements;
				const index = elements.indexOf(hint.target);
				const next = elements[index + 1]?.item;
				if (next) {
					el.removeItemToInsert(sItem, next);
				} else {
					el.removeItemTo(sItem, el.root);
				}
				break;
			}
		}
	}

	el.dragend();
};

const dataChange = (event: any): void => {
	if (el.display === 'search') {
		el.searchNodes(el.keyword);
	}
};

defineExpose({
	bind,
	read,
	initialize,
	update,
	refresh,
	resize,
	updateHeadAndFoot,
	updateOnResize,
	createFlatItems,
	createIndentedItems,
	searchNodes,
	searchNodesDebounced,
	searchNodesAlgorithm,
	createNodeElement,
	updateNodeElement,
	deleteNodeElements,
	createIcon,
	createText,
	parseName,
	updateItemName,
	getItemByProperties,
	contain,
	renameNode,
	resetItemName,
	generateUniqueName,
	duplicate,
	addNodeTo,
	deleteNode,
	removeItemTo,
	removeItemToInsert,
	restore,
	open,
	select,
	selectWithNoEvent,
	unselect,
	unselectIn,
	selectRelative,
	expandSelection,
	expandToSelection,
	expandToItem,
	scrollToSelection,
	scrollToHome,
	scrollToEnd,
	pageUp,
	pageDown,
	getElementIndexOfSelection,
	rename,
	cancelRenaming,
	insertPaddingAndClear,
	clearElements,
	clear,
	on,
	keydown,
	pointerdown,
	pointerup,
	doubleclick,
	dragstart,
	dragend,
	dragenter,
	dragleave,
	dragover,
	drop,
	dataChange,
	root
});

onMounted(() => {
	const rootEl = root.value;
	if (!rootEl) return;
	el = rootEl;

	el._initialized = false;
	el.display = 'normal';
	el.keyword = null;
	el.searchResults = [];
	el.creators = [];
	el.updaters = [];
	el.elements = [];
	el.elements.versionId = 0;
	el.elements.count = 0;
	el.elements.start = -1;
	el.elements.end = -1;
	el.elements.head = null;
	el.elements.foot = null;
	el.root = Object.defineProperty({}, 'children', {
		get: () => el.data
	});
	el.timer = new Timer({
		duration: 500,
		callback: (timer: any) => {
			const item = el.read();
			if (item instanceof Object) {
				const target = timer.target;
				const element = item.element;
				if (element.contains(target)) {
					el.rename(item);
				}
			}
			timer.target = null;
			timer.running = false;
		}
	});
	el.selections = [];
	el.dragging = null;
	el.padded = el.hasAttribute('padded');
	el.removable = false;
	el.renamable = false;
	el.foldable = true;
	el.lockDirectory = false;
	el.multipleSelect = false;
	el.selectEventEnabled = false;
	el.unselectEventEnabled = false;
	el.recordEventEnabled = false;
	el.popupEventEnabled = false;
	el.openEventEnabled = false;
	el.updateEventEnabled = false;
	el.tabIndex = 0;

	el.bind = bind;
	el.read = read;
	el.initialize = initialize;
	el.update = update;
	el.refresh = refresh;
	el.resize = resize;
	el.updateHeadAndFoot = updateHeadAndFoot;
	el.updateOnResize = updateOnResize;
	el.createFlatItems = createFlatItems;
	el.createIndentedItems = createIndentedItems;
	el.searchNodes = searchNodes;
	el.searchNodesDebounced = searchNodesDebounced;
	el.searchNodesAlgorithm = searchNodesAlgorithm;
	el.createNodeElement = createNodeElement;
	el.updateNodeElement = updateNodeElement;
	el.deleteNodeElements = deleteNodeElements;
	el.createIcon = createIcon;
	el.createText = createText;
	el.parseName = parseName;
	el.updateItemName = updateItemName;
	el.getItemByProperties = getItemByProperties;
	el.contain = contain;
	el.renameNode = renameNode;
	el.resetItemName = resetItemName;
	el.generateUniqueName = generateUniqueName;
	el.duplicate = duplicate;
	el.addNodeTo = addNodeTo;
	el.deleteNode = deleteNode;
	el.removeItemTo = removeItemTo;
	el.removeItemToInsert = removeItemToInsert;
	el.restore = restore;
	el.open = open;
	el.select = select;
	el.selectWithNoEvent = selectWithNoEvent;
	el.unselect = unselect;
	el.unselectIn = unselectIn;
	el.selectRelative = selectRelative;
	el.expandSelection = expandSelection;
	el.expandToSelection = expandToSelection;
	el.expandToItem = expandToItem;
	el.scrollToSelection = scrollToSelection;
	el.scrollToHome = scrollToHome;
	el.scrollToEnd = scrollToEnd;
	el.pageUp = pageUp;
	el.pageDown = pageDown;
	el.getElementIndexOfSelection = getElementIndexOfSelection;
	el.rename = rename;
	el.cancelRenaming = cancelRenaming;
	el.insertPaddingAndClear = insertPaddingAndClear;
	el.clearElements = clearElements;
	el.clear = clear;
	el.on = on;
	el.keydown = keydown;
	el.pointerdown = pointerdown;
	el.pointerup = pointerup;
	el.doubleclick = doubleclick;
	el.dragstart = dragstart;
	el.dragend = dragend;
	el.dragenter = dragenter;
	el.dragleave = dragleave;
	el.dragover = dragover;
	el.drop = drop;
	el.dataChange = dataChange;

	el.addEventListener('scroll', el.resize);
	el.addEventListener('keydown', el.keydown);
	el.addEventListener('pointerdown', el.pointerdown);
	el.addEventListener('pointerup', el.pointerup);
	attachDoubleclick(el, el.doubleclick);
	el.addEventListener('dragstart', el.dragstart);
	el.addEventListener('dragend', el.dragend);
	el.addEventListener('change', el.dataChange);
});
</script>
