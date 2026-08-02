<template>
	<div
		class="radio-box"
		ref="root"
		:id="props.id"
		:name="props.name"
		:class="props.standard ? 'standard' : ''"
	>
		<slot />
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { on as onElement, hasClass } from '@/util/element-utils';
import {
	createRadioProxy,
	radioProxyMap,
	type RadioProxyElement,
	type RadioRelationEntry
} from '@/components/radio-proxy';

interface RadioBoxElement extends HTMLElement {
	proxy: RadioProxyElement;
	dataValue: number | string | boolean;
	read(): any;
	write(value: any): void;
	input(value: any): void;
	enable(): void;
	disable(): void;
	relate(entries: RadioRelationEntry[]): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	name: string;
	value: string | number | boolean;
	standard?: boolean;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	standard: false,
	disabled: false
});

const emit = defineEmits<{
	write: [value: any];
	input: [value: any];
	change: [value: any];
}>();

const root = ref<RadioBoxElement | null>(null);

const state = reactive({
	proxy: null as RadioProxyElement | null,
	dataValue: '' as number | string | boolean,
	mark: null as HTMLElement | null
});

const keydown = (event: KeyboardEvent): void => {
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

const pointerdown = (event: PointerEvent): void => {
	const el = root.value;
	if (!el) return;
	switch (event.button) {
		case 0:
			if (!hasClass(el, 'selected')) {
				if (document.activeElement !== document.body) {
					document.activeElement.blur();
				}
				state.proxy?.input(state.dataValue);
			} else if (state.proxy?.cancelable) {
				if (document.activeElement !== document.body) {
					document.activeElement.blur();
				}
				state.proxy.reset();
			}
			break;
	}
};

const mouseclick = (event: Event): void => {
	const el = root.value;
	if (!el) return;
	if (!hasClass(el, 'selected')) {
		state.proxy?.input(state.dataValue);
	} else if (state.proxy?.cancelable) {
		state.proxy.reset();
	}
};

const read = (): any => state.proxy?.read();
const write = (value: any): void => {
	state.proxy?.write(value);
};
const input = (value: any): void => {
	state.proxy?.input(value);
};
const enable = (): void => {
	state.proxy?.enable();
};
const disable = (): void => {
	state.proxy?.disable();
};
const relate = (entries: RadioRelationEntry[]): void => {
	state.proxy?.relate(entries);
};
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	state.proxy?.on(type, listener, options);
};

defineExpose({ read, write, input, enable, disable, relate, on, root });

watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	if (!el) return;

	const string = String(props.value ?? '');
	const isNumber = RegExp.number.test(string);
	state.dataValue = isNumber
		? parseFloat(string)
		: string === 'false'
			? false
			: string === 'true'
				? true
				: string;

	let proxy = radioProxyMap[props.name] as RadioProxyElement;
	let isNewProxy = false;
	if (proxy === undefined) {
		proxy = createRadioProxy() as RadioProxyElement;
		proxy.id = props.name;
		proxy.style.display = 'none';
		radioProxyMap[proxy.id] = proxy;
		isNewProxy = true;
	}
	state.proxy = proxy;
	el.proxy = proxy;
	el.dataValue = state.dataValue;

	if (isNewProxy) {
		el.appendChild(proxy);
	}

	onElement(el, 'keydown', keydown);
	if (hasClass(el, 'standard')) {
		state.mark = document.createElement('radio-mark');
		el.tabIndex = 0;
		onElement(el, 'click', mouseclick);
	} else {
		onElement(el, 'pointerdown', pointerdown);
	}
	if (state.mark) {
		el.insertBefore(state.mark, el.childNodes[0] || null);
	}

	proxy.on('write', (e: any) => emit('write', e.value));
	proxy.on('input', (e: any) => emit('input', e.value));
	proxy.on('change', (e: any) => emit('change', e.value));
	if (props.disabled) disable();

	el.read = read;
	el.write = write;
	el.input = input;
	el.enable = enable;
	el.disable = disable;
	el.relate = relate;
	el.on = on;
});
</script>
