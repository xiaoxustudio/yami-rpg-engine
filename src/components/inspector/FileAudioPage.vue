<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileAudio-info-grid') || 'File Info' }}</DetailSummary>
		<detail-grid id="fileAudio-info-grid">
			<text>{{ local.getLabel('fileAudio-name') || 'Name' }}</text><text id="fileAudio-name"></text> <text>{{ local.getLabel('fileAudio-size') || 'Size' }}</text
			><text id="fileAudio-size"></text> <text>{{ local.getLabel('fileAudio-duration') || 'Duration' }}</text
			><text id="fileAudio-duration"></text> <text>{{ local.getLabel('fileAudio-bitrate') || 'Bitrate' }}</text
			><text id="fileAudio-bitrate"></text>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileAudio-mixer-grid') || 'Mixer' }}</DetailSummary>
		<detail-grid id="fileAudio-mixer-grid">
			<text>{{ local.getLabel('fileAudio-volume-box') || 'Volume' }}</text>
			<flex-box id="fileAudio-volume-box">
				<slider-box
					id="fileAudio-volume"
					min="0"
					max="1"
					step="0.1"
				/>
				<text id="fileAudio-volume-info">100%</text>
			</flex-box>
			<text>{{ local.getLabel('fileAudio-pan-box') || 'Pan' }}</text>
			<flex-box id="fileAudio-pan-box">
				<slider-box
					id="fileAudio-pan"
					min="-1"
					max="1"
					step="0.1"
				/>
				<text id="fileAudio-pan-info">0%</text>
			</flex-box>
			<text>{{ local.getLabel('fileAudio-dry-box') || 'Reverb - Dry' }}</text>
			<flex-box id="fileAudio-dry-box">
				<slider-box
					id="fileAudio-dry"
					min="0"
					max="1"
					step="0.1"
				/>
				<text id="fileAudio-dry-info">100%</text>
			</flex-box>
			<text>{{ local.getLabel('fileAudio-wet-box') || 'Reverb - Wet' }}</text>
			<flex-box id="fileAudio-wet-box">
				<slider-box
					id="fileAudio-wet"
					min="0"
					max="1"
					step="0.1"
				/>
				<text id="fileAudio-wet-info">0%</text>
			</flex-box>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileAudio-progress-box') || 'Progress' }}</DetailSummary>
		<box id="fileAudio-progress-box">
			<box id="fileAudio-progress">
				<box id="fileAudio-progress-filler"></box>
			</box>
			<box id="fileAudio-progress-pointer"></box>
			<text id="fileAudio-currentTime"></text>
			<text id="fileAudio-pointerTime"></text>
		</box>
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

const audio = useAudioStore();
const local = useLocalStore();

onMounted(() => {
	audio.syncState();
	local.syncState();
});
</script>
