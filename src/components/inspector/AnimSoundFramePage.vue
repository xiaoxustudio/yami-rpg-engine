<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSoundFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<detail-grid id="animSoundFrame-properties-grid">
			<text>{{ local.getLabel('animSoundFrame-sound') || 'Sound' }}</text
			><CustomBox
				id="animSoundFrame-sound"
				type="file"
				filter="audio"
			></CustomBox>
			<text>{{ local.getLabel('animSoundFrame-volume') || 'Volume' }}</text
			><NumberBox
				id="animSoundFrame-volume"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
		</detail-grid>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
