import { elementDataOf } from '../../../utils/element-data';
import { createPayloadEvent } from '../../../utils/payload-event';
export interface SelectItem {
	value: unknown;
	name?: string;
	tip?: string;
	[k: string]: unknown;
}

export interface RelationEntry {
	case: unknown;
	targets: HTMLElement[];
}

export type ToggleableElement = HTMLElement & { enable?: () => void; disable?: () => void };

export interface SelectBoxCoreState {
	dataItems: SelectItem[] | null;
	dataValue: unknown;
	relations: RelationEntry[];
	invalid: boolean;
	hideUnrelated: boolean;
	savedValue: unknown;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
}

export interface SelectBoxCoreAccess {
	getRoot: () => HTMLElement | null;
	getInfo: () => HTMLElement | null;
}

export interface SelectBoxCoreHooks {
	onItemsLoaded?: () => void;
}

export interface SelectBoxCore {
	read: () => unknown;
	write: (value: unknown) => void;
	write2: (value: unknown) => void;
	writeDefault: () => void;
	input: (value: unknown) => void;
	update: () => void;
	reselect: (offset: number) => void;
	save: () => void;
	restore: () => void;
	enable: () => void;
	disable: () => void;
	loadItems: (items: unknown[]) => void;
	setItemNames: (options: Record<string, string | { name?: string; tip?: string }>) => void;
	clear: () => void;
	enableHiddenMode: () => void;
	relate: (entries: unknown) => void;
	toggleRelatedElements: () => void;
	enableElement: (element: ToggleableElement) => void;
	disableElement: (element: ToggleableElement) => void;
	on: (
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
}

const subtract = <T>(a: T[], b: T[]): T[] => a.filter((x) => !b.includes(x));

export function createSelectBoxCore(
	access: SelectBoxCoreAccess,
	state: SelectBoxCoreState,
	hooks: SelectBoxCoreHooks = {}
): SelectBoxCore {
	const getRoot = (): HTMLElement | null => access.getRoot();
	const getInfo = (): HTMLElement | null => access.getInfo();

	const read = (): unknown => state.dataValue;

	const toggleRelatedElements = (): void => {
		const root = getRoot();
		if (!root || state.relations.length === 0) return;
		if (!root.classList.contains('disabled')) {
			const entries = state.relations;
			const value = state.dataValue;
			const selection = entries.find((entry) =>
				entry.case instanceof Array ? entry.case.includes(value) : entry.case === value
			);
			const deferredList: RelationEntry[] = [];
			for (const entry of entries) {
				if (
					entry.case instanceof Array ? entry.case.includes(value) : entry.case === value
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
			for (const entry of state.relations) {
				for (const element of entry.targets) {
					disableElement(element);
				}
			}
		}
	};

	const setRelatedDisplay = (element: ToggleableElement, display: string): void => {
		if (state.hideUnrelated) {
			let node = element.previousSibling;
			while (node instanceof Text) {
				node = node.previousSibling;
			}
			if (node instanceof Element && node.classList.contains('text')) {
				(node as HTMLElement).style.display = display;
			}
			element.style.display = display;
		}
	};

	const enableElement = (element: ToggleableElement): void => {
		if (!element) return;
		if (typeof element.enable === 'function') {
			element.enable();
		} else {
			element.classList.remove('disabled');
		}
		setRelatedDisplay(element, '');
	};

	const disableElement = (element: ToggleableElement): void => {
		if (!element) return;
		if (typeof element.disable === 'function') {
			element.disable();
		} else {
			element.classList.add('disabled');
		}
		setRelatedDisplay(element, 'none');
	};

	const update = (): void => {
		const infoEl = getInfo();
		const value = state.dataValue;
		const items = state.dataItems ?? [];
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
			state.invalid = false;
			infoEl?.classList.remove('invalid');
			if (infoEl) infoEl.textContent = name;
		} else {
			state.invalid = true;
			infoEl?.classList.add('invalid');
			if (infoEl) infoEl.textContent = String(value);
		}
		const root = getRoot();
		// P4b：`invalid` 走显式元素数据（字段已从 DATA_FIELDS 摘除）
		if (root) elementDataOf<{ invalid?: boolean }>(root).invalid = state.invalid;
	};

	const write = (value: unknown): void => {
		const root = getRoot();
		state.dataValue = value;
		update();
		if (root && !root.classList.contains('disabled')) {
			toggleRelatedElements();
		}
		if (state.writeEventEnabled) {
			const writeEvent = createPayloadEvent('write', {} as { value?: unknown });
			writeEvent.value = state.dataValue;
			root?.dispatchEvent(writeEvent);
		}
	};

	const write2 = (value: unknown): void => {
		for (const item of state.dataItems ?? []) {
			if (item.value === value) {
				write(value);
				return;
			}
		}
		writeDefault();
	};

	const writeDefault = (): void => {
		write((state.dataItems ?? [])[0]?.value);
	};

	const input = (value: unknown): void => {
		const root = getRoot();
		const last = state.dataValue;
		if (last !== value) {
			write(value);
			if (state.inputEventEnabled) {
				const inputEvent = createPayloadEvent('input', {} as {
					last?: unknown;
					value?: unknown;
				}, { bubbles: true });
				inputEvent.last = last;
				inputEvent.value = state.dataValue;
				root?.dispatchEvent(inputEvent);
			}
			root?.dispatchEvent(new Event('change', { bubbles: true }));
		}
	};

	const reselect = (offset: number): void => {
		const value = state.dataValue;
		const items = state.dataItems ?? [];
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
		state.savedValue = read();
	};

	const restore = (): void => {
		if (state.savedValue !== undefined) {
			input(state.savedValue);
			state.savedValue = undefined;
		}
	};

	const showChildNodes = (): void => {
		const root = getRoot();
		if (!root) return;
		for (const child of Array.from(root.children)) {
			(child as HTMLElement).style.display = '';
		}
	};

	const hideChildNodes = (): void => {
		const root = getRoot();
		if (!root) return;
		for (const child of Array.from(root.children)) {
			(child as HTMLElement).style.display = 'none';
		}
	};

	const enable = (): void => {
		const root = getRoot();
		if (!root) return;
		const wasDisabled = root.classList.contains('disabled');
		root.classList.remove('disabled');
		if (wasDisabled) {
			root.tabIndex += 1;
			showChildNodes();
			toggleRelatedElements();
		}
	};

	const disable = (): void => {
		const root = getRoot();
		if (!root) return;
		const wasEnabled = !root.classList.contains('disabled');
		root.classList.add('disabled');
		if (wasEnabled) {
			root.tabIndex -= 1;
			hideChildNodes();
			toggleRelatedElements();
		}
	};

	const loadItems = (items: unknown[]): void => {
		const list = state.dataItems ?? [];
		state.dataItems = list;
		list.splice(0, list.length, ...(items as SelectItem[]));
		if (state.dataValue !== null && state.dataValue !== undefined) {
			update();
		}
		hooks.onItemsLoaded?.();
	};

	const setItemNames = (
		options: Record<string, string | { name?: string; tip?: string }>
	): void => {
		const items = state.dataItems;
		if (!items) return;
		for (const item of items) {
			const key = item.value;
			const option = options[key as string];
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
		if (state.dataValue !== null) {
			update();
		}
	};

	const clear = (): void => {
		const items = state.dataItems;
		if (items) items.splice(0, items.length);
		state.dataValue = null;
		const infoEl = getInfo();
		if (infoEl) infoEl.textContent = '';
	};

	const enableHiddenMode = (): void => {
		state.hideUnrelated = true;
	};

	const relate = (entries: unknown): void => {
		state.relations = entries as RelationEntry[];
	};

	const on = (
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void => {
		const root = getRoot();
		if (!root) return;
		root.addEventListener(type, listener as EventListener, options);
		switch (type) {
			case 'write':
				state.writeEventEnabled = true;
				break;
			case 'input':
				state.inputEventEnabled = true;
				break;
		}
	};

	return {
		read,
		write,
		write2,
		writeDefault,
		input,
		update,
		reselect,
		save,
		restore,
		enable,
		disable,
		loadItems,
		setItemNames,
		clear,
		enableHiddenMode,
		relate,
		toggleRelatedElements,
		enableElement,
		disableElement,
		on
	};
}
