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
		@open="emit('open')"
		@closed="emit('closed')"
		@resize="emit('resize')"
		@confirm="emit('confirm')"
		@apply="emit('apply')"
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
import { Layout } from '@app/engine/layout/layout';
import { getLocalStore } from '@app/stores/local';
import { setLocalElement, type LocalComponentItem } from '@app/localize/dom-localizer';
import { registerElement } from '@app/utils/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { windowShellEls } from '@app/tools/window-object.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import { useEventListener } from '@app/composables/useEventListener';

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
	/**
	 * 以下三个是**转发**自 ui-kit `YMWindowFrame` 的 Vue 事件。
	 *
	 * 为什么要加：本仓有 ~44 处消费方仍在用**元素优先 API**（经 `fieldEls` 取到元素后
	 * 在那上面订阅窗口的 open / closed）监听窗口生命周期。
	 * `YMWindowFrame` 早就把 open / closed / resize 都 emit 出来了，但这层包装没有转发，
	 * 消费方因此只能绕到元素上去挂 DOM 监听。补上转发后，消费方可用 `@open`/`@closed`，
	 * 这才是 P2/P3 能落地的前提。
	 *
	 * ⚠️ 本注释**刻意不写出那个 `.on(` 调用的字面样子**：`uikit-on-api` 轴扫的是**原文**
	 * （不剔注释），写一个示例就会让轴凭空多计 1 处消费站点（实测踩过）。
	 */
	open: [];
	closed: [];
	resize: [];
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

/**
 * 把语言表里与本窗口相关的条目刷到 DOM 上。
 *
 * 原先它定义在 `onMounted` 内部、并由那里手工 `addEventListener` + `onBeforeUnmount` 配对。
 * 它只闭包 `root`（setup 作用域）与模块级导入，故提到 setup 层交给 `useEventListener`，
 * 挂/摘成对。首次刷新仍留在 `onMounted` 里调用（见下），时机不变。
 */
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

useEventListener(window, 'localize', onLocalize);

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
	// confirm / apply 已改为模板 `@confirm` / `@apply`（ui-kit 早就 emit 了这两个）。
	// `cancel` 的桥已删除：全仓**没有任何消费方**订阅本组件的 `cancel`，
	// 且 ui-kit 侧把 cancel 直接路由到 `close()`、并不 emit `cancel`，
	// 因此原先那条原生冒泡桥没有任何可达消费者。
	if (el.id !== '') registerElement(windowShellEls, el.id, el);
	for (const button of el.querySelectorAll<HTMLElement>('[name="cancel"]')) {
		button.addEventListener('click', () => {
			if (el.id !== '') Window.close!(el.id);
		});
	}
	onLocalize();
});
</script>
