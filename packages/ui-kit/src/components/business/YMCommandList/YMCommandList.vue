<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createCommandListApi, type CommandListApiOptions } from './command-api';

interface Props {
	id?: string;
	options?: CommandListApiOptions | null;
}

interface CommandListRootElement extends HTMLElement {
	resize: EventListener;
	listFocus: EventListener;
	listBlur: EventListener;
	keydown: EventListener;
	pointerdown: EventListener;
	pointerup: EventListener;
	windowVariableChange: EventListener;
}

const props = withDefaults(defineProps<Props>(), {
	options: null
});

const root = ref<HTMLElement | null>(null);

defineExpose({
	root
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	createCommandListApi(el, props.options ?? {});
});

onBeforeUnmount(() => {
	const el = root.value as CommandListRootElement | null;
	if (!el) return;
	el.removeEventListener('scroll', el.resize);
	el.removeEventListener('focus', el.listFocus);
	el.removeEventListener('blur', el.listBlur);
	el.removeEventListener('keydown', el.keydown);
	el.removeEventListener('pointerdown', el.pointerdown);
	el.removeEventListener('pointerup', el.pointerup);
	window.removeEventListener('variablechange', el.windowVariableChange);
});
</script>

<template>
	<div ref="root" class="command-list" :id="props.id" />
</template>

<style module>
:global(:where(.command-list)) {
	display: block;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	user-select: none;
}

:global(:where(.command-item)) {
	display: block;
	position: relative;
	height: 20px;
	line-height: 20px;
	white-space: pre;
}

:global(:where(.command-item.selected)) {
	color: var(--ym-color-on-primary);
	background-color: var(--ym-color-selected);
}
</style>
