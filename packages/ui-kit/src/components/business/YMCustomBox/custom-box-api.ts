export interface CustomBoxParseResult {
	text: string;
	invalid?: boolean;
}

export interface CustomBoxApiOptions {
	id?: string;
	type?: string;
	filter?: string;
	disabled?: boolean;
	modelValue?: any;
	getters?: Record<string, (el: any) => void> | null;
	parsers?: Record<string, (value: any) => CustomBoxParseResult> | null;
	fileDialog?: ((defaultPath: any) => Promise<{ filePaths: string[] }>) | null;
	browser?: (() => any) | null;
	localize?: ((key: string) => string) | null;
}

export interface CustomBoxApi extends HTMLElement {
	info: HTMLElement;
	dataValue: any;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	_initialized: boolean;
	isPluginInput?: boolean;
	type: string | null;
	filter: string | null;
	read(...args: unknown[]): any;
	write(...args: unknown[]): any;
	input(...args: unknown[]): any;
	update(...args: unknown[]): any;
	enable(...args: unknown[]): any;
	disable(...args: unknown[]): any;
	on(...args: unknown[]): any;
	keydown(event: KeyboardEvent): void;
	click(event?: Event): void;
	dragenter(event: DragEvent): void;
	dragleave(event: DragEvent): void;
	dragover(event: DragEvent): void;
	drop(event: DragEvent): void;
}

export function attachCustomBoxApi(
	el: HTMLElement,
	options: CustomBoxApiOptions = {}
): CustomBoxApi {
	const box = el as CustomBoxApi;
	if (box._initialized) return box;

	const props = {
		getters: options.getters ?? null,
		parsers: options.parsers ?? null,
		fileDialog: options.fileDialog ?? null,
		browser: options.browser ?? null,
		localize: options.localize ?? null
	};

	const state = {
		dataValue: null as any,
		writeEventEnabled: false,
		inputEventEnabled: false
	};

	const text = document.createElement('div');
	text.className = 'custom-box-text text';
	box.appendChild(text);
	box.info = text;
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

	const applyParse = (value: any): void => {
		const type = getType();
		if (!type) {
			text.textContent = value == null ? '' : String(value);
			return;
		}
		const parser = props.parsers?.[type];
		if (!parser) {
			text.textContent = value == null ? '' : String(value);
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

	const write = (value: any): void => {
		state.dataValue = value;
		if (value !== null && value !== undefined) {
			update();
		}
		box.dataValue = value;
		if (state.writeEventEnabled) {
			const writeEvent: any = new Event('write');
			writeEvent.value = state.dataValue;
			box.dispatchEvent(writeEvent);
		}
	};

	const input = (value: any): void => {
		if (state.dataValue !== value) {
			write(value);
			if (state.inputEventEnabled) {
				const inputEvent: any = new Event('input');
				inputEvent.value = state.dataValue;
				box.dispatchEvent(inputEvent);
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
		listener: (event: any) => void,
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

	const click = (event?: Event): void => {
		const type = getType();
		if (!type) return;
		const getter = props.getters?.[type];
		if (!getter) return;
		getter(box);
		event;
	};

	const keydown = (event: KeyboardEvent): void => {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!(event as any).cmdOrCtrlKey) {
					event.stopPropagation();
					click(event);
				}
				break;
		}
	};

	const getBrowser = (): any => (props.browser ? props.browser() : null);

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
			if (file && (!getFilter() || getFilter()!.indexOf(file.type) !== -1)) {
				(event as any).dataTransfer.dropEffect = 'move';
				event.preventDefault();
				box.classList.add('dragover');
			}
		}
	};

	const drop = (event: DragEvent): void => {
		event;
		const browser = getBrowser();
		const file = browser?.body?.activeFile;
		if (file) {
			box.focus();
			input((file.meta as any).guid);
			box.classList.remove('dragover');
		}
	};

	box.dataValue = null;
	box.writeEventEnabled = false;
	box.inputEventEnabled = false;
	box._initialized = true;

	box.read = (): any => state.dataValue;
	box.write = write;
	box.input = input;
	box.update = update;
	box.enable = enable;
	box.disable = disable;
	box.on = on;
	box.keydown = keydown;
	box.click = click;
	box.dragenter = dragenter;
	box.dragleave = dragleave;
	box.dragover = dragover;
	box.drop = drop;

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
