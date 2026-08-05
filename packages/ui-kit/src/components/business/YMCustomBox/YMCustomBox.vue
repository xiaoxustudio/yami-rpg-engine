<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { addClass, dispatchChangeEvent, removeClass } from '../../../utils/dom';

interface ParseResult {
	text: string;
	invalid?: boolean;
}

interface BrowserAdapter {
	dragging: boolean;
	body?: { activeFile: any };
}

interface Props {
	id?: string;
	type?: string;
	filter?: string;
	disabled?: boolean;
	modelValue?: any;
	getters?: Record<string, (el: any) => void> | null;
	parsers?: Record<string, (value: any) => ParseResult> | null;
	fileDialog?: ((defaultPath: any) => Promise<{ filePaths: string[] }>) | null;
	browser?: (() => BrowserAdapter) | null;
	localize?: ((key: string) => string) | null;
}

const props = withDefaults(defineProps<Props>(), {
	type: '',
	filter: '',
	disabled: false,
	modelValue: null,
	getters: null,
	parsers: null,
	fileDialog: null,
	browser: null,
	localize: null
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
	input: [value: any];
	write: [value: any];
}>();

const root = ref<HTMLElement | null>(null);

const state = reactive({
	dataValue: null as any,
	writeEventEnabled: false,
	inputEventEnabled: false
});

let info: HTMLElement | null = null;

const getType = (): string | null => (root.value ? (root.value as any).type : null);
const getFilter = (): string | null => (root.value ? (root.value as any).filter : null);

const getLocal = (key: string): string => (props.localize ? props.localize(key) : key);

const read = (): any => state.dataValue;

const applyParse = (value: any): void => {
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

const write = (value: any): void => {
	state.dataValue = value;
	if (value !== null && value !== undefined) {
		update();
	}
	const el = root.value as (HTMLElement & { [k: string]: any }) | null;
	if (el) {
		el.dataValue = value;
		if (state.writeEventEnabled) {
			const writeEvent: any = new Event('write');
			writeEvent.value = state.dataValue;
			el.dispatchEvent(writeEvent);
		}
	}
	emit('write', state.dataValue);
};

const input = (value: any): void => {
	if (state.dataValue !== value) {
		write(value);
		const el = root.value;
		if (el) {
			if (state.inputEventEnabled) {
				const inputEvent: any = new Event('input');
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

const openDialogDir = (inputEl: { read(): any; write(v: any): void }): void => {
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
	listener: (event: any) => void,
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
			if (!(event as any).cmdOrCtrlKey) {
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
		if (file && (!getFilter() || getFilter()!.indexOf(file.type) !== -1)) {
			(event as any).dataTransfer.dropEffect = 'move';
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
		input((file.meta as any).guid);
		removeClass(el, 'dragover');
	}
};

defineExpose({ read, write, input, enable, disable, focus, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));
watch(() => props.type, (val) => {
	if (root.value) (root.value as any).type = val;
});
watch(() => props.filter, (val) => {
	if (root.value) (root.value as any).filter = val;
});

onMounted(() => {
	const el = root.value as HTMLElement & { [k: string]: any } | null;
	if (!el) return;

	const text = document.createElement('div');
	addClass(text, 'custom-box-text');
	addClass(text, 'text');
	info = text;

	el.appendChild(text);
	el.tabIndex = 0;

	Object.defineProperty(el, 'type', {
		get: (): string | null => el.getAttribute('type'),
		set: (value: string): void => {
			el.setAttribute('type', value);
		}
	});
	Object.defineProperty(el, 'filter', {
		get: (): string | null => el.getAttribute('filter'),
		set: (value: string): void => {
			el.setAttribute('filter', value);
		}
	});

	el.info = text;
	el.dataValue = state.dataValue;
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
	(el as any).dragenter = dragenter;
	(el as any).dragleave = dragleave;
	(el as any).dragover = dragover;
	(el as any).drop = drop;

	el.addEventListener('keydown', keydown as EventListener);
	el.addEventListener('click', click as EventListener);
	el.addEventListener('dragenter', dragenter as EventListener);
	el.addEventListener('dragleave', dragleave as EventListener);
	el.addEventListener('dragover', dragover as EventListener);
	el.addEventListener('drop', drop as EventListener);

	write(props.modelValue);
	if (props.disabled) disable();
});
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
