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
import { registerElement } from '@app/utils/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { windowShellEls } from '@app/tools/window-object.ts';
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
	// P1b：窗口壳元素登记进 windowShellEls（`Window.open(id)` 据此取帧，原先 document.getElementById）。
	// 取消按钮的接线也从模块的 `document.getElementsByName('cancel')` 下沉到这里——只查自己的子树。
	if (el.id !== '') registerElement(windowShellEls, el.id, el);
	for (const button of el.querySelectorAll<HTMLElement>('[name="cancel"]')) {
		button.addEventListener('click', () => {
			if (el.id !== '') Window.close!(el.id);
		});
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
					rootEl.id === id
						? rootEl
						: (rootEl.querySelector(`#${CSS.escape(id)}`) as HTMLElement);
				if (element) setLocalElement(element, item);
			}
		}
		// 通用按钮（[confirm]/[cancel]/[apply] 按 name 匹配），懒加载窗口挂载时兜底本地化
		for (const buttonName of ['confirm', 'cancel', 'apply'] as const) {
			const item = components[`[${buttonName}]`];
			if (!item) continue;
			rootEl.querySelectorAll<HTMLElement>(`[name="${buttonName}"]`).forEach((el) => {
				setLocalElement(el, item);
			});
		}
	};
	// 懒加载窗口可能在语言加载后才挂载（错过 localize 事件），挂载时主动本地化兜底
	onLocalize();
	window.addEventListener('localize', onLocalize);
	onBeforeUnmount(() => window.removeEventListener('localize', onLocalize));
});
</script>
