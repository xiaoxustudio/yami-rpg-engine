<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSoundFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animSoundFrame-properties-grid">
			<div class="text">{{ local.getLabel('animSoundFrame-sound') || 'Sound' }}</div
			><CustomBox
				id="animSoundFrame-sound"
				type="file"
				filter="audio"
			></CustomBox>
			<div class="text">{{ local.getLabel('animSoundFrame-volume') || 'Volume' }}</div
			><NumberBox
				id="animSoundFrame-volume"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
		</div>
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
