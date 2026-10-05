<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { dispatchResizeEvent } from '../../../utils/dom';
import { createPayloadEvent } from '../../../utils/payload-event';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const emit = defineEmits<{
	switch: [last: unknown, value: unknown];
}>();

const root = ref<HTMLElement | null>(null);

const state = reactive<{
	index: unknown;
	active: HTMLElement | null;
	switchEventEnabled: boolean;
}>({
	index: null,
	active: null,
	switchEventEnabled: false
});

const hasClass = (el: unknown, cls: string): boolean =>
	el instanceof Element && el.classList.contains(cls);

/**
 * 把 `visible` 收敛到 `target` 一个页框。
 *
 * 页框由**整壳 Teleport**在分组间搬运，搬进来时带着它原来那个组的 `visible`；原来只
 * `active?.classList.remove('visible')`（只清自己记着的那个）⇒ 第二个 `.visible` 页框
 * 会永远留着。页框是 `position:absolute; inset:0`，两个同时可见就是**完全叠在一起**，
 * 且 DOM 序靠后的那个盖在上面（实机「点哪个页签都亮，内容永远是另一个面板」）。
 */
const normalizePages = (element: HTMLElement, target: HTMLElement | null): void => {
	for (const child of Array.from(element.children)) {
		if (!hasClass(child, 'page-frame')) continue;
		if (child === target) child.classList.add('visible');
		else child.classList.remove('visible');
	}
};

const switchover = (value: unknown): void => {
	const element = root.value;
	if (!element) return;
	let target: HTMLElement | null = null;
	if (value !== null) {
		for (const child of Array.from(element.children)) {
			if (hasClass(child, 'page-frame') && child.getAttribute('value') === value) {
				target = child as HTMLElement;
				break;
			}
		}
	}
	// 归一化**无条件**执行（幂等）：搬入的页框可能带着旧组的 `visible`，而那时 index/active
	// 都已经就位 ⇒ 下面那两个提前 return 会把它漏掉。
	normalizePages(element, target);
	const last = state.index;
	const active = state.active;
	if (last === value && active === target) return;
	state.index = value;
	state.active = target;
	if (last !== value) {
		if (state.switchEventEnabled) {
			const event = createPayloadEvent('switch', {} as { last: unknown; value: unknown });
			event.last = last;
			event.value = value;
			element.dispatchEvent(event);
		}
		if (active) dispatchResizeEvent(active);
		if (target) dispatchResizeEvent(target);
	}
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const element = root.value;
	if (!element) return;
	element.addEventListener(type, listener, options);
	if (type === 'switch') {
		state.switchEventEnabled = true;
	}
};

type PageManagerHost = HTMLElement & {
	switch: typeof switchover;
	on: typeof on;
};

onMounted(() => {
	const element = root.value;
	if (!element) return;
	const nodes = Array.from(element.childNodes);
	for (const child of nodes) {
		if (!hasClass(child, 'page-frame')) {
			element.removeChild(child);
		}
	}
	(element as PageManagerHost).switch = switchover;
	(element as PageManagerHost).on = on;
	for (const key of ['index', 'active', 'switchEventEnabled'] as const) {
		Object.defineProperty(element, key, {
			get: () => state[key],
			set: (value: unknown) => {
				state[key] = value as never;
			},
			configurable: true
		});
	}
	element.addEventListener('switch', (e: Event & { last?: unknown; value?: unknown }) =>
		emit('switch', e.last, e.value)
	);
	state.switchEventEnabled = true;
	// Teleport 搬入页框的时刻晚于「激活写入」，那时 index 早已就位但 active 还是 null ——
	// 只归一化一次会漏掉它。子节点一变就按当前 index 重放一次 `switchover`（幂等，只动 class
	// 不会自激）：它会把「刚到达的目标页」重新解析成 active 并置为唯一可见。
	new MutationObserver(() => {
		if (state.index !== null) switchover(state.index);
	}).observe(element, { childList: true });
});

defineExpose({ switch: switchover, on, root });
</script>

<template>
	<div ref="root" class="page-manager" :class="$style.manager" :id="props.id">
		<slot />
	</div>
</template>

<style module>
.manager {
	display: block;
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.manager :global(:where(.page-frame)) {
	position: absolute;
	inset: 0;
	display: none;
}

.manager :global(:where(.page-frame.visible)) {
	display: block;
}
</style>
