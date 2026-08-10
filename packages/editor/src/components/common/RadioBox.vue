<template>
	<YMRadioBox
		ref="ym"
		:name="props.name"
		:value="props.value"
		:standard="isStandard"
		:disabled="isDisabled"
		:selected="isSelected"
		:id="props.id"
		@select="onSelect"
	>
		<slot />
	</YMRadioBox>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, useAttrs, watch } from 'vue';
import { YMRadioBox } from '@ui-kit';
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
		listener: (event: Event) => void,
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

const ym = ref<{
	root: HTMLElement | null;
	select(): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const state = reactive({
	proxy: null as RadioProxyElement | null,
	dataValue: '' as number | string | boolean
});

const isDisabled = ref(props.disabled);
const isSelected = ref(false);

const attrs = useAttrs();
const isStandard = computed(
	() =>
		props.standard ||
		(typeof attrs.class === 'string' && /\bstandard\b/.test(attrs.class))
);

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
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	state.proxy?.on(type, listener, options);
};

const syncSelected = (): void => {
	isSelected.value = state.proxy?.read() === state.dataValue;
};

const onSelect = (): void => {
	const proxy = state.proxy;
	if (!proxy) return;
	if (!isSelected.value) {
		proxy.input(state.dataValue);
	} else if (proxy.cancelable) {
		proxy.reset();
	}
};

defineExpose({ read, write, input, enable, disable, relate, on, root });

watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value as RadioBoxElement | null;
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

	proxy.on('write', (e: Event & { value: any }) => {
		emit('write', e.value);
		syncSelected();
	});
	proxy.on('input', (e: Event & { value: any }) => {
		emit('input', e.value);
		syncSelected();
	});
	proxy.on('change', () => {
		emit('change', proxy.read());
		syncSelected();
	});
	if (props.disabled) disable();

	el.read = read;
	el.write = write;
	el.input = input;
	el.enable = enable;
	el.disable = disable;
	el.relate = relate;
	el.on = on;

	syncSelected();
});
</script>
