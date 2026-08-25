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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { YMWindowFrame } from '@ui-kit';
import { Layout } from '@app/engine/layout/layout';
import { useLocalStore } from '@app/stores/local';
import { pinia } from '@app/stores/pinia';
import { setLocalElement, type LocalComponentItem } from '@app/localize/dom-localizer';
import { attachElementApi } from '@app/utils/attach-element-api';

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
const localizeAdapter = computed(() => ({
	components: useLocalStore(pinia).components,
	setElement: (el: Element, item: unknown) =>
		setLocalElement(el as HTMLElement, item as LocalComponentItem)
}));

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

const emit = defineEmits<{
	confirm: [];
	apply: [];
	cancel: [];
}>();

defineExpose({ open, close, maximize, unmaximize, focus, blur, setTitle, absolute, setPosition, on, root });

onMounted(() => {
	const el = root.value as HTMLElement &
		// oxlint-disable-next-line no-explicit-any
		Record<'open' | 'close' | 'maximize' | 'unmaximize' | 'focus' | 'blur' | 'setTitle' | 'absolute' | 'setPosition' | 'on', any>;
	if (!el) return;
	attachElementApi(el, { open, close, maximize, unmaximize, focus, blur, setTitle, absolute, setPosition, on });
	for (const type of ['confirm', 'apply', 'cancel'] as const) {
		el.addEventListener(type, () => emit(type));
	}
	// 切语言时重写窗口内元素（懒加载窗口挂载后语言已加载，靠此兜底）
	const onLocalize = (): void => {
		const store = useLocalStore(pinia);
		if (!store.components) return;
		const components = store.components as Record<string, LocalComponentItem>;
		const rootEl = root.value;
		if (!rootEl) return;
		const ids = new Set<string>([rootEl.id]);
		rootEl.querySelectorAll<HTMLElement>('[id]').forEach((n) => ids.add(n.id));
		for (const id of ids) {
			const item = components[id];
			if (item) {
				const element =
					rootEl.id === id ? rootEl : rootEl.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
				if (element) setLocalElement(element, item);
			}
		}
	};
	window.addEventListener('localize', onLocalize);
	onBeforeUnmount(() => window.removeEventListener('localize', onLocalize));
});
</script>
