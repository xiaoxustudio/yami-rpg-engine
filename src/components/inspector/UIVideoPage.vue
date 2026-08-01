<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('uiVideo-properties-grid') || 'Video Properties' }}</detail-summary>
		<detail-grid id="uiVideo-properties-grid">
			<text>{{ local.getLabel('uiVideo-video') || 'Video' }}</text
			><custom-box id="uiVideo-video" type="file" filter="video"></custom-box>
			<text>{{ local.getLabel('uiVideo-playbackRate') || 'Playback Rate' }}</text
			><number-box
				id="uiVideo-playbackRate"
				min="0"
				max="4"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('uiVideo-loop') || 'Loop' }}</text><select-box id="uiVideo-loop"></select-box>
			<text>{{ local.getLabel('uiVideo-flip') || 'Flip' }}</text><select-box id="uiVideo-flip"></select-box>
			<text>{{ local.getLabel('uiVideo-blend') || 'Blend' }}</text><select-box id="uiVideo-blend"></select-box>
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
