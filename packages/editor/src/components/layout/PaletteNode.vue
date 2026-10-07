<template>
	<LayoutPalettePage v-if="active" :value="value" :source="source">
		<slot />
	</LayoutPalettePage>
	<slot v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LayoutPalettePage from './LayoutPalettePage.vue';

interface Props {
	value: string;
	source: 'page' | 'tab';
}

const props = defineProps<Props>();

const active = computed(() => props.value !== '');
</script>
