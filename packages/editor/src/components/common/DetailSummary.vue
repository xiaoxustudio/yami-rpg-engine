<template>
	<div class="detail-summary" ref="root" :id="props.id">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<HTMLElement | null>(null);

const findBox = (el: Element): (HTMLElement & { toggle?: () => void }) | null => {
	let parent = el.parentElement;
	while (parent) {
		if (
			parent.classList.contains('detail-box') ||
			parent.tagName.toLowerCase() === 'detail-box'
		) {
			return parent;
		}
		parent = parent.parentElement;
	}
	return null;
};

const toggle = (): void => {
	const el = root.value;
	if (!el) return;
	const parent =
		(el.closest('.detail-box') as (HTMLElement & { toggle?: () => void }) | null) ??
		findBox(el);
	parent?.toggle?.();
};

const keydown = (event: KeyboardEvent): void => {
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			if (!event.cmdOrCtrlKey && !event.altKey) {
				toggle();
			}
			break;
	}
};

const pointerdown = (event: PointerEvent): void => {
	if (event.button === 0 && event.target === root.value) {
		toggle();
	}
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.addEventListener(type, listener as EventListener, options);
};

defineExpose({ toggle, on, root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.toggle = toggle;
	el.on = on;
	el.addEventListener('keydown', keydown);
	el.addEventListener('pointerdown', pointerdown);
});
</script>
