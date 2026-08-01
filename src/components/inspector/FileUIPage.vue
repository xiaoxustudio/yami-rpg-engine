<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileUI-foreground-grid') || 'Stage Foreground' }}</detail-summary>
		<detail-grid id="fileUI-foreground-grid">
			<text>{{ local.getLabel('fileUI-width') || 'Width' }}</text
			><number-box id="fileUI-width" min="8" max="7680" unit="px" />
			<text>{{ local.getLabel('fileUI-height') || 'Height' }}</text
			><number-box id="fileUI-height" min="8" max="7680" unit="px" />
		</detail-grid>
	</detail-box>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
