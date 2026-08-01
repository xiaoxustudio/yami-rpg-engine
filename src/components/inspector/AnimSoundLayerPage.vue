<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('animSoundLayer-properties-grid') || 'Sound Layer' }}</detail-summary>
		<detail-grid id="animSoundLayer-properties-grid">
			<text>{{ local.getLabel('animSoundLayer-playbackRate') || 'Playback Rate' }}</text
			><select-box id="animSoundLayer-playbackRate"></select-box>
		</detail-grid>
	</detail-box>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
