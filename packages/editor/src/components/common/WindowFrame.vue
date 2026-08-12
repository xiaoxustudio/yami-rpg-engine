<template>
	<YMWindowFrame
		ref="ym"
		:id="props.id"
		:focusable-selector="focusableSelector"
		:localize="localizeAdapter"
		:show-apply="showApply"
		:buttons-id-prefix="buttonsIdPrefix"
		:no-buttons="noButtons"
	>
		<template #title>
			<slot name="title" />
		</template>
		<slot />
	</YMWindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMWindowFrame } from '@ui-kit';
import { Layout } from '@/layout/layout';
import { Local } from '@/tools/localization';
import { attachElementApi } from '@/utils/attach-element-api';

interface Props {
	id?: string;
	showApply?: boolean;
	buttonsIdPrefix?: string;
	noButtons?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showApply: false,
	buttonsIdPrefix: '',
	noButtons: false
});

const focusableSelector = computed<string>(() => Layout.focusableSelector as string);
const localizeAdapter = computed(() => Local);

const ym = ref<{
	root: HTMLElement | null;
	open(): void;
	close(): boolean;
	maximize(): void;
	unmaximize(): void;
	focus(): void;
	blur(): void;
	setTitle(text: string): void;
	absolute(left: number, top: number): void;
	setPosition(x: number, y: number, r: DOMRect): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const open = (): void => ym.value?.open();
const close = (): boolean => ym.value?.close() ?? false;
const maximize = (): void => ym.value?.maximize();
const unmaximize = (): void => ym.value?.unmaximize();
const focus = (): void => ym.value?.focus();
const blur = (): void => ym.value?.blur();
const setTitle = (text: string): void => ym.value?.setTitle(text);
const absolute = (left: number, top: number): void => ym.value?.absolute(left, top);
const setPosition = (x: number, y: number, r: DOMRect): void => ym.value?.setPosition(x, y, r);
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ open, close, maximize, unmaximize, focus, blur, setTitle, absolute, setPosition, on, root });

onMounted(() => {
	const el = root.value as HTMLElement &
		Record<'open' | 'close' | 'maximize' | 'unmaximize' | 'focus' | 'blur' | 'setTitle' | 'absolute' | 'setPosition' | 'on', any>;
	if (!el) return;
	attachElementApi(el, { open, close, maximize, unmaximize, focus, blur, setTitle, absolute, setPosition, on });
});
</script>
