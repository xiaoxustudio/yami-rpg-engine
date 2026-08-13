<template>
	<AppShell />
</template>

<script setup lang="ts">
import AppShell from './AppShell.vue';
import { Toast } from '@/components/toast';
import { provideToastService } from '@app/composables/useToastService';

provideToastService({
	show: (message, type, duration) => Toast.show(message, type, duration),
	dismiss: () => undefined
});
</script>
