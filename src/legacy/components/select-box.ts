import {
	addClass,
	on as onElement,
	removeClass,
	hasClass,
	show,
	hide,
	enable as enableUtil,
	disable as disableUtil,
	dispatchChangeEvent,
	hideChildNodes,
	showChildNodes,
	setTooltip as setTooltipElement
} from '@/util/element-utils.ts';
import { Select } from './select-list.ts';
import { Local } from '@/tools/localization.ts';

export interface SelectBoxElement extends HTMLElement {
	info: HTMLElement & { [k: string]: any };
	dataItems: any[];
	dataValue: any;
	relations: any[];
	invalid: boolean;
	hideUnrelated: boolean;
	savedValue: any;
	originalTip: string;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	read(): any;
	write(value: any): void;
	write2(value: any): void;
	writeDefault(): void;
	input(value: any): void;
	update(): void;
	reselect(offset: any): void;
	save(): void;
	restore(): void;
	enable(): void;
	disable(): void;
	loadItems(items: any): void;
	setItemNames(options: any): void;
	setTooltip(tip: any): void;
	createTooltip(): void;
	clear(): HTMLElement;
	enableHiddenMode(): SelectBoxElement;
	relate(entries: any): void;
	toggleRelatedElements(): void;
	enableElement(element: any): void;
	disableElement(element: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	keydown(event: any): void;
	pointerdown(event: any): void;
}

export function selectBoxSetItemNames(box: SelectBoxElement, options: any): void {
	for (const item of box.dataItems) {
		const key = item.value;
		const option = options[key];
		switch (typeof option) {
			case 'string':
				item.name = option;
				continue;
			case 'object':
				if ('name' in option) {
					item.name = option.name;
				}
				if ('tip' in option) {
					item.tip = (Local.parseTip as any)(option.tip, option.name);
				}
				continue;
		}
	}
	if (box.dataValue !== null) {
		box.update();
	}
	box.createTooltip();
}

export function attachSelectBoxApi(el: HTMLElement): void {
	const box = el as SelectBoxElement;

	const text = document.createElement('div');
	addClass(text, 'select-box-text');
	box.info = text;
	box.dataItems = [];
	box.dataValue = null;
	box.relations = [];
	box.invalid = false;
	box.hideUnrelated = false;
	box.writeEventEnabled = false;
	box.inputEventEnabled = false;
	box.savedValue = undefined;
	box.originalTip = '';

	el.appendChild(text);
	el.tabIndex = 0;

	onElement(el, 'keydown', keydown);
	onElement(el, 'pointerdown', pointerdown);

	function read(): any {
		return box.dataValue;
	}

	function write(value: any): void {
		box.dataValue = value;
		update();
		if (!hasClass(el, 'disabled')) {
			toggleRelatedElements();
		}
		if (box.writeEventEnabled) {
			const write = new Event('write');
			write.value = box.dataValue;
			el.dispatchEvent(write);
		}
	}

	function write2(value: any): void {
		for (const item of box.dataItems) {
			if (item.value === value) {
				write(value);
				return;
			}
		}
		writeDefault();
	}

	function writeDefault(): void {
		write(box.dataItems[0]?.value);
	}

	function input(value: any): void {
		const last = box.dataValue;
		if (last !== value) {
			write(value);
			if (box.inputEventEnabled) {
				const input = new Event('input', { bubbles: true });
				input.last = last;
				input.value = box.dataValue;
				el.dispatchEvent(input);
			}
			dispatchChangeEvent(el);
		}
	}

	function update(): void {
		const info = box.info;
		const value = box.dataValue;
		const items = box.dataItems;
		const length = items.length;
		let name;
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.value === value) {
				name = item.name;
				break;
			}
		}
		if (name !== undefined) {
			box.invalid = false;
			removeClass(info, 'invalid');
			info.textContent = name;
		} else {
			box.invalid = true;
			addClass(info, 'invalid');
			info.textContent = value;
		}
	}

	function reselect(offset: any): void {
		const value = box.dataValue;
		const items = box.dataItems;
		const length = items.length;
		for (let i = 0; i < length; i++) {
			if (items[i].value === value) {
				const index = i + offset;
				if (index >= 0 && index < length) {
					input(items[index].value);
				}
				return;
			}
		}
		const index = offset > 0 ? 0 : length - 1;
		input(items[index].value);
	}

	function save(): void {
		box.savedValue = read();
	}

	function restore(): void {
		if (box.savedValue !== undefined) {
			input(box.savedValue);
			delete box.savedValue;
		}
	}

	function enable(): void {
		if (removeClass(el, 'disabled')) {
			el.tabIndex += 1;
			showChildNodes(el);
			toggleRelatedElements();
		}
	}

	function disable(): void {
		if (addClass(el, 'disabled')) {
			el.tabIndex -= 1;
			hideChildNodes(el);
			toggleRelatedElements();
		}
	}

	function loadItems(items: any): void {
		box.dataItems = items;
		if (box.dataValue !== null && box.dataValue !== undefined) {
			update();
		}
	}

	function setItemNames(options: any): void {
		selectBoxSetItemNames(box, options);
	}

	function setTooltip(tip: any): void {
		box.originalTip = tip;
		setTooltipElement(el, tip);
	}

	function createTooltip(): void {
		let tip = box.originalTip ?? '';
		let options = '';
		for (const item of box.dataItems) {
			if (item.tip) {
				options += item.tip + '\n';
			}
		}
		if (tip === '' && options !== '') {
			const prev = el.previousElementSibling;
			if (prev?.tagName === 'TEXT') {
				tip += `<b>${prev.textContent}</b>`;
			}
		}
		if (tip !== '' && options !== '') {
			tip += '<tooltip-line></tooltip-line>';
		}
		tip += options;
		if (tip !== '') {
			setTooltipElement(el, tip.trim());
		}
	}

	function clear(): HTMLElement {
		box.dataItems = null as any;
		box.dataValue = null;
		box.info.textContent = '';
		return el;
	}

	function enableHiddenMode(): SelectBoxElement {
		box.hideUnrelated = true;
		return el as SelectBoxElement;
	}

	function relate(entries: any): void {
		box.relations = entries;
	}

	function toggleRelatedElements(): void {
		if (box.relations.length !== 0) {
			if (!hasClass(el, 'disabled')) {
				const entries = box.relations;
				const value = box.dataValue;
				const selection = entries.find((entry) =>
					entry.case instanceof Array ? entry.case.includes(value) : entry.case === value
				);
				const deferredList = [];
				for (const entry of entries) {
					if (
						entry.case instanceof Array
							? entry.case.includes(value)
							: entry.case === value
					) {
						deferredList.push(entry);
					} else {
						for (const element of selection
							? Array.subtract(entry.targets, selection.targets)
							: entry.targets) {
							disableElement(element);
						}
					}
				}
				for (const entry of deferredList) {
					for (const element of entry.targets) {
						enableElement(element);
					}
				}
			} else {
				const entries = box.relations;
				for (const entry of entries) {
					for (const element of entry.targets) {
						disableElement(element);
					}
				}
			}
		}
	}

	function enableElement(element: any): void {
		if (typeof element.enable === 'function') {
			element.enable();
		} else {
			enableUtil(element);
		}
		if (box.hideUnrelated) {
			let node = element.previousSibling;
			while (node instanceof Text) {
				node = node.previousSibling;
			}
			if (node.tagName === 'TEXT') {
				show(node);
			}
			show(element);
		}
	}

	function disableElement(element: any): void {
		if (typeof element.disable === 'function') {
			element.disable();
		} else {
			disableUtil(element);
		}
		if (box.hideUnrelated) {
			let node = element.previousSibling;
			while (node instanceof Text) {
				node = node.previousSibling;
			}
			if (node.tagName === 'TEXT') {
				hide(node);
			}
			hide(element);
		}
	}

	function onEvent(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		el.addEventListener(type, listener as EventListener, options);
		switch (type) {
			case 'write':
				box.writeEventEnabled = true;
				break;
			case 'input':
				box.inputEventEnabled = true;
				break;
		}
	}

	function keydown(event: any): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
					Select.open(box);
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				event.stopPropagation();
				reselect(-1);
				break;
			case 'ArrowDown':
				event.preventDefault();
				event.stopPropagation();
				reselect(1);
				break;
		}
	}

	function pointerdown(event: any): void {
		switch (event.button) {
			case 0:
				Select.open(box);
				break;
		}
	}

	box.read = read;
	box.write = write;
	box.write2 = write2;
	box.writeDefault = writeDefault;
	box.input = input;
	box.update = update;
	box.reselect = reselect;
	box.save = save;
	box.restore = restore;
	box.enable = enable;
	box.disable = disable;
	box.loadItems = loadItems;
	box.setItemNames = setItemNames;
	box.setTooltip = setTooltip;
	box.createTooltip = createTooltip;
	box.clear = clear;
	box.enableHiddenMode = enableHiddenMode;
	box.relate = relate;
	box.toggleRelatedElements = toggleRelatedElements;
	box.enableElement = enableElement;
	box.disableElement = disableElement;
	box.on = onEvent;
	box.keydown = keydown;
	box.pointerdown = pointerdown;
}

export function createSelectBox(): SelectBoxElement {
	const el = document.createElement('div');
	addClass(el, 'select-box');
	attachSelectBoxApi(el);
	return el as unknown as SelectBoxElement;
}
