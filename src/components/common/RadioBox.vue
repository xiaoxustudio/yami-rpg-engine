<template>
	<radio-box ref="root" :id="props.id" :name="props.name" :value="props.value" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  enable as enableElement,
  disable as disableElement,
  addClass
} from '@/util/element-utils';

interface RadioProxyElement extends HTMLElement {
	dataValue: any;
	read(): any;
	write(value: any): void;
	input(value: any): void;
	enable(): void;
	disable(): void;
	relate(entries: any[]): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	cancelable: boolean;
}

interface RadioBoxElement extends HTMLElement {
	proxy: RadioProxyElement;
	dataValue: number | string | boolean;
	_mark: HTMLElement | null;
	_isNewProxy: boolean;
	_isStandard: boolean;
	pointerdown: (event: PointerEvent) => void;
	mouseclick: (event: Event) => void;
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

const ensureStandard = (el: RadioBoxElement): void => {
	if (!props.standard || el._isStandard) return;
	el._isStandard = true;
	el._mark = document.createElement('radio-mark');
	el.tabIndex = 0;
	el.insertBefore(el._mark, el.childNodes[0] || null);
	el.removeEventListener('pointerdown', el.pointerdown);
	el.addEventListener('click', el.mouseclick);
};

const read = (): any => (root.value?.proxy ? readElement(root.value.proxy) : undefined);
const write = (value: any): void => { if (root.value?.proxy) writeElement(root.value.proxy, value); };
const enable = (): void => { if (root.value?.proxy) enableElement(root.value.proxy); };
const disable = (): void => { if (root.value?.proxy) disableElement(root.value.proxy); };
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.proxy?.on(type, listener, options);
};

defineExpose({ read, write, enable, disable, on, root });

watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	if (props.standard) addClass(el, 'standard');
	ensureStandard(el);
	const proxy = el.proxy;
	if (proxy) {
		proxy.on('write', (e: any) => emit('write', e.value));
		proxy.on('input', (e: any) => emit('input', e.value));
		proxy.on('change', (e: any) => emit('change', e.value));
		if (props.disabled) disableElement(proxy);
	}
});
</script>
