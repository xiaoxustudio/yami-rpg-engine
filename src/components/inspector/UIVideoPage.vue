<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiVideo-properties-grid') || 'Video Properties' }}</DetailSummary>
		<detail-grid id="uiVideo-properties-grid">
			<text>{{ local.getLabel('uiVideo-video') || 'Video' }}</text
			><CustomBox id="uiVideo-video" type="file" filter="video"></CustomBox>
			<text>{{ local.getLabel('uiVideo-playbackRate') || 'Playback Rate' }}</text
			><NumberBox
				id="uiVideo-playbackRate"
				min="0"
				max="4"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('uiVideo-loop') || 'Loop' }}</text><SelectBox id="uiVideo-loop"></SelectBox>
			<text>{{ local.getLabel('uiVideo-flip') || 'Flip' }}</text><SelectBox id="uiVideo-flip"></SelectBox>
			<text>{{ local.getLabel('uiVideo-blend') || 'Blend' }}</text><SelectBox id="uiVideo-blend"></SelectBox>
		</detail-grid>
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
