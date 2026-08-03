<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileAudio-info-grid') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileAudio-info-grid">
			<text>{{ local.getLabel('fileAudio-name') || 'Name' }}</text><text id="fileAudio-name"></text> <text>{{ local.getLabel('fileAudio-size') || 'Size' }}</text
			><text id="fileAudio-size"></text> <text>{{ local.getLabel('fileAudio-duration') || 'Duration' }}</text
			><text id="fileAudio-duration"></text> <text>{{ local.getLabel('fileAudio-bitrate') || 'Bitrate' }}</text
			><text id="fileAudio-bitrate"></text>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileAudio-mixer-grid') || 'Mixer' }}</DetailSummary>
		<div class="detail-grid" id="fileAudio-mixer-grid">
			<text>{{ local.getLabel('fileAudio-volume-box') || 'Volume' }}</text>
			<div class="flex-box" id="fileAudio-volume-box">
				<SliderBox
					id="fileAudio-volume"
					min="0"
					max="1"
					step="0.1"
				/>
				<text id="fileAudio-volume-info">100%</text>
			</div>
			<text>{{ local.getLabel('fileAudio-pan-box') || 'Pan' }}</text>
			<div class="flex-box" id="fileAudio-pan-box">
				<SliderBox
					id="fileAudio-pan"
					min="-1"
					max="1"
					step="0.1"
				/>
				<text id="fileAudio-pan-info">0%</text>
			</div>
			<text>{{ local.getLabel('fileAudio-dry-box') || 'Reverb - Dry' }}</text>
			<div class="flex-box" id="fileAudio-dry-box">
				<SliderBox
					id="fileAudio-dry"
					min="0"
					max="1"
					step="0.1"
				/>
				<text id="fileAudio-dry-info">100%</text>
			</div>
			<text>{{ local.getLabel('fileAudio-wet-box') || 'Reverb - Wet' }}</text>
			<div class="flex-box" id="fileAudio-wet-box">
				<SliderBox
					id="fileAudio-wet"
					min="0"
					max="1"
					step="0.1"
				/>
				<text id="fileAudio-wet-info">0%</text>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileAudio-progress-box') || 'Progress' }}</DetailSummary>
		<div class="box" id="fileAudio-progress-box">
			<div class="box" id="fileAudio-progress">
				<div class="box" id="fileAudio-progress-filler"></div>
			</div>
			<div class="box" id="fileAudio-progress-pointer"></div>
			<text id="fileAudio-currentTime"></text>
			<text id="fileAudio-pointerTime"></text>
		</div>
	</DetailBox>
	<DetailBox id="fileAudio-frequency-detail" open>
		<DetailSummary>{{ local.getLabel('fileAudio-frequency-canvas') || 'Frequency' }}</DetailSummary>
		<canvas id="fileAudio-frequency-canvas" width="0" height="0"></canvas>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAudioStore } from '@app/stores/audio';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const audio = useAudioStore();
const local = useLocalStore();

onMounted(() => {
	audio.syncState();
	local.syncState();
});
</script>
