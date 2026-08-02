import {
	addClass,
	on,
	removeClass,
	hasClass,
	show,
	hide,
	enable,
	disable,
	dispatchChangeEvent,
	hideChildNodes,
	showChildNodes,
	setTooltip
} from '@/util/element-utils.ts';
import { Select } from './select-list.ts';
import { Local } from '@/tools/localization.ts';

export class SelectBox extends HTMLElement {
	info: HTMLElement & { [k: string]: any };
	dataItems: any[];
	dataValue: any;
	relations: any[];
	invalid: boolean;
	hideUnrelated: boolean;
	savedValue: any;
	originalTip: string = '';
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	_initialized: boolean;

	constructor() {
		super();

		const text = document.createElement('text');
		addClass(text, 'select-box-text');
		this.info = text;
		this.dataItems = [];
		this.dataValue = null;
		this.relations = [];
		this.invalid = false;
		this.hideUnrelated = false;
		this.writeEventEnabled = false;
		this.inputEventEnabled = false;
		this._initialized = false;

		on(this, 'keydown', this.keydown);
		on(this, 'pointerdown', this.pointerdown);
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
		this.appendChild(this.info);
		this.tabIndex = 0;
	}

	read() {
		return this.dataValue;
	}

	write(value: any) {
		this.dataValue = value;
		this.update();
		if (!hasClass(this, 'disabled')) {
			this.toggleRelatedElements();
		}
		if (this.writeEventEnabled) {
			const write = new Event('write');
			write.value = this.dataValue;
			this.dispatchEvent(write);
		}
	}

	write2(value: any) {
		for (const item of this.dataItems) {
			if (item.value === value) {
				this.write(value);
				return;
			}
		}
		this.writeDefault();
	}

	writeDefault() {
		this.write(this.dataItems[0]?.value);
	}

	input(value: any) {
		const last = this.dataValue;
		if (last !== value) {
			this.write(value);
			if (this.inputEventEnabled) {
				const input = new Event('input', { bubbles: true });
				input.last = last;
				input.value = this.dataValue;
				this.dispatchEvent(input);
			}
			dispatchChangeEvent(this);
		}
	}

	update() {
		const info = this.info;
		const value = this.dataValue;
		const items = this.dataItems;
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
			this.invalid = false;
			removeClass(info, 'invalid');
			info.textContent = name;
		} else {
			this.invalid = true;
			addClass(info, 'invalid');
			info.textContent = value;
		}
	}

	reselect(offset: any) {
		const value = this.dataValue;
		const items = this.dataItems;
		const length = items.length;
		for (let i = 0; i < length; i++) {
			if (items[i].value === value) {
				const index = i + offset;
				if (index >= 0 && index < length) {
					this.input(items[index].value);
				}
				return;
			}
		}
		const index = offset > 0 ? 0 : length - 1;
		this.input(items[index].value);
	}

	save() {
		this.savedValue = this.read();
	}

	restore() {
		if (this.savedValue !== undefined) {
			this.input(this.savedValue);
			delete this.savedValue;
		}
	}

	enable() {
		if (removeClass(this, 'disabled')) {
			this.tabIndex += 1;
			showChildNodes(this);
			this.toggleRelatedElements();
		}
	}

	disable() {
		if (addClass(this, 'disabled')) {
			this.tabIndex -= 1;
			hideChildNodes(this);
			this.toggleRelatedElements();
		}
	}

	loadItems(items: any) {
		this.dataItems = items;
		if (this.dataValue !== null && this.dataValue !== undefined) {
			this.update();
		}
	}

	setItemNames(options: any) {
		for (const item of this.dataItems) {
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
		if (this.dataValue !== null) {
			this.update();
		}

		this.createTooltip();
	}

	setTooltip(tip: any) {
		this.originalTip = tip;
		setTooltip(this, tip);
	}

	createTooltip() {
		let tip = this.originalTip ?? '';
		let options = '';
		for (const item of this.dataItems) {
			if (item.tip) {
				options += item.tip + '\n';
			}
		}
		// 如果不存在选择框工具提示但是存在选项工具提示，添加标签名称
		if (tip === '' && options !== '') {
			const prev = this.previousElementSibling;
			if (prev?.tagName === 'TEXT') {
				tip += `<b>${prev.textContent}</b>`;
			}
		}
		if (tip !== '' && options !== '') {
			tip += '<tooltip-line></tooltip-line>';
		}
		tip += options;
		if (tip !== '') {
			setTooltip(this, tip.trim());
		}
	}

	clear() {
		this.dataItems = null as any;
		this.dataValue = null;
		this.info.textContent = '';
		return this;
	}

	enableHiddenMode() {
		this.hideUnrelated = true;
		return this;
	}

	relate(entries: any) {
		this.relations = entries;
	}

	toggleRelatedElements() {
		if (this.relations.length !== 0) {
			if (!hasClass(this, 'disabled')) {
				const entries = this.relations;
				const value = this.dataValue;
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
							this.disableElement(element);
						}
					}
				}
				// 延后启用元素避免可能被禁用的情况
				for (const entry of deferredList) {
					for (const element of entry.targets) {
						this.enableElement(element);
					}
				}
			} else {
				const entries = this.relations;
				for (const entry of entries) {
					for (const element of entry.targets) {
						this.disableElement(element);
					}
				}
			}
		}
	}

	enableElement(element: any) {
		if (typeof element.enable === 'function') {
			element.enable();
		} else {
			enable(element);
		}
		if (this.hideUnrelated) {
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

	disableElement(element: any) {
		if (typeof element.disable === 'function') {
			element.disable();
		} else {
			disable(element);
		}
		if (this.hideUnrelated) {
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

	on = (
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void => {
		super.addEventListener(type, listener, options);
		switch (type) {
			case 'write':
				this.writeEventEnabled = true;
				break;
			case 'input':
				this.inputEventEnabled = true;
				break;
		}
	};

	keydown(event: any) {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
					Select.open(this);
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				event.stopPropagation();
				this.reselect(-1);
				break;
			case 'ArrowDown':
				event.preventDefault();
				event.stopPropagation();
				this.reselect(1);
				break;
		}
	}

	pointerdown(event: any) {
		switch (event.button) {
			case 0:
				Select.open(this);
				break;
		}
	}
}

customElements.define('select-box', SelectBox);
