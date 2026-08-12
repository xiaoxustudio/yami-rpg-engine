<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { addClass, dispatchChangeEvent, removeClass } from '../../../utils/dom';

interface ParseResult {
	text: string;
	invalid?: boolean;
}

interface BrowserAdapter {
	dragging: boolean;
	body?: {
		activeFile?: {
			type?: string;
			meta?: { guid: string };
		};
	};
}

interface CustomBoxRootElement extends HTMLElement {
	type: string | null;
	filter: string | null;
}

interface Props {
	id?: string;
	type?: string;
	filter?: string;
	disabled?: boolean;
	modelValue?: unknown;
	getters?: Record<string, (el: HTMLElement) => void> | null;
	parsers?: Record<string, (value: unknown) => ParseResult> | null;
	fileDialog?: ((defaultPath: unknown) => Promise<{ filePaths: string[] }>) | null;
	browser?: (() => BrowserAdapter) | null;
	localize?: ((key: string) => string) | null;
}

const props = withDefaults(defineProps<Props>(), {
	type: '',
	filter: '',
	disabled: false,
	modelValue: null as never,
	getters: null,
	parsers: null,
	fileDialog: null,
	browser: null,
	localize: null
});

const emit = defineEmits<{
	'update:modelValue': [value: unknown];
	input: [value: unknown];
	write: [value: unknown];
}>();

const root = ref<HTMLElement | null>(null);

const state = reactive<{
	dataValue: unknown;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
}>({
	dataValue: null,
	writeEventEnabled: false,
	inputEventEnabled: false
});

let info: HTMLElement | null = null;

const getType = (): string | null => root.value?.getAttribute('type') ?? null;
const getFilter = (): string | null => root.value?.getAttribute('filter') ?? null;

const getLocal = (key: string): string => (props.localize ? props.localize(key) : key);

const read = (): unknown => state.dataValue;

const applyParse = (value: unknown): void => {
	if (!info) return;
	const type = getType();
	if (!type) return;
	const parser = props.parsers?.[type];
	if (!parser) {
		info.textContent = value == null ? '' : String(value);
		return;
	}
	const result = parser(value);
	removeClass(info, 'invalid');
	info.textContent = result.text;
	if (result.invalid) {
		addClass(info, 'invalid');
	}
};

const update = (): void => {
	if (!info) return;
	applyParse(state.dataValue);
};

const write = (value: unknown): void => {
	state.dataValue = value;
	if (value !== null && value !== undefined) {
		update();
	}
	const el = root.value as (HTMLElement & { [k: string]: unknown }) | null;
	if (el) {
		if (state.writeEventEnabled) {
			const writeEvent = new Event('write') as Event & { value: unknown };
			writeEvent.value = state.dataValue;
			el.dispatchEvent(writeEvent);
		}
	}
	emit('write', state.dataValue);
};

const input = (value: unknown): void => {
	if (state.dataValue !== value) {
		write(value);
		const el = root.value;
		if (el) {
			if (state.inputEventEnabled) {
				const inputEvent = new Event('input') as Event & { value: unknown };
				inputEvent.value = state.dataValue;
				el.dispatchEvent(inputEvent);
			}
			dispatchChangeEvent(el);
		}
		emit('input', state.dataValue);
		emit('update:modelValue', state.dataValue);
	} else {
		if (getType() === 'file') {
			update();
		}
	}
};

const openDialogDir = (inputEl: { read(): unknown; write(v: unknown): void }): void => {
	if (!props.fileDialog) return;
	props
		.fileDialog(inputEl.read())
		.then(({ filePaths }: { filePaths: string[] }) => {
			if (filePaths.length === 1) {
				inputEl.write(filePaths[0]);
			}
		});
};

const enable = (): void => {
	const el = root.value;
	if (el && removeClass(el, 'disabled')) {
		el.tabIndex += 1;
		for (const child of Array.from(el.children)) {
			(child as HTMLElement).style.display = '';
		}
	}
};

const disable = (): void => {
	const el = root.value;
	if (el && addClass(el, 'disabled')) {
		el.tabIndex -= 1;
		for (const child of Array.from(el.children)) {
			(child as HTMLElement).style.display = 'none';
		}
	}
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
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
	const el = root.value;
	if (!el) return;
	el.setAttribute('type', props.type || '');
	el.setAttribute('filter', props.filter || '');
	const type = getType();
	if (!type) return;
	const getter = props.getters?.[type];
	if (!getter) return;
	getter(el);
};

const focus = (): void => root.value?.focus();

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

const getBrowser = (): BrowserAdapter | null => (props.browser ? props.browser() : null);

const dragenter = (event: DragEvent): void => {
	dragover(event);
};

const dragleave = (event: DragEvent): void => {
	const el = root.value;
	if (el && !el.contains(event.relatedTarget as Node)) {
		removeClass(el, 'dragover');
	}
};

const dragover = (event: DragEvent): void => {
	const el = root.value;
	if (!el) return;
	const browser = getBrowser();
	if (getType() === 'file' && browser?.dragging) {
		const file = browser.body?.activeFile;
		if (file && (!getFilter() || getFilter()!.indexOf(file.type!) !== -1)) {
			(event as DragEvent & { dataTransfer: DataTransfer }).dataTransfer.dropEffect = 'move';
			event.preventDefault();
			addClass(el, 'dragover');
		}
	}
};

const drop = (event: DragEvent): void => {
	const el = root.value;
	if (!el) return;
	const browser = getBrowser();
	const file = browser?.body?.activeFile;
	if (file) {
		el.focus();
		input(file.meta!.guid);
		removeClass(el, 'dragover');
	}
};

defineExpose({ read, write, input, enable, disable, focus, on, root, initializeApi });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

function initializeApi(): void {
	const el = root.value as (HTMLElement & { [k: string]: unknown }) | null;
	if (!el || el._initialized) return;

	const text = document.createElement('div');
	addClass(text, 'custom-box-text');
	addClass(text, 'text');
	info = text;

	el.appendChild(text);
	el.tabIndex = 0;

	Object.defineProperty(el, 'dataValue', {
		configurable: true,
		get: () => state.dataValue,
		set: (value: unknown) => {
			state.dataValue = value;
		}
	});

	el.info = text;
	el.writeEventEnabled = false;
	el.inputEventEnabled = false;
	el._initialized = true;
	el.read = read;
	el.write = write;
	el.input = input;
	el.update = update;
	el.enable = enable;
	el.disable = disable;
	el.on = on;
	el.keydown = keydown;
	el.click = click;
	el.dragenter = dragenter;
	el.dragleave = dragleave;
	el.dragover = dragover;
	el.drop = drop;

	el.addEventListener('keydown', keydown as EventListener);
	el.addEventListener('click', click as EventListener);
	el.addEventListener('dragenter', dragenter as EventListener);
	el.addEventListener('dragleave', dragleave as EventListener);
	el.addEventListener('dragover', dragover as EventListener);
	el.addEventListener('drop', drop as EventListener);

	write(props.modelValue);
	if (props.disabled) disable();
};

onMounted(initializeApi);
</script>

<template>
	<div
		ref="root"
		class="custom-box"
		:id="props.id"
		:type="props.type || undefined"
		:filter="props.filter || undefined"
	/>
</template>

<style module>
:global(:where(.custom-box)) {
	display: block;
	position: relative;
	min-width: 60px;
	cursor: pointer;
}
</style>

