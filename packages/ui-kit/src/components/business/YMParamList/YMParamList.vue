<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { attachApi } from '../../../utils/attach-api';
import {
	addClass,
	attachDoubleclick,
	clamp,
	css,
	dispatchChangeEvent,
	hasClass,
	isInContent,
	read as readElement,
	removeClass,
	getRelativeCoords,
	relate
} from '../../../utils/dom';
import { ParamListHistory } from './param-history';
import { attachScrollListener, type ScrollListenerApi } from './scroll-listener';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const cmdOrCtrlKey = (event: KeyboardEvent): boolean => (isMac ? event.metaKey : event.ctrlKey);

const macRedoKey = (event: KeyboardEvent): boolean =>
	isMac ? event.metaKey && event.shiftKey && event.code === 'KeyZ' : false;

interface ClipboardAdapter {
	write(type: string, data: unknown): void;
	read(type: string): unknown[] | null;
	has(type: string): boolean;
}

interface MenuOptions {
	x?: number;
	y?: number;
	close?: () => void;
	minWidth?: number;
}

interface MenuItem {
	type?: string;
	label?: string;
	accelerator?: string;
	enabled?: boolean;
	checked?: boolean;
	click?: () => void;
}

interface Props {
	id?: string;
	filter?: string;
	group?: string;
	flexible?: boolean;
	historyFactory?: (list: ParamListElement) => ParamHistory;
	menuPopup?: (options: MenuOptions, items: MenuItem[]) => void;
	localize?: (key: string) => string;
	clipboard?: ClipboardAdapter | null;
	ctrl?: (keyName: string) => string;
}

type ParamDataItem = { enabled?: boolean };

type ParamParseItem = { content?: string; class?: string };

type ParamParseResult =
	| string
	| ParamParseItem
	| [string | ParamParseItem, string | ParamParseItem];

interface ParamHistory {
	reset(): void;
	save(data?: unknown): void;
	restore(operation: 'undo' | 'redo'): void;
	canUndo(): boolean;
	canRedo(): boolean;
}

interface ParamObject {
	initialize(list: ParamListElement): void;
	parse(item: unknown, data: unknown[], index: number): ParamParseResult;
	type?: string;
	history?: ParamHistory;
	update?(list: ParamListElement): void;
	target?: ParamListElement;
	open(data?: unknown): void;
	save(): unknown;
	onPaste?(list: ParamListElement, items: unknown[]): void;
}

interface ParamItemElement extends HTMLElement {
	dataValue?: number;
	dataItem?: unknown;
	versionId?: number;
}

interface ParamElements extends Array<ParamItemElement> {
	versionId: number;
	count: number;
	start: number;
	end: number;
	head: HTMLElement | null;
	foot: HTMLElement | null;
}

interface ParamSelections extends Array<ParamItemElement | undefined> {
	count: number;
}

interface ParamListElement extends HTMLElement {
	flexible: boolean;
	height?: number;
	_paddingTop?: number;
	padded?: boolean;
	object: ParamObject;
	type: string | null;
	history: ParamHistory | null;
	data: (ParamDataItem | null)[] | null;
	autoSwitch?: boolean;
	elements: ParamElements;
	selections: ParamSelections;
	start: number | null;
	end: number | null;
	origin: number | null;
	active: number | null;
	inserting: boolean;
	focusing: boolean;
	dragging: DragEventState | null;
	togglable: boolean;
	scrollListener: ScrollListenerApi;
	innerHeight: number;
	paddingTop: number;
	bind(object: ParamObject): HTMLElement;
	read(): (ParamDataItem | null)[] | null;
	write(data: (ParamDataItem | null)[]): void;
	update(): void;
	resize(): void;
	updateFlexibleHeight(): void;
	updateHeadAndFoot(): void;
	updateOnResize(element?: ParamItemElement): void;
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
	enableItems(items: ParamDataItem[]): void;
	disableItems(items: ParamDataItem[]): void;
	copy(): void;
	paste(): void;
	delete(): void;
	undo(): void;
	redo(): void;
	save(): void;
	clearElements(start: number): void;
	clear(): HTMLElement;
	listFocus(event: Event): void;
	listBlur(event: Event): void;
	keydown(event: KeyboardEvent): void;
	pointerdown(event: PointerEvent): void;
	pointerup(event: PointerEvent): void;
	doubleclick(event: Event): void;
	windowPointerup(event: PointerEvent): void;
	windowPointermove(event: PointerEvent): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface DragEventState extends PointerEvent {
	mode?: string;
	itemIndex?: number;
	itemHeight?: number;
	latest?: PointerEvent;
}

const props = withDefaults(defineProps<Props>(), {
	flexible: false,
	historyFactory: null as unknown as (list: ParamListElement) => ParamHistory,
	menuPopup: null as unknown as (options: MenuOptions, items: MenuItem[]) => void,
	localize: null as unknown as (key: string) => string,
	clipboard: null,
	ctrl: null as unknown as (keyName: string) => string
});

const emit = defineEmits<{
	change: [value: unknown];
}>();

const root = ref<HTMLElement | null>(null);

let el: ParamListElement | null = null;

const state = {
	object: null as unknown,
	type: null as string | null,
	data: null as (ParamDataItem | null)[] | null,
	elements: [] as unknown as ParamElements,
	selections: [] as unknown as ParamSelections,
	start: null as number | null,
	end: null as number | null,
	origin: null as unknown,
	active: null as number | null,
	flexible: false,
	inserting: false,
	focusing: false,
	dragging: null as unknown,
	history: null as unknown,
	togglable: false
};

const exposedStateFields = [
	'object',
	'type',
	'data',
	'elements',
	'selections',
	'start',
	'end',
	'origin',
	'active',
	'flexible',
	'inserting',
	'focusing',
	'dragging',
	'history',
	'togglable'
] as const;

const attachStateAccessors = (self: ParamListElement): void => {
	for (const key of exposedStateFields) {
		Object.defineProperty(self, key, {
			configurable: true,
			get: () => state[key],
			set: (value: unknown) => {
				state[key] = value as never;
			}
		});
	}
};

const createHistory = (list: ParamListElement): ParamHistory =>
	props.historyFactory ? props.historyFactory(list) : new ParamListHistory(list);

const getMenuPopup = (): ((options: MenuOptions, items: MenuItem[]) => void) | null =>
	props.menuPopup;

const getLocalize = (): ((key: string) => string) | null => props.localize;

const getClipboard = (): ClipboardAdapter | null => props.clipboard;

const getCtrl = (keyName: string): string => (props.ctrl ? props.ctrl(keyName) : 'Ctrl+' + keyName);

const getInnerHeight = (): number => {
	const self = el!;
	if (self.flexible) {
		return self.height!;
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

const bind = (object: ParamObject): HTMLElement => {
	const self = el!;
	object.initialize(self);
	object.initialize = () => {};
	self.object = object;
	self.type = `yami.${object.type ?? self.id}`;
	self.history = object.history ?? createHistory(self);
	return self;
};

const read = (): (ParamDataItem | null)[] | null => el!.data;

const write = (data: (ParamDataItem | null)[]): void => {
	const self = el!;
	if (self.flexible) {
		self.autoSwitch = true;
	}
	self.data = data;
	update();
	self.history!.reset();
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
				const li = document.createElement('div') as ParamItemElement;
				addClass(li, 'param-item');
				addClass(li, 'one-column');
				Object.defineProperty(li, 'dataValue', {
					configurable: true,
					get: () => i
				});
				Object.defineProperty(li, 'dataItem', {
					configurable: true,
					get: () => item
				});
				li.textContent = result;
				elements[elements.count++] = li;
				continue;
			}
			case 'object': {
				const li = document.createElement('div') as ParamItemElement;
				addClass(li, 'param-item');
				Object.defineProperty(li, 'dataValue', {
					configurable: true,
					get: () => i
				});
				Object.defineProperty(li, 'dataItem', {
					configurable: true,
					get: () => item
				});
				elements[elements.count++] = li;
				if (!Array.isArray(result)) {
					addClass(li, 'one-column');
					li.textContent = result.content!;
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
					text0.textContent = result0.content!;
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
					text1.textContent = result1.content!;
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

	const li = document.createElement('div') as ParamItemElement;
	const unit = length === 1 ? 'item' : 'items';
	addClass(li, 'param-item');
	addClass(li, 'weak');
	Object.defineProperty(li, 'dataValue', {
		configurable: true,
		get: () => length
	});
	Object.defineProperty(li, 'dataItem', {
		configurable: true,
		get: () => null
	});
	li.textContent = `${length} ${unit}`;
	elements[elements.count++] = li;

	clearElements(elements.count);

	updateFlexibleHeight();

	object.update?.(self);

	resize();
};

const resize = (): void => {
	const self = el!;
	const st = self.scrollTop;
	const ch = self.clientHeight;
	const elements = self.elements;
	const count = elements.count;
	if (ch === 0) return;
	if (count === 0) {
		self.textContent = '';
		return;
	}
	const start = Math.min(Math.floor(st / 20), count - 1);
	const length = Math.ceil(ch / 20) + 1;
	const end = Math.min(start + length, count);
	if (elements.start !== start || elements.end !== end) {
		elements.start = start;
		elements.end = end;
		updateHeadAndFoot();
		const versionId = elements.versionId++;
		for (let i = start; i < end; i++) {
			const element = elements[i];
			element.versionId = versionId;
			updateOnResize(element);
		}
		const nodes = self.childNodes;
		const last = nodes.length - 1;
		for (let i = last; i >= 0; i--) {
			const element = nodes[i];
			if ((element as ParamItemElement).versionId !== versionId) {
				element.remove();
			}
		}
		if (elements.foot && !elements.foot.parentNode) {
			self.appendChild(elements.foot);
		}
		for (let i = end - 2; i >= start; i--) {
			const element = elements[i];
			if (element.parentNode === null) {
				const next = elements[i + 1];
				self.insertBefore(element, next);
			}
		}
	}
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
	const self = el!;
	if (self.elements.head) {
		self.elements.head.style.marginTop = '';
		self.elements.head = null;
	}
	if (self.elements.foot) {
		self.elements.foot.style.marginBottom = '';
		self.elements.foot = null;
	}
	const { count, start, end } = self.elements;
	if (count !== 0) {
		const pad = self.padded ? 1 : 0;
		const mt = start * 20;
		const mb = (count - end + pad) * 20;
		self.elements.head = self.elements[start];
		self.elements.head!.style.marginTop = `${mt}px`;
		self.elements.foot = self.elements[end - 1];
		self.elements.foot!.style.marginBottom = `${mb}px`;
	}
};

const updateOnResize = (_element?: ParamItemElement): void => {};

const select = (start: number, end: number = start): void => {
	const self = el!;
	if (start > end) {
		[start, end] = [end, start];
	}

	const elements = self.elements;
	const count = elements.count;
	start = clamp(start, 0, count - 1);
	end = clamp(end, 0, count - 1);
	if (start !== end) {
		const element = elements[end];
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
	self.active = clamp(active, self.start!, self.end!);
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
		const scrollTop = clamp(
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
		const element = elements[self.start];
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
		const items: ParamDataItem[] = [];
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
			self.history!.save({
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

const enableItems = (items: ParamDataItem[]): void => {
	for (const item of items) {
		item.enabled = true;
	}
};

const disableItems = (items: ParamDataItem[]): void => {
	for (const item of items) {
		item.enabled = false;
	}
};

const copy = (): void => {
	const self = el!;
	const clipboard = getClipboard();
	if (!clipboard) return;
	if (self.start !== null) {
		const data = self.data!;
		const start = self.start;
		const end = self.end! + 1;
		const copies = data.slice(start, end);
		if (copies.length > 0) {
			clipboard.write(self.type!, copies);
		}
	}
};

const paste = (): void => {
	const self = el!;
	const clipboard = getClipboard();
	if (!clipboard) return;
	if (self.start !== null) {
		const copies = clipboard.read(self.type!);
		if (copies) {
			const data = self.data!;
			const start = self.start;
			self.history!.save({
				type: 'insert',
				array: data,
				index: start,
				items: copies
			});
			self.object.onPaste?.(self, copies);
			data.splice(start, 0, ...(copies as ParamDataItem[]));
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
			self.history!.save({
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
	if (!self.dragging && self.history!.canUndo()) {
		self.history!.restore('undo');
	}
};

const redo = (): void => {
	const self = el!;
	if (!self.dragging && self.history!.canRedo()) {
		self.history!.restore('redo');
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
				self.history!.save({
					type: 'insert',
					array: data,
					index: start,
					items: [item]
				});
				data.splice(start, 0, item as ParamDataItem);
				update();
				select(start + data.length - length);
				break;
			case false:
				self.history!.save({
					type: 'replace',
					array: data,
					index: start,
					swap: data[start]
				});
				data[start] = item as ParamDataItem;
				update();
				select(start);
				break;
		}
		scrollToSelection();
		dispatchChangeEvent(self);
	}
};

const clearElements = (start: number): void => {
	const self = el!;
	let i = start;
	while (self.elements[i] !== undefined) {
		self.elements[i++] = undefined as never;
	}
};

const clear = (): HTMLElement => {
	const self = el!;
	unselect();
	self.textContent = '';
	self.data = null;
	self.start = null;
	self.end = null;
	self.history!.reset();
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
		let element: Node | null = self;
		while ((element = element.parentNode)) {
			if (element.nodeType !== Node.ELEMENT_NODE) {
				continue;
			}
			if ((element as HTMLElement).classList.contains('window-frame')) {
				if (hasClass(element as HTMLElement, 'blur')) {
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
	if (cmdOrCtrlKey(event)) {
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
				if (!macRedoKey(event)) {
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
					index = readElement(element) as number;
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
				(event as DragEventState).mode = 'select';
				(event as DragEventState).itemIndex = index;
				(event as DragEventState).itemHeight = element.clientHeight;
				window.addEventListener('pointerup', self.windowPointerup);
				window.addEventListener('pointermove', self.windowPointermove);
				self.scrollListener.addScrollListener('vertical', 2, true, () => {
					windowPointermove((event as DragEventState).latest!);
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
					index = readElement(element) as number;
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
				const element = elements[self.start];
				const valid = !!element.dataItem;
				const editable = self.start === self.end;
				const pastable = !!getClipboard()?.has(self.type!);
				const allSelectable = self.data!.length > 0;
				const undoable = self.history!.canUndo();
				const redoable = self.history!.canRedo();
				const get = getLocalize() ?? ((key: string) => key);
				const menuItems: MenuItem[] = [
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
						accelerator: getCtrl('X'),
						enabled: valid,
						click: () => {
							copy();
							delete_();
						}
					},
					{
						label: get('copy'),
						accelerator: getCtrl('C'),
						enabled: valid,
						click: () => {
							copy();
						}
					},
					{
						label: get('paste'),
						accelerator: getCtrl('V'),
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
						accelerator: getCtrl('A'),
						enabled: allSelectable,
						click: () => {
							select(0, Infinity);
						}
					},
					{
						label: get('undo'),
						accelerator: getCtrl('Z'),
						enabled: undoable,
						click: () => {
							undo();
						}
					},
					{
						label: get('redo'),
						accelerator: getCtrl('Y'),
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
				getMenuPopup()?.(
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
	if (dragging && relate(dragging, event)) {
		if (dragging.mode === 'select') {
			self.scrollListener.removeScrollListener();
		}
		self.dragging = null;
		window.removeEventListener('pointerup', windowPointerup);
		window.removeEventListener('pointermove', windowPointermove);
	}
};

const windowPointermove = (event: PointerEvent): void => {
	const self = el!;
	const { dragging } = self;
	if (dragging && relate(dragging, event)) {
		if (dragging.mode === 'select') {
			dragging.latest = event;
			const elements = self.elements;
			const count = elements.count;
			if (count > 0) {
				const pt = self.paddingTop;
				const { itemHeight } = dragging;
				const { y } = getRelativeCoords(event, self);
				const line = Math.floor((y - pt) / itemHeight!);
				const index = clamp(line, 0, count - 1);
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
	listener: (event: Event) => void,
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
	el = root.value as ParamListElement | null;
	if (!el) return;
	const self = el;
	attachStateAccessors(self);
	self.object = null as unknown as ParamObject;
	self.type = null;
	self.data = null;
	self.elements = [] as unknown as ParamElements;
	self.elements.versionId = 0;
	self.elements.count = 0;
	self.elements.start = -1;
	self.elements.end = -1;
	self.elements.head = null;
	self.elements.foot = null;
	self.selections = [] as unknown as ParamSelections;
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
	self.height = undefined;
	self._paddingTop = undefined;
	Object.defineProperty(self, 'innerHeight', {
		configurable: true,
		get: getInnerHeight
	});
	Object.defineProperty(self, 'paddingTop', {
		configurable: true,
		get: getPaddingTop
	});
	self.scrollListener = attachScrollListener(self);
	self.addEventListener('scroll', resize);
	self.addEventListener('focus', listFocus);
	self.addEventListener('blur', listBlur);
	self.addEventListener('keydown', keydown as EventListener);
	self.addEventListener('pointerdown', pointerdown as EventListener);
	self.addEventListener('pointerup', pointerup as EventListener);
	attachDoubleclick(self, doubleclick);
	attachApi(self, {
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
		listFocus,
		listBlur,
		keydown,
		pointerdown,
		pointerup,
		doubleclick,
		windowPointerup,
		windowPointermove,
		on
	});
	self.addEventListener('change', () => emit('change', readElement(self)));
});
</script>

<template>
	<div ref="root" class="param-list" :id="props.id" tabindex="0" :filter="props.filter || undefined" :group="props.group || undefined" />
</template>

<style module>
:global(:where(.param-list)) {
	display: block;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	user-select: none;
}

:global(:where(.param-item)) {
	display: block;
	position: relative;
	height: 20px;
	line-height: 20px;
	white-space: pre;
	text-overflow: ellipsis;
}

:global(:where(.param-item.selected)) {
	color: var(--ym-color-on-primary);
	background-color: var(--ym-color-selected);
}

:global(:where(.param-item.weak)) {
	color: var(--ym-color-text-disabled);
}
</style>
