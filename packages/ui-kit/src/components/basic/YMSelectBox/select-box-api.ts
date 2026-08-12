export interface SelectBoxApiOptions {
	id?: string;
	modelValue?: unknown;
	items?: unknown[];
	disabled?: boolean;
	popup?: boolean | ((box: SelectBoxApi) => void);
}

export interface SelectItem {
	value: unknown;
	name?: string;
	tip?: string;
	[k: string]: unknown;
}

export interface RelationEntry {
	case: unknown | unknown[];
	targets: HTMLElement[];
}

type ToggleableElement = HTMLElement & { enable?: () => void; disable?: () => void };

export type SelectBoxApi = HTMLElement & {
	info: HTMLElement;
	dataItems: SelectItem[];
	dataValue: unknown;
	relations: RelationEntry[];
	invalid: boolean;
	hideUnrelated: boolean;
	savedValue: unknown;
	originalTip: string;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	_initialized: boolean;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): unknown;
	write2(value: unknown): void;
	writeDefault(): void;
	input(...args: unknown[]): unknown;
	update(...args: unknown[]): unknown;
	reselect(...args: unknown[]): unknown;
	save(): void;
	restore(): void;
	enable(...args: unknown[]): unknown;
	disable(...args: unknown[]): unknown;
	loadItems(...args: unknown[]): unknown;
	setItemNames(options: Record<string, string | { name?: string; tip?: string }>): void;
	clear(...args: unknown[]): unknown;
	enableHiddenMode(): SelectBoxApi;
	relate(...args: unknown[]): unknown;
	toggleRelatedElements(): void;
	enableElement(element: ToggleableElement): void;
	disableElement(element: ToggleableElement): void;
	on(...args: unknown[]): unknown;
	keydown(event: KeyboardEvent): void;
	pointerdown(event: PointerEvent): void;
	closePopup(): void;
};

const subtract = <T>(a: T[], b: T[]): T[] => a.filter((x) => !b.includes(x));

export function attachSelectBoxApi(
	el: HTMLElement,
	options: SelectBoxApiOptions = {}
): SelectBoxApi {
	const box = el as SelectBoxApi;
	if (box._initialized) return box;

	const popupEnabled = options.popup ?? true;
	const popupHandler = typeof options.popup === 'function' ? options.popup : null;

	const text = document.createElement('div');
	text.className = 'select-box-text';
	box.appendChild(text);
	box.info = text;
	box.tabIndex = 0;

	const dataItems: SelectItem[] = (options.items ?? []) as SelectItem[];
	let dataValue: unknown = options.modelValue ?? null;
	let relations: RelationEntry[] = [];
	let invalid = false;
	let hideUnrelated = false;
	let savedValue: unknown = undefined;
	let writeEventEnabled = false;
	let inputEventEnabled = false;

	const toggleRelatedElements = (): void => {
		if (relations.length !== 0) {
			if (!box.classList.contains('disabled')) {
				const entries = relations;
				const value = dataValue;
				const selection = entries.find((entry) =>
					entry.case instanceof Array ? entry.case.includes(value) : entry.case === value
				);
				const deferredList: RelationEntry[] = [];
				for (const entry of entries) {
					if (
						entry.case instanceof Array
							? entry.case.includes(value)
							: entry.case === value
					) {
						deferredList.push(entry);
					} else {
						for (const element of selection
							? subtract(entry.targets, selection.targets)
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
				for (const entry of relations) {
					for (const element of entry.targets) {
						disableElement(element);
					}
				}
			}
		}
	};

	const enableElement = (element: ToggleableElement): void => {
		if (typeof element.enable === 'function') {
			element.enable();
		} else {
			element.classList?.remove('disabled');
		}
		if (hideUnrelated) {
			let node = element.previousSibling;
			while (node instanceof Text) {
				node = node.previousSibling;
			}
			if (node && (node as HTMLElement).classList?.contains('text')) {
				(node as HTMLElement).style.display = '';
			}
			element.style.display = '';
		}
	};

	const disableElement = (element: ToggleableElement): void => {
		if (typeof element.disable === 'function') {
			element.disable();
		} else {
			element.classList?.add('disabled');
		}
		if (hideUnrelated) {
			let node = element.previousSibling;
			while (node instanceof Text) {
				node = node.previousSibling;
			}
			if (node && (node as HTMLElement).classList?.contains('text')) {
				(node as HTMLElement).style.display = 'none';
			}
			element.style.display = 'none';
		}
	};

	const update = (): void => {
		const value = dataValue;
		const items = dataItems;
		const length = items.length;
		let name: string | undefined;
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.value === value) {
				name = item.name;
				break;
			}
		}
		if (name !== undefined) {
			invalid = false;
			text.classList.remove('invalid');
			text.textContent = name;
		} else {
			invalid = true;
			text.classList.add('invalid');
			text.textContent = String(value);
		}
		box.invalid = invalid;
	};

	const write = (value: unknown): void => {
		dataValue = value;
		box.dataValue = value as string | number | boolean | Record<string, any> | null;
		update();
		if (!box.classList.contains('disabled')) {
			toggleRelatedElements();
		}
		if (writeEventEnabled) {
			const writeEvent = new Event('write') as Event & { value?: unknown };
			writeEvent.value = dataValue;
			box.dispatchEvent(writeEvent);
		}
	};

	const write2 = (value: unknown): void => {
		for (const item of dataItems) {
			if (item.value === value) {
				write(value);
				return;
			}
		}
		writeDefault();
	};

	const writeDefault = (): void => {
		write(dataItems[0]?.value);
	};

	const input = (value: unknown): void => {
		const last = dataValue;
		if (last !== value) {
			write(value);
			if (inputEventEnabled) {
				const inputEvent = new Event('input', { bubbles: true }) as Event & {
					last?: unknown;
					value?: unknown;
				};
				inputEvent.last = last;
				inputEvent.value = dataValue;
				box.dispatchEvent(inputEvent);
			}
			box.dispatchEvent(new Event('change', { bubbles: true }));
		}
	};

	const reselect = (offset: number): void => {
		const value = dataValue;
		const items = dataItems;
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
	};

	const save = (): void => {
		savedValue = read();
	};

	const restore = (): void => {
		if (savedValue !== undefined) {
			input(savedValue);
			savedValue = undefined;
		}
	};

	const showChildNodes = (): void => {
		for (const child of Array.from(box.children)) {
			if (child !== popupEl) (child as HTMLElement).style.display = '';
		}
	};

	const hideChildNodes = (): void => {
		for (const child of Array.from(box.children)) {
			if (child !== popupEl) (child as HTMLElement).style.display = 'none';
		}
	};

	const enable = (): void => {
		const wasDisabled = box.classList.contains('disabled');
		box.classList.remove('disabled');
		if (wasDisabled) {
			box.tabIndex += 1;
			showChildNodes();
			toggleRelatedElements();
		}
	};

	const disable = (): void => {
		const wasEnabled = !box.classList.contains('disabled');
		box.classList.add('disabled');
		if (wasEnabled) {
			box.tabIndex -= 1;
			hideChildNodes();
			closePopup();
			toggleRelatedElements();
		}
	};

	const loadItems = (items: unknown[]): void => {
		dataItems.splice(0, dataItems.length, ...(items as SelectItem[]));
		if (dataValue !== null && dataValue !== undefined) {
			update();
		}
		renderPopup();
	};

	const setItemNames = (
		itemNames: Record<string, string | { name?: string; tip?: string }>
	): void => {
		for (const item of dataItems) {
			const key = item.value;
			const option = itemNames[key as string];
			switch (typeof option) {
				case 'string':
					item.name = option;
					continue;
				case 'object':
					if (option && 'name' in option) {
						item.name = option.name;
					}
					if (option && 'tip' in option) {
						item.tip = typeof option.tip === 'string' ? option.tip : option.name;
					}
					continue;
			}
		}
		if (dataValue !== null) {
			update();
		}
	};

	const clear = (): HTMLElement => {
		dataItems.splice(0, dataItems.length);
		dataValue = null;
		box.dataValue = null;
		text.textContent = '';
		return box;
	};

	const enableHiddenMode = (): SelectBoxApi => {
		hideUnrelated = true;
		return box;
	};

	const relate = (entries: unknown): void => {
		relations = entries as RelationEntry[];
	};

	const on = (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void => {
		box.addEventListener(type, listener as EventListener, listenerOptions);
		switch (type) {
			case 'write':
				writeEventEnabled = true;
				break;
			case 'input':
				inputEventEnabled = true;
				break;
		}
	};

	const read = (): unknown => dataValue;

	let popupEl: HTMLElement | null = null;
	let documentPointerdown: ((event: PointerEvent) => void) | null = null;

	const renderPopup = (): void => {
		if (!popupEl) return;
		popupEl.textContent = '';
		for (const item of dataItems) {
			const row = document.createElement('div');
			row.className = 'select-item';
			if (item.value === dataValue) {
				row.classList.add('selected');
			}
			row.textContent = item.name as string;
			row.addEventListener('pointerdown', (event: PointerEvent) => {
				event.stopPropagation();
				input(item.value);
				closePopup();
			});
			popupEl.appendChild(row);
		}
	};

	const openPopup = (): void => {
		if (popupHandler) {
			popupHandler(box);
			return;
		}
		if (!popupEnabled || box.classList.contains('disabled')) return;
		if (!popupEl) {
			popupEl = document.createElement('div');
			popupEl.className = 'select-popup';
			popupEl.style.position = 'absolute';
			popupEl.style.top = '100%';
			popupEl.style.left = '0';
			popupEl.style.zIndex = '1000';
			popupEl.style.minWidth = '100%';
			popupEl.style.background = 'var(--menu-background, #3c3f41)';
			popupEl.style.border = '1px solid var(--menu-border, #555)';
			box.appendChild(popupEl);
		}
		renderPopup();
		documentPointerdown = (event: PointerEvent) => {
			if (!box.contains(event.target as Node)) {
				closePopup();
			}
		};
		document.addEventListener('pointerdown', documentPointerdown);
	};

	const closePopup = (): void => {
		if (popupEl) {
			popupEl.remove();
			popupEl = null;
		}
		if (documentPointerdown) {
			document.removeEventListener('pointerdown', documentPointerdown);
			documentPointerdown = null;
		}
	};

	const keydown = (event: KeyboardEvent): void => {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!(event.ctrlKey || event.metaKey)) {
					event.stopPropagation();
					openPopup();
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
	};

	const pointerdown = (event: PointerEvent): void => {
		if (event.button !== 0) return;
		openPopup();
	};

	box.dataItems = dataItems;
	box.dataValue = dataValue as string | number | boolean | Record<string, any> | null;
	box.relations = relations;
	box.invalid = invalid;
	box.hideUnrelated = hideUnrelated;
	box.savedValue = savedValue;
	box.writeEventEnabled = writeEventEnabled;
	box.inputEventEnabled = inputEventEnabled;
	box._initialized = true;

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
	box.clear = clear;
	box.enableHiddenMode = enableHiddenMode;
	box.relate = relate;
	box.toggleRelatedElements = toggleRelatedElements;
	box.enableElement = enableElement;
	box.disableElement = disableElement;
	box.on = on;
	box.keydown = keydown;
	box.pointerdown = pointerdown;
	box.closePopup = closePopup;

	box.addEventListener('keydown', keydown as EventListener);
	box.addEventListener('pointerdown', pointerdown as EventListener);

	if (options.items) {
		loadItems(options.items);
	}
	if (options.modelValue !== undefined && options.modelValue !== null) {
		write(options.modelValue);
	}
	if (options.disabled) {
		disable();
	}

	return box;
}

export function createSelectBoxElement(options?: SelectBoxApiOptions): SelectBoxApi {
	const el = document.createElement('div');
	el.className = 'select-box';
	if (options?.id) el.id = options.id;
	return attachSelectBoxApi(el, options);
}
