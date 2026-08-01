<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('uiReference-properties-grid') || 'Reference Properties' }}</detail-summary>
		<detail-grid id="uiReference-properties-grid">
			<text>{{ local.getLabel('uiReference-prefabId') || 'Prefab' }}</text
			><custom-box
				id="uiReference-prefabId"
				type="preset-element"
			></custom-box>
			<text>{{ local.getLabel('uiReference-synchronous') || 'Synchronous' }}</text
			><check-box
				id="uiReference-synchronous"
				class="standard large"
			></check-box>
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
