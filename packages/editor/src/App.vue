<template>
	<AppShell />
</template>

<script setup lang="ts">
import AppShell from './AppShell.vue';
import '@app/legacy/components/element-accessors';
import '@app/legacy/components/scroll-listener';
import '@app/legacy/components/history-timer';
import { Toast } from '@app/legacy/components/toast';
import { provideToastService } from '@app/composables/useToastService';

provideToastService({
	show: (message, type, duration) => Toast.show(message, type, duration),
	dismiss: () => undefined
});
</script>
