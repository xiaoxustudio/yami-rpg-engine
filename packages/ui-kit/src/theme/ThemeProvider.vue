<script setup lang="ts">
import { provide, readonly } from 'vue';
import { ThemeKey, defaultTheme } from './theme';
import type { Theme } from './theme';

interface Props {
	theme?: Partial<Theme>;
}

const props = withDefaults(defineProps<Props>(), {
	theme: () => ({})
});

const resolved: Theme = { ...defaultTheme, ...props.theme };
provide(ThemeKey, readonly(resolved));
</script>

<template>
	<slot />
</template>
