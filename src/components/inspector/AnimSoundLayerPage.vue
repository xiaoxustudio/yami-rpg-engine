<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSoundLayer-properties-grid') || 'Sound Layer' }}</DetailSummary>
		<detail-grid id="animSoundLayer-properties-grid">
			<text>{{ local.getLabel('animSoundLayer-playbackRate') || 'Playback Rate' }}</text
			><select-box id="animSoundLayer-playbackRate"></select-box>
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
