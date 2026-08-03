<template>
	<div class="param-list" ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
	addClass,
	css,
	dispatchChangeEvent,
	hasClass,
	isInContent,
	listenDraggingScrollbarEvent,
	on as onElement,
	read as readElement,
	removeClass
} from '@/util/element-utils';
import { ParamListHistory } from '@/components/param-history';
import { ctrl } from '@/util/event-accessors';
import { CommonList } from '@/components/common-list';
import { Menu } from '@/components/menu-list';
import { Local } from '@/tools/localization';

interface ParamListElement extends HTMLElement {
	object: any;
	type: string | null;
	data: any[] | null;
	elements: any[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: HTMLElement | null;
		foot: HTMLElement | null;
	};
	selections: any[] & { count: number };
	start: number | null;
	end: number | null;
	origin: number | null;
	active: number | null;
	flexible: boolean;
	inserting: boolean;
	focusing: boolean;
	dragging: PointerEvent | null;
	history: any;
	togglable: boolean;
	height: number;
	autoSwitch: boolean;
	_paddingTop: number;
	readonly innerHeight: number;
	readonly paddingTop: number;
	bind(object: any): this;
	read(): any[] | null;
	write(data: any[]): void;
	update(): void;
	resize(): void;
	updateFlexibleHeight(): void;
	updateHeadAndFoot(): void;
	updateOnResize(): void;
	select(start: number, end?: number): void;
	selectMultiple(active: number): void;
	selectAll(): void;
	unselect(): void;
	reselect(): void;
	selectUp(): void;
	selectDown(): void;
	selectMultipleUp(): void;
	selectMultipleDown(): void;
	scrollToSelection(): void;
	insert(): void;
	edit(): void;
	toggle(): void;
	enableItems(items: any[]): void;
	disableItems(items: any[]): void;
	copy(): void;
	paste(): void;
	delete(): void;
	undo(): void;
	redo(): void;
	save(): void;
	clearElements(start: number): void;
	clear(): this;
	listFocus(event: Event): void;
	listBlur(event: Event): void;
	keydown(event: KeyboardEvent): void;
	pointerdown(event: PointerEvent): void;
	pointerup(event: PointerEvent): void;
	doubleclick(event: Event): void;
	windowPointerup: (event: PointerEvent) => void;
	windowPointermove: (event: PointerEvent) => void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	flexible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	id: undefined,
	flexible: false
});

const emit = defineEmits<{
	change: [value: any[] | null];
}>();

const root = ref<ParamListElement | null>(null);

let el: ParamListElement | null = null;

const getInnerHeight = (): number => {
	const self = el!;
	if (self.flexible) {
		return self.height;
	}
	let padding = self._paddingTop;
	if (padding === undefined) {
		const style = css(self);
		const pt = parseInt(style.paddingTop);
		const pb = parseInt(style.paddingBottom);
		padding = self._paddingTop = pt + pb;
	}
	const outerHeight = self.clientHeight;
	const innerHeight = outerHeight - padding;
	return Math.max(innerHeight, 0);
};

const getPaddingTop = (): number => {
	const self = el!;
	let pt = self._paddingTop;
	if (pt === undefined) {
		pt = self._paddingTop = parseInt(css(self).paddingTop);
	}
	return pt;
};

const bind = (object: any): ParamListElement => {
	const self = el!;
	object.initialize(self);
	object.initialize = Function.empty as any;
	self.object = object;
	self.type = `yami.${object.type ?? self.id}`;
	self.history = object.history ?? new ParamListHistory(self);
	return self;
};

const read = (): any[] | null => el!.data;

const write = (data: any[]): void => {
	const self = el!;
	if (self.flexible) {
		self.autoSwitch = true;
	}
	self.data = data;
	update();
	self.history.reset();
};

const update = (): void => {
	const self = el!;
	const { data } = self;
	if (!data) return;
	const { elements } = self;
	elements.start = -1;
	elements.count = 0;

	const object = self.object;
	const length = data.length;
	for (let i = 0; i < length; i++) {
		const item = data[i];
		const result = object.parse(item, data, i);
		switch (typeof result) {
			case 'string': {
				const li = document.createElement('div') as any;
				addClass(li, 'param-item');
				addClass(li, 'one-column');
				li.dataValue = i;
				li.dataItem = item;
				li.textContent = result;
				elements[elements.count++] = li;
				continue;
			}
			case 'object': {
				const li = document.createElement('div') as any;
				addClass(li, 'param-item');
				li.dataValue = i;
				li.dataItem = item;
				elements[elements.count++] = li;
				if (!Array.isArray(result)) {
					addClass(li, 'one-column');
					li.textContent = result.content;
					if (result.class) {
						addClass(li, result.class);
					}
					continue;
				}

				const [result0, result1] = result;
				if (result0 instanceof HTMLElement) {
					li.appendChild(result0);
				} else if (result0 instanceof Object) {
					const text0 = document.createElement('div');
					addClass(text0, 'text-0-of-2');
					text0.textContent = result0.content;
					if (result0.class) {
						addClass(text0, result0.class);
					}
					li.appendChild(text0);
				} else {
					const text0 = document.createElement('div');
					addClass(text0, 'text-0-of-2');
					text0.textContent = result0;
					li.appendChild(text0);
				}

				if (result1 instanceof HTMLElement) {
					li.appendChild(result1);
				} else if (result1 instanceof Object) {
					const text1 = document.createElement('div');
					addClass(text1, 'text-1-of-2');
					text1.textContent = result1.content;
					if (result1.class) {
						addClass(text1, result1.class);
					}
					li.appendChild(text1);
				} else {
					const text1 = document.createElement('div');
					addClass(text1, 'text-1-of-2');
					text1.textContent = result1;
					li.appendChild(text1);
				}
				continue;
			}
		}
	}

	const li = document.createElement('div') as any;
	const unit = length === 1 ? 'item' : 'items';
	addClass(li, 'param-item');
	addClass(li, 'weak');
	li.dataValue = length;
	li.dataItem = null;
	li.textContent = `${length} ${unit}`;
	elements[elements.count++] = li;

	clearElements(elements.count);

	updateFlexibleHeight();

	object.update?.(self);

	resize();
};

const resize = (): void => {
	CommonList.resize(el! as unknown as CommonList);
};

const updateFlexibleHeight = (): void => {
	const self = el!;
	if (self.flexible) {
		const count = self.elements.count;
		const height = Math.min(count * 20, 500) + 2;
		if (self.height !== height) {
			self.height = height;
			self.style.height = `${height}px`;
		}
		if (self.autoSwitch) {
			self.autoSwitch = false;
			const detailBox = self.parentNode as
				| (HTMLElement & {
						open?: () => void;
						close?: () => void;
				  })
				| null;
			if (detailBox?.open && detailBox?.close) {
				if (count !== 1) {
					detailBox.open();
				} else {
					detailBox.close();
				}
			}
		}
	}
};

const updateHeadAndFoot = (): void => {
	CommonList.updateHeadAndFoot(el! as unknown as CommonList);
};

const updateOnResize = (): void => {};

const select = (start: number, end: number = start): void => {
	const self = el!;
	if (start > end) {
		[start, end] = [end, start];
	}

	const elements = self.elements;
	const count = elements.count;
	start = Math.clamp(start, 0, count - 1);
	end = Math.clamp(end, 0, count - 1);
	if (start !== end) {
		const element = elements[end] as HTMLElement & {
			read(): number;
			dataItem?: any;
		};
		if (!element.dataItem) {
			end--;
		}
	}

	unselect();

	self.start = start;
	self.end = end;
	self.origin = start;
	self.active = start;

	reselect();
};

const selectMultiple = (active: number): void => {
	const self = el!;
	const origin = self.origin!;
	select(origin, active);
	self.origin = origin;
	self.active = Math.clamp(active, self.start!, self.end!);
};

const selectAll = (): void => {
	const self = el!;
	select(0, Infinity);
	self.active = self.end;
};

const unselect = (): void => {
	const self = el!;
	if (self.start !== null) {
		const { selections } = self;
		const { count } = selections;
		for (let i = 0; i < count; i++) {
			removeClass(selections[i], 'selected');
			selections[i] = undefined;
		}
		selections.count = 0;
		if (count > 256) {
			selections.length = 0;
		}
	}
};

const reselect = (): void => {
	const self = el!;
	if (self.focusing && self.start !== null) {
		const { selections } = self;
		const elements = self.elements;
		const start = self.start;
		const end = self.end;
		let count = 0;
		for (let i = start; i <= end!; i++) {
			const element = elements[i];
			selections[count++] = element;
			addClass(element, 'selected');
		}
		selections.count = count;
	}
};

const selectUp = (): void => {
	const self = el!;
	if (self.start !== null) {
		let index = self.start;
		if (index === self.end) {
			index--;
		}
		select(index);
		scrollToSelection();
	}
};

const selectDown = (): void => {
	const self = el!;
	if (self.start !== null) {
		let index = self.end!;
		if (index === self.start) {
			index++;
		}
		select(index);
		scrollToSelection();
	}
};

const selectMultipleUp = (): void => {
	const self = el!;
	if (self.start !== null) {
		const i = self.active! - 1;
		if (i >= 0) {
			selectMultiple(i);
		}
		scrollToSelection();
	}
};

const selectMultipleDown = (): void => {
	const self = el!;
	if (self.start !== null) {
		const elements = self.elements;
		const count = elements.count;
		const origin = self.origin!;
		const i = self.active! + 1;
		if (i < count - 1 || i === origin) {
			selectMultiple(i);
		}
		scrollToSelection();
	}
};

const scrollToSelection = (): void => {
	const self = el!;
	if (self.start !== null) {
		const scrollTop = Math.clamp(
			self.scrollTop,
			self.active! * 20 + 20 - self.innerHeight,
			self.active! * 20
		);
		if (self.scrollTop !== scrollTop) {
			self.scrollTop = scrollTop;
		}
	}
};

const insert = (): void => {
	const self = el!;
	if (self.start !== null) {
		self.inserting = true;
		self.object.target = self;
		self.object.open();
	}
};

const edit = (): void => {
	const self = el!;
	if (self.start !== null) {
		const elements = self.elements;
		const element = elements[self.start] as HTMLElement & {
			dataItem: any;
		};
		self.inserting = element.dataItem === null;
		switch (self.inserting) {
			case true:
				self.object.target = self;
				self.object.open();
				break;
			case false:
				self.object.target = self;
				self.object.open(self.data![self.start]);
				break;
		}
	}
};

const toggle = (): void => {
	const self = el!;
	if (self.togglable && self.start !== null) {
		let method = 'disable';
		const items: any[] = [];
		const { data, start, end } = self;
		for (let i = start; i <= end!; i++) {
			const item = data![i];
			if (item) {
				switch (method) {
					case 'disable':
						if (!item.enabled) {
							method = 'enable';
							items.length = 0;
						}
						items.push(item);
						continue;
					case 'enable':
						if (!item.enabled) {
							items.push(item);
						}
						continue;
				}
			}
		}
		if (items.length !== 0) {
			self.history.save({
				type: 'toggle',
				array: data,
				method: method,
				items: items
			});
			switch (method) {
				case 'enable':
					enableItems(items);
					break;
				case 'disable':
					disableItems(items);
					break;
			}
			update();
			reselect();
			dispatchChangeEvent(self);
		}
	}
};

const enableItems = (items: any[]): void => {
	for (const item of items) {
		item.enabled = true;
	}
};

const disableItems = (items: any[]): void => {
	for (const item of items) {
		item.enabled = false;
	}
};

const copy = (): void => {
	const self = el!;
	if (self.start !== null) {
		const data = self.data!;
		const start = self.start;
		const end = self.end! + 1;
		const copies = data.slice(start, end);
		if (copies.length > 0) {
			(Clipboard as any).write(self.type, copies);
		}
	}
};

const paste = (): void => {
	const self = el!;
	if (self.start !== null) {
		const copies = (Clipboard as any).read(self.type);
		if (copies) {
			const data = self.data!;
			const start = self.start;
			self.history.save({
				type: 'insert',
				array: data,
				index: start,
				items: copies
			});
			self.object.onPaste?.(self, copies);
			data.splice(start, 0, ...copies);
			update();
			select(start + copies.length);
			scrollToSelection();
			dispatchChangeEvent(self);
		}
	}
};

const delete_ = (): void => {
	const self = el!;
	if (self.start !== null) {
		const data = self.data!;
		const start = self.start;
		const end = self.end! + 1;
		const items = data.slice(start, end);
		if (items.length > 0) {
			self.history.save({
				type: 'delete',
				array: data,
				index: start,
				items: items
			});
			data.splice(start, end - start);
			update();
			select(start);
			scrollToSelection();
			dispatchChangeEvent(self);
		}
	}
};

const undo = (): void => {
	const self = el!;
	if (!self.dragging && self.history.canUndo()) {
		self.history.restore('undo');
	}
};

const redo = (): void => {
	const self = el!;
	if (!self.dragging && self.history.canRedo()) {
		self.history.restore('redo');
	}
};

const save = (): void => {
	const self = el!;
	const item = self.object.save();
	if (item === undefined) {
		return;
	}
	const start = self.start;
	if (start !== null) {
		const data = self.data!;
		const length = data.length;
		switch (self.inserting) {
			case true:
				self.history.save({
					type: 'insert',
					array: data,
					index: start,
					items: [item]
				});
				data.splice(start, 0, item);
				update();
				select(start + data.length - length);
				break;
			case false:
				self.history.save({
					type: 'replace',
					array: data,
					index: start,
					swap: data[start]
				});
				data[start] = item;
				update();
				select(start);
				break;
		}
		scrollToSelection();
		dispatchChangeEvent(self);
	}
};

const clearElements = (start: number): void => {
	CommonList.clearElements(el! as unknown as CommonList, start);
};

const clear = (): ParamListElement => {
	const self = el!;
	unselect();
	self.textContent = '';
	self.data = null;
	self.start = null;
	self.end = null;
	self.history.reset();
	clearElements(0);
	self.elements.count = 0;
	self.elements.start = -1;
	self.elements.end = -1;
	updateHeadAndFoot();
	return self;
};

const listFocus = (event: Event): void => {
	const self = el!;
	if (!self.focusing) {
		self.focusing = true;
		self.start !== null ? reselect() : select(0);
	}
};

const listBlur = (event: Event): void => {
	const self = el!;
	if (self.dragging) {
		windowPointerup(self.dragging);
	}
	if (self.focusing) {
		let element: any = self;
		while ((element = element.parentNode)) {
			if (element.nodeType !== Node.ELEMENT_NODE) {
				continue;
			}
			if ((element as HTMLElement).classList.contains('window-frame')) {
				if (hasClass(element, 'blur')) {
					return;
				} else {
					break;
				}
			}
		}
		self.focusing = false;
		unselect();
	}
};

const keydown = (event: KeyboardEvent): void => {
	const self = el!;
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyX':
				copy();
				delete_();
				break;
			case 'KeyC':
				copy();
				break;
			case 'KeyV':
				paste();
				break;
			case 'KeyA':
				selectAll();
				break;
			case 'KeyZ':
				if (!(event as any).macRedoKey) {
					undo();
					break;
				}
			case 'KeyY':
				redo();
				break;
			case 'ArrowUp':
				self.scrollTop -= 20;
				break;
			case 'ArrowDown':
				self.scrollTop += 20;
				break;
			default:
				return;
		}
		event.stopImmediatePropagation();
	} else {
		switch (event.code) {
			case 'Space':
				event.preventDefault();
				return;
			case 'Enter':
			case 'NumpadEnter':
				if (self.start !== null) {
					event.stopPropagation();
					if (self.start === self.end) {
						edit();
					}
				}
				break;
			case 'Insert':
				insert();
				break;
			case 'Slash':
				toggle();
				break;
			case 'Delete':
				delete_();
				break;
			case 'ArrowUp':
				event.preventDefault();
				event.shiftKey ? selectMultipleUp() : selectUp();
				break;
			case 'ArrowDown':
				event.preventDefault();
				event.shiftKey ? selectMultipleDown() : selectDown();
				break;
			default:
				return;
		}
		event.stopImmediatePropagation();
	}
};

const pointerdown = (event: PointerEvent): void => {
	const self = el!;
	if (self.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			let index: number | undefined;
			let element = event.target as HTMLElement;
			if (element === self) {
				if (isInContent(self, event)) {
					index = self.elements.count - 1;
				}
			} else {
				element = element.closest('.param-item') as HTMLElement;
				if (element?.classList.contains('param-item')) {
					index = readElement(element);
				}
			}
			if (index !== undefined && index >= 0) {
				element = self.elements[index];
				if (event.shiftKey && self.start !== null) {
					selectMultiple(index);
				} else {
					select(index);
				}
				self.dragging = event;
				(event as any).mode = 'select';
				(event as any).itemIndex = index;
				(event as any).itemHeight = element.clientHeight;
				window.addEventListener('pointerup', self.windowPointerup);
				window.addEventListener('pointermove', self.windowPointermove);
				(self as any).addScrollListener('vertical', 2, true, () => {
					windowPointermove((event as any).latest);
				});
			}
			break;
		}
		case 2: {
			let index: number | undefined;
			let element = event.target as HTMLElement;
			if (element === self) {
				if (isInContent(self, event)) {
					index = self.elements.count - 1;
				}
			} else {
				element = element.closest('.param-item') as HTMLElement;
				if (element?.classList.contains('param-item')) {
					index = readElement(element);
				}
			}
			if (index !== undefined && index >= 0) {
				const element = self.elements[index];
				if (!hasClass(element, 'selected')) {
					select(index);
				}
			}
			break;
		}
	}
};

const pointerup = (event: PointerEvent): void => {
	const self = el!;
	if (self.dragging) {
		return;
	}
	switch (event.button) {
		case 2:
			if (self.start !== null && document.activeElement === self) {
				const elements = self.elements;
				const element = elements[self.start] as HTMLElement & {
					dataItem: any;
				};
				const valid = !!element.dataItem;
				const editable = self.start === self.end;
				const pastable = (Clipboard as any).has(self.type);
				const allSelectable = self.data!.length > 0;
				const undoable = self.history.canUndo();
				const redoable = self.history.canRedo();
				const get = Local.createGetter('menuParamList');
				const menuItems: any[] = [
					{
						label: get('edit'),
						accelerator: 'Enter',
						enabled: editable,
						click: () => {
							edit();
						}
					},
					{
						label: get('insert'),
						accelerator: 'Insert',
						click: () => {
							insert();
						}
					},
					{
						type: 'separator'
					},
					{
						label: get('cut'),
						accelerator: ctrl('X'),
						enabled: valid,
						click: () => {
							copy();
							delete_();
						}
					},
					{
						label: get('copy'),
						accelerator: ctrl('C'),
						enabled: valid,
						click: () => {
							copy();
						}
					},
					{
						label: get('paste'),
						accelerator: ctrl('V'),
						enabled: pastable,
						click: () => {
							paste();
						}
					},
					{
						label: get('delete'),
						accelerator: 'Delete',
						enabled: valid,
						click: () => {
							delete_();
						}
					},
					{
						label: get('selectAll'),
						accelerator: ctrl('A'),
						enabled: allSelectable,
						click: () => {
							select(0, Infinity);
						}
					},
					{
						label: get('undo'),
						accelerator: ctrl('Z'),
						enabled: undoable,
						click: () => {
							undo();
						}
					},
					{
						label: get('redo'),
						accelerator: ctrl('Y'),
						enabled: redoable,
						click: () => {
							redo();
						}
					}
				];
				if (self.togglable) {
					menuItems.splice(2, 0, {
						label: get('toggle'),
						accelerator: '/',
						enabled: valid,
						click: () => {
							toggle();
						}
					});
				}
				Menu.popup(
					{
						x: event.clientX,
						y: event.clientY
					},
					menuItems
				);
			}
			break;
	}
};

const doubleclick = (event: Event): void => {
	const self = el!;
	if (self.start === self.end) {
		edit();
	}
};

const windowPointerup = (event: PointerEvent): void => {
	const self = el!;
	const { dragging } = self;
	if (dragging?.relate(event)) {
		if (dragging.mode === 'select') {
			(self as any).removeScrollListener();
		}
		self.dragging = null;
		window.removeEventListener('pointerup', windowPointerup);
		window.removeEventListener('pointermove', windowPointermove);
	}
};

const windowPointermove = (event: PointerEvent): void => {
	const self = el!;
	const { dragging } = self;
	if (dragging?.relate(event)) {
		if (dragging.mode === 'select') {
			dragging.latest = event;
			const elements = self.elements;
			const count = elements.count;
			if (count > 0) {
				const pt = self.paddingTop;
				const { itemHeight } = dragging;
				const { y } = event.getRelativeCoords(self);
				const line = Math.floor((y - pt) / itemHeight);
				const index = Math.clamp(line, 0, count - 1);
				if (dragging.itemIndex !== index) {
					dragging.itemIndex = index;
					selectMultiple(index);
				}
			}
		}
	}
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	el!.addEventListener(type, listener as EventListener, options);
};

defineExpose({
	bind,
	read,
	write,
	update,
	resize,
	updateFlexibleHeight,
	updateHeadAndFoot,
	updateOnResize,
	select,
	selectMultiple,
	selectAll,
	unselect,
	reselect,
	selectUp,
	selectDown,
	selectMultipleUp,
	selectMultipleDown,
	scrollToSelection,
	insert,
	edit,
	toggle,
	enableItems,
	disableItems,
	copy,
	paste,
	delete: delete_,
	undo,
	redo,
	save,
	clearElements,
	clear,
	on,
	root
});

onMounted(() => {
	el = root.value;
	if (!el) return;
	const self = el;
	self.object = null;
	self.type = null;
	self.data = null;
	self.elements = [] as any;
	self.elements.versionId = 0;
	self.elements.count = 0;
	self.elements.start = -1;
	self.elements.end = -1;
	self.elements.head = null;
	self.elements.foot = null;
	self.selections = [] as any;
	self.selections.count = 0;
	self.start = null;
	self.end = null;
	self.origin = null;
	self.active = null;
	self.flexible = props.flexible || self.hasAttribute('flexible');
	self.inserting = false;
	self.focusing = false;
	self.dragging = null;
	self.history = null;
	self.togglable = false;
	self.height = undefined as any;
	self._paddingTop = undefined as any;
	self.tabIndex = 0;
	Object.defineProperty(self, 'innerHeight', {
		configurable: true,
		get: getInnerHeight
	});
	Object.defineProperty(self, 'paddingTop', {
		configurable: true,
		get: getPaddingTop
	});
	listenDraggingScrollbarEvent(self);
	onElement(self, 'scroll', resize);
	onElement(self, 'focus', listFocus);
	onElement(self, 'blur', listBlur);
	onElement(self, 'keydown', keydown as EventListener);
	onElement(self, 'pointerdown', pointerdown as EventListener);
	onElement(self, 'pointerup', pointerup as EventListener);
	onElement(self, 'doubleclick', doubleclick);
	self.bind = bind;
	self.read = read;
	self.write = write;
	self.update = update;
	self.resize = resize;
	self.updateFlexibleHeight = updateFlexibleHeight;
	self.updateHeadAndFoot = updateHeadAndFoot;
	self.updateOnResize = updateOnResize;
	self.select = select;
	self.selectMultiple = selectMultiple;
	self.selectAll = selectAll;
	self.unselect = unselect;
	self.reselect = reselect;
	self.selectUp = selectUp;
	self.selectDown = selectDown;
	self.selectMultipleUp = selectMultipleUp;
	self.selectMultipleDown = selectMultipleDown;
	self.scrollToSelection = scrollToSelection;
	self.insert = insert;
	self.edit = edit;
	self.toggle = toggle;
	self.enableItems = enableItems;
	self.disableItems = disableItems;
	self.copy = copy;
	self.paste = paste;
	self.delete = delete_;
	self.undo = undo;
	self.redo = redo;
	self.save = save;
	self.clearElements = clearElements;
	self.clear = clear;
	self.listFocus = listFocus;
	self.listBlur = listBlur;
	self.keydown = keydown;
	self.pointerdown = pointerdown;
	self.pointerup = pointerup;
	self.doubleclick = doubleclick;
	self.windowPointerup = windowPointerup;
	self.windowPointermove = windowPointermove;
	self.on = on;
	self.addEventListener('change', () => emit('change', readElement(self)));
});
</script>
