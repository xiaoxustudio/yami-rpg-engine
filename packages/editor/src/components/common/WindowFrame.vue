<template>
	<YMWindowFrame
		ref="ym"
		:id="props.id"
		:focusable-selector="focusableSelector"
		:localize="localizeAdapter"
		:show-apply="showApply"
		:buttons-id-prefix="buttonsIdPrefix"
		:no-buttons="noButtons"
		:confirm-disabled="confirmDisabled"
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
import { getLocalStore } from '@app/stores/local';
import { setLocalElement, type LocalComponentItem } from '@app/localize/dom-localizer';
import { registerElement } from '@app/utils/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { windowShellEls } from '@app/tools/window-object.ts';
import { attachElementApi } from '@app/utils/attach-element-api';

interface Props {
	id?: string;
	showApply?: boolean;
	buttonsIdPrefix?: string;
	noButtons?: boolean;
	confirmDisabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showApply: false,
	buttonsIdPrefix: '',
	noButtons: false,
	confirmDisabled: false
});

const focusableSelector = computed<string>(() => Layout.focusableSelector as string);
const localizeAdapter = computed(() => ({
	components: getLocalStore().components,
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

defineExpose({
	open,
	close,
	maximize,
	unmaximize,
	focus,
	blur,
	setTitle,
	absolute,
	setPosition,
	on,
	root
});

onMounted(() => {
	const el = root.value as HTMLElement &
		Record<
			| 'open'
			| 'close'
			| 'maximize'
			| 'unmaximize'
			| 'focus'
			| 'blur'
			| 'setTitle'
			| 'absolute'
			| 'setPosition'
			| 'on',
			unknown
		>;
	if (!el) return;
	attachElementApi(el, {
		open,
		close,
		maximize,
		unmaximize,
		focus,
		blur,
		setTitle,
		absolute,
		setPosition,
		on
	});
	for (const type of ['confirm', 'apply', 'cancel'] as const) {
		el.addEventListener(type, () =>
			(emit as (evt: 'confirm' | 'apply' | 'cancel') => void)(type)
		);
	}
	if (el.id !== '') registerElement(windowShellEls, el.id, el);
	for (const button of el.querySelectorAll<HTMLElement>('[name="cancel"]')) {
		button.addEventListener('click', () => {
			if (el.id !== '') Window.close!(el.id);
		});
	}
	const onLocalize = (): void => {
		const store = getLocalStore();
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
					rootEl.id === id
						? rootEl
						: (rootEl.querySelector(`#${CSS.escape(id)}`) as HTMLElement);
				if (element) setLocalElement(element, item);
			}
		}
		for (const buttonName of ['confirm', 'cancel', 'apply'] as const) {
			const item = components[`[${buttonName}]`];
			if (!item) continue;
			rootEl.querySelectorAll<HTMLElement>(`[name="${buttonName}"]`).forEach((el) => {
				setLocalElement(el, item);
			});
		}
	};
	onLocalize();
	window.addEventListener('localize', onLocalize);
	onBeforeUnmount(() => window.removeEventListener('localize', onLocalize));
});
</script>
