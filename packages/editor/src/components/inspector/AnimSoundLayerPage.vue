<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSoundLayer-properties-grid') || 'Sound Layer' }}</DetailSummary>
		<div class="detail-grid" id="animSoundLayer-properties-grid">
			<div class="text">{{ local.getLabel('animSoundLayer-playbackRate') || 'Playback Rate' }}</div
			><SelectBox id="animSoundLayer-playbackRate" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const animation = useAnimationStore();
const local = useLocalStore();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.animSoundLayer?.paramInput?.({ target });
};

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
