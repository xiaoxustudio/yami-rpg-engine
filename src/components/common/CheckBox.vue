<template>
	<div class="check-box" ref="root" :id="props.id">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import {
	on as onElement,
	addClass,
	removeClass,
	hasClass,
	enable as enableElement,
	disable as disableElement,
	dispatchChangeEvent
} from '@/util/element-utils';

interface CheckBoxElement extends HTMLElement {
	read(): boolean;
	write(value: boolean): void;
	input(value: boolean): void;
	enable(): void;
	disable(): void;
	relate(elements: HTMLElement[]): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	dataValue: boolean;
	relations: HTMLElement[];
}

interface Props {
	id?: string;
	standard?: boolean;
	large?: boolean;
	disabled?: boolean;
	modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	standard: false,
	large: false,
	disabled: false,
	modelValue: false
});

const emit = defineEmits<{
	'update:modelValue': [value: boolean];
	write: [value: boolean];
	input: [value: boolean];
	change: [value: boolean];
}>();

const state = reactive({
	dataValue: false,
	relations: [] as HTMLElement[],
	writeEventEnabled: false,
	inputEventEnabled: false
});

const root = ref<CheckBoxElement | null>(null);

let isStandard = false;
let standardMark: HTMLElement | null = null;

const read = (): boolean => state.dataValue;

const write = (value: boolean): void => {
	const el = root.value;
	if (!el) return;
	state.dataValue = !!value;
	state.dataValue ? addClass(el, 'selected') : removeClass(el, 'selected');
	if (!hasClass(el, 'disabled')) {
		toggleRelatedElements();
	}
	if (state.writeEventEnabled) {
		const writeEvent = new Event('write');
		writeEvent.value = state.dataValue;
		el.dispatchEvent(writeEvent);
	}
};

const input = (value: boolean): void => {
	const el = root.value;
	if (!el) return;
	if (state.dataValue !== value) {
		write(value);
		if (state.inputEventEnabled) {
			const inputEvent = new Event('input', {
				bubbles: true
			});
			inputEvent.value = state.dataValue;
			el.dispatchEvent(inputEvent);
		}
		dispatchChangeEvent(el);
	}
};

const enable = (): void => {
	const el = root.value;
	if (!el) return;
	if (removeClass(el, 'disabled')) {
		toggleRelatedElements();
	}
};

const disable = (): void => {
	const el = root.value;
	if (!el) return;
	if (addClass(el, 'disabled')) {
		toggleRelatedElements();
	}
};

const relate = (elements: HTMLElement[]): void => {
	state.relations = elements;
};

const toggleRelatedElements = (): void => {
	const el = root.value;
	if (!el) return;
	if (!hasClass(el, 'disabled') && state.dataValue) {
		for (const element of state.relations) {
			if (typeof (element as any).enable === 'function') {
				(element as any).enable();
			} else {
				enableElement(element);
			}
		}
	} else {
		for (const element of state.relations) {
			if (typeof (element as any).disable === 'function') {
				(element as any).disable();
			} else {
				disableElement(element);
			}
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

const mouseclick = (event: Event): void => {
	input(!read());
};

const pointerdown = (event: PointerEvent): void => {
	switch (event.button) {
		case 0:
			if (document.activeElement !== document.body) {
				document.activeElement.blur();
			}
			input(!read());
			break;
	}
};

const keydown = (event: KeyboardEvent & { cmdOrCtrlKey?: boolean }): void => {
	const el = root.value;
	if (!el) return;
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			if (!event.cmdOrCtrlKey && !hasClass(el, 'disabled')) {
				event.stopPropagation();
				mouseclick(event);
			}
			break;
	}
};

const ensureStandard = (): void => {
	const el = root.value;
	if (!el || isStandard || !el.classList.contains('standard')) return;
	isStandard = true;
	standardMark = document.createElement('check-mark');
	el.tabIndex = 0;
	el.insertBefore(standardMark, el.childNodes[0] || null);
	el.removeEventListener('pointerdown', pointerdown);
	el.addEventListener('click', mouseclick);
};

defineExpose({ read, write, input, enable, disable, relate, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	if (props.standard) addClass(el, 'standard');
	if (props.large) addClass(el, 'large');
	el.addEventListener('keydown', keydown);
	ensureStandard();
	if (!isStandard) {
		el.addEventListener('pointerdown', pointerdown);
	}
	el.read = read;
	el.write = write;
	el.input = input;
	el.enable = enable;
	el.disable = disable;
	el.relate = relate;
	el.on = on;
	Object.defineProperty(el, 'dataValue', {
		get: () => state.dataValue,
		set: (value: boolean) => {
			state.dataValue = !!value;
		}
	});
	Object.defineProperty(el, 'relations', {
		get: () => state.relations,
		set: (value: HTMLElement[]) => {
			state.relations = value;
		}
	});
	onElement(el, 'input', (e: any) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	onElement(el, 'write', (e: any) => emit('write', e.value));
	onElement(el, 'change', () => emit('change', read()));
	if (props.modelValue) write(true);
	if (props.disabled) disable();
});
</script>
