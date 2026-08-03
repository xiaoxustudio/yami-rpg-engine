<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiVideo-properties-grid') || 'Video Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiVideo-properties-grid">
			<div class="text">{{ local.getLabel('uiVideo-video') || 'Video' }}</div
			><CustomBox id="uiVideo-video" type="file" filter="video"></CustomBox>
			<div class="text">{{ local.getLabel('uiVideo-playbackRate') || 'Playback Rate' }}</div
			><NumberBox
				id="uiVideo-playbackRate"
				min="0"
				max="4"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiVideo-loop') || 'Loop' }}</div><SelectBox id="uiVideo-loop"></SelectBox>
			<div class="text">{{ local.getLabel('uiVideo-flip') || 'Flip' }}</div><SelectBox id="uiVideo-flip"></SelectBox>
			<div class="text">{{ local.getLabel('uiVideo-blend') || 'Blend' }}</div><SelectBox id="uiVideo-blend"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
