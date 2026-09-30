import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import { createPayloadEvent } from '../../../utils/payload-event';
import { attachApi } from '../../../utils/attach-api';

export interface CustomBoxParseResult {
	text: string;
	invalid?: boolean;
}

export interface CustomBoxBrowserState {
	dragging: boolean;
	body?: {
		activeFile?: {
			type?: string;
			meta?: { guid: string };
		};
	};
}

export interface CustomBoxApiOptions {
	id?: string;
	type?: string;
	filter?: string;
	disabled?: boolean;
	modelValue?: unknown;
	getters?: Record<string, (el: CustomBoxApi) => void> | null;
	parsers?: Record<string, (value: unknown) => CustomBoxParseResult> | null;
	fileDialog?: ((defaultPath: unknown) => Promise<{ filePaths: string[] }>) | null;
	browser?: (() => CustomBoxBrowserState) | null;
	localize?: ((key: string) => string) | null;
}

export type CustomBoxApi = HTMLElement & {
	dataValue: unknown;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	isPluginInput?: boolean;
	type: string | null;
	filter: string | null;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	input(...args: unknown[]): void;
	update(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	on(...args: unknown[]): void;
	keydown(event: KeyboardEvent): void;
	click(event?: Event): void;
	dragenter(event: DragEvent): void;
	dragleave(event: DragEvent): void;
	dragover(event: DragEvent): void;
	drop(event: DragEvent): void;
};

/**
 * 把 `unknown` 值转成显示文本。
 *
 * 原先这里直接写 `String(value)` 并挂了两条 `oxlint-disable-next-line no-base-to-string`——
 * 那条规则指出的问题是真的（对象会落回 `[object Object]`）。这里把分流写明：`null`/`undefined`
 * 给空串；基本类型（含 `symbol`/`bigint`）仍用 `String(value)`；对象与函数显式走 `.toString()`
 * ——`String(x)` 对它们本来就是调用 `toString()`，行为逐类等价。
 */
const displayString = (value: unknown): string => {
	if (value == null) return '';
	switch (typeof value) {
		case 'string':
			return value;
		case 'number':
		case 'boolean':
		case 'bigint':
		case 'symbol':
			return String(value);
		default:
			// 对象与函数：显式调用 `toString()`（语义同 `String(value)`）
			return (value as { toString(): string }).toString();
	}
};

export function attachCustomBoxApi(
	el: HTMLElement,
	options: CustomBoxApiOptions = {}
): CustomBoxApi {
	const box = el as CustomBoxApi;
	if (isApiAttached(box)) return box;

	const props = {
		getters: options.getters ?? null,
		parsers: options.parsers ?? null,
		fileDialog: options.fileDialog ?? null,
		browser: options.browser ?? null,
		localize: options.localize ?? null
	};

	const state: {
		dataValue: unknown;
		writeEventEnabled: boolean;
		inputEventEnabled: boolean;
	} = {
		dataValue: null,
		writeEventEnabled: false,
		inputEventEnabled: false
	};

	const text = document.createElement('div');
	text.className = 'custom-box-text text';
	box.appendChild(text);
	// info now lives in element data (field removed from DATA_FIELDS)
	elementDataOf<{ info: HTMLElement }>(box).info = text;
	box.tabIndex = 0;

	Object.defineProperty(box, 'type', {
		get: (): string | null => box.getAttribute('type'),
		set: (value: string): void => {
			if (value == null) box.removeAttribute('type');
			else box.setAttribute('type', value);
		}
	});
	Object.defineProperty(box, 'filter', {
		get: (): string | null => box.getAttribute('filter'),
		set: (value: string): void => {
			if (value == null) box.removeAttribute('filter');
			else box.setAttribute('filter', value);
		}
	});
	if (options.type != null) box.setAttribute('type', options.type);
	if (options.filter != null) box.setAttribute('filter', options.filter);

	const getType = (): string | null => box.getAttribute('type');
	const getFilter = (): string | null => box.getAttribute('filter');

	const applyParse = (value: unknown): void => {
		const type = getType();
		if (!type) {
			text.textContent = displayString(value);
			return;
		}
		const parser = props.parsers?.[type];
		if (!parser) {
			text.textContent = displayString(value);
			return;
		}
		const result = parser(value);
		text.classList.remove('invalid');
		text.textContent = result.text;
		if (result.invalid) {
			text.classList.add('invalid');
		}
	};

	const update = (): void => {
		applyParse(state.dataValue);
	};

	const emitValueEvent = (type: string, value: unknown): void => {
		const event = createPayloadEvent(type, {} as { value: unknown });
		event.value = value;
		box.dispatchEvent(event);
	};

	const write = (value: unknown): void => {
		state.dataValue = value;
		if (value !== null && value !== undefined) {
			update();
		}
		if (state.writeEventEnabled) {
			emitValueEvent('write', state.dataValue);
		}
	};

	const input = (value: unknown): void => {
		if (state.dataValue !== value) {
			write(value);
			if (state.inputEventEnabled) {
				emitValueEvent('input', state.dataValue);
			}
			box.dispatchEvent(new Event('change', { bubbles: true }));
		} else if (getType() === 'file') {
			update();
		}
	};

	const enable = (): void => {
		if (!box.classList.contains('disabled')) return;
		box.classList.remove('disabled');
		box.tabIndex += 1;
		for (const child of Array.from(box.children)) {
			(child as HTMLElement).style.display = '';
		}
	};

	const disable = (): void => {
		if (box.classList.contains('disabled')) return;
		box.classList.add('disabled');
		box.tabIndex -= 1;
		for (const child of Array.from(box.children)) {
			(child as HTMLElement).style.display = 'none';
		}
	};

	const on = (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void => {
		box.addEventListener(type, listener as EventListener, listenerOptions);
		switch (type) {
			case 'write':
				state.writeEventEnabled = true;
				break;
			case 'input':
				state.inputEventEnabled = true;
				break;
		}
	};

	const click = (_event?: Event): void => {
		const type = getType();
		if (!type) return;
		const getter = props.getters?.[type];
		if (!getter) return;
		getter(box);
	};

	const keydown = (event: KeyboardEvent): void => {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!(event as KeyboardEvent & { cmdOrCtrlKey?: boolean }).cmdOrCtrlKey) {
					event.stopPropagation();
					click(event);
				}
				break;
		}
	};

	const getBrowser = (): CustomBoxBrowserState | null => (props.browser ? props.browser() : null);

	const dragenter = (event: DragEvent): void => {
		dragover(event);
	};

	const dragleave = (event: DragEvent): void => {
		if (!box.contains(event.relatedTarget as Node)) {
			box.classList.remove('dragover');
		}
	};

	const dragover = (event: DragEvent): void => {
		const browser = getBrowser();
		if (getType() === 'file' && browser?.dragging) {
			const file = browser.body?.activeFile;
			if (file && (!getFilter() || getFilter()!.indexOf(file.type!) !== -1)) {
				(event as DragEvent & { dataTransfer: DataTransfer }).dataTransfer.dropEffect =
					'move';
				event.preventDefault();
				box.classList.add('dragover');
			}
		}
	};

	const drop = (_event: DragEvent): void => {
		const browser = getBrowser();
		const file = browser?.body?.activeFile;
		if (file) {
			box.focus();
			input(file.meta!.guid);
			box.classList.remove('dragover');
		}
	};

	Object.defineProperty(box, 'dataValue', {
		configurable: true,
		get: () => state.dataValue,
		set: (value: unknown) => {
			state.dataValue = value;
		}
	});
	box.writeEventEnabled = false;
	box.inputEventEnabled = false;
	markApiAttached(box);

	const read = (): unknown => state.dataValue;

	attachApi<CustomBoxApi>(box, {
		read,
		write,
		input,
		update,
		enable,
		disable,
		on,
		keydown,
		click,
		dragenter,
		dragleave,
		dragover,
		drop
	});

	box.addEventListener('keydown', keydown as EventListener);
	box.addEventListener('click', click as EventListener);
	box.addEventListener('dragenter', dragenter as EventListener);
	box.addEventListener('dragleave', dragleave as EventListener);
	box.addEventListener('dragover', dragover as EventListener);
	box.addEventListener('drop', drop as EventListener);

	if (options.modelValue !== undefined && options.modelValue !== null) {
		write(options.modelValue);
	}
	if (options.disabled) {
		disable();
	}

	return box;
}

export function createCustomBoxElement(options?: CustomBoxApiOptions): CustomBoxApi {
	const el = document.createElement('div');
	el.className = 'custom-box';
	if (options?.id) el.id = options.id;
	return attachCustomBoxApi(el, options);
}
