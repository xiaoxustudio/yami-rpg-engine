<template>
	<Teleport :to="target ?? 'body'" :disabled="target === null">
		<slot />
	</Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getLayoutStore } from '@app/stores/layout';

interface Props {
	value: string;
}

const props = defineProps<Props>();

const store = getLayoutStore();
const target = computed<HTMLElement | null>(() => store.pageTargets[props.value] ?? null);
</script>
