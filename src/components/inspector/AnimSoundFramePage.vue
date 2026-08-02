<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSoundFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<detail-grid id="animSoundFrame-properties-grid">
			<text>{{ local.getLabel('animSoundFrame-sound') || 'Sound' }}</text
			><custom-box
				id="animSoundFrame-sound"
				type="file"
				filter="audio"
			></custom-box>
			<text>{{ local.getLabel('animSoundFrame-volume') || 'Volume' }}</text
			><number-box
				id="animSoundFrame-volume"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></number-box>
		</detail-grid>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
