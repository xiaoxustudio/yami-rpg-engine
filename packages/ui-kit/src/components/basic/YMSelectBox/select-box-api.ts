import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import { attachApi } from '../../../utils/attach-api';
import {
	createSelectBoxCore,
	type RelationEntry,
	type SelectBoxCoreState,
	type SelectItem,
	type ToggleableElement
} from './select-box-core';

export type { RelationEntry, SelectItem } from './select-box-core';

export interface SelectBoxApiOptions {
	id?: string;
	modelValue?: unknown;
	items?: unknown[];
	disabled?: boolean;
	popup?: boolean | ((box: SelectBoxApi) => void);
}

export type SelectBoxApi = HTMLElement & {
	dataItems: SelectItem[];
	dataValue: unknown;
	relations: RelationEntry[];
	invalid: boolean;
	hideUnrelated: boolean;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
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

export function attachSelectBoxApi(
	el: HTMLElement,
	options: SelectBoxApiOptions = {}
): SelectBoxApi {
	const box = el as SelectBoxApi;
	if (isApiAttached(box)) return box;

	const popupEnabled = options.popup ?? true;
	const popupHandler = typeof options.popup === 'function' ? options.popup : null;

	const text = document.createElement('div');
	text.className = 'select-box-text';
	box.appendChild(text);
	// info now lives in element data (field removed from DATA_FIELDS)
	const infoData = elementDataOf<{ info: HTMLElement }>(box);
	infoData.info = text;
	box.tabIndex = 0;

	const state: SelectBoxCoreState = {
		dataItems: (options.items ?? []) as SelectItem[],
		dataValue: options.modelValue ?? null,
		relations: [],
		invalid: false,
		hideUnrelated: false,
		savedValue: undefined,
		writeEventEnabled: false,
		inputEventEnabled: false
	};

	let popupEl: HTMLElement | null = null;
	let documentPointerdown: ((event: PointerEvent) => void) | null = null;

	const core = createSelectBoxCore({ getRoot: () => box, getInfo: () => infoData.info }, state, {
		onItemsLoaded: () => renderPopup()
	});
	const {
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
		loadItems,
		setItemNames,
		relate,
		toggleRelatedElements,
		enableElement,
		disableElement,
		on
	} = core;

	const renderPopup = (): void => {
		if (!popupEl) return;
		popupEl.textContent = '';
		for (const item of state.dataItems ?? []) {
			const row = document.createElement('div');
			row.className = 'select-item';
			if (item.value === state.dataValue) {
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

	const disable = (): void => {
		core.disable();
		closePopup();
	};

	const clear = (): HTMLElement => {
		core.clear();
		return box;
	};

	const enableHiddenMode = (): SelectBoxApi => {
		core.enableHiddenMode();
		return box;
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

	elementDataOf<SelectBoxApi>(box).dataItems = state.dataItems as SelectItem[];
	Object.defineProperty(box, 'dataValue', {
		configurable: true,
		get: () => state.dataValue,
		set: (value: unknown) => {
			state.dataValue = value;
		}
	});
	// `invalid` 走显式元素数据（字段已从 DATA_FIELDS 摘除）
	elementDataOf<{ invalid?: boolean }>(box).invalid = state.invalid;
	box.hideUnrelated = state.hideUnrelated;
	// 删掉 `box.savedValue = state.savedValue` 的镜像（全仓无人读取元素上的 savedValue；
	// 真正的 saved/restore 状态在 core 的 `state` 里）
	box.writeEventEnabled = state.writeEventEnabled;
	box.inputEventEnabled = state.inputEventEnabled;
	markApiAttached(box);

	attachApi<SelectBoxApi>(box, {
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
		on,
		keydown,
		pointerdown,
		closePopup
	});

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
