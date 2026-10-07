<template>
	<Teleport :to="container ?? undefined" :disabled="container === null">
		<slot />
	</Teleport>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, shallowRef } from 'vue';
import { getLayoutStore } from '@app/stores/layout';

interface Props {
	value: string;
	source?: 'page' | 'tab';
}

const props = withDefaults(defineProps<Props>(), { source: 'page' });

const store = getLayoutStore();

const instance = getCurrentInstance();
const localContainer = shallowRef<HTMLElement | null>(null);

onMounted(() => {
	const anchor = instance?.vnode.el as Node | null | undefined;
	const parent = anchor?.parentNode ?? null;
	localContainer.value = parent instanceof HTMLElement ? parent : null;
});

const target = computed<HTMLElement | null>(() => {
	const candidate =
		props.source === 'tab' ? store.tabTargets[props.value] : store.pageTargets[props.value];
	if (candidate === undefined || candidate === null) return null;
	return candidate.isConnected ? candidate : null;
});

const container = computed<HTMLElement | null>(() => target.value ?? localContainer.value);
</script>
