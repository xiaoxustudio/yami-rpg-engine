<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileAudio-info-grid') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileAudio-info-grid">
			<div class="text">{{ local.getLabel('fileAudio-name') || 'Name' }}</div><div class="text" id="fileAudio-name">{{ form.name }}</div> <div class="text">{{ local.getLabel('fileAudio-size') || 'Size' }}</div
			><div class="text" id="fileAudio-size">{{ form.size }}</div> <div class="text">{{ local.getLabel('fileAudio-duration') || 'Duration' }}</div
			><div class="text" id="fileAudio-duration">{{ form.duration }}</div> <div class="text">{{ local.getLabel('fileAudio-bitrate') || 'Bitrate' }}</div
			><div class="text" id="fileAudio-bitrate">{{ form.bitrate }}</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileAudio-mixer-grid') || 'Mixer' }}</DetailSummary>
		<div class="detail-grid" id="fileAudio-mixer-grid">
			<div class="text">{{ local.getLabel('fileAudio-volume-box') || 'Volume' }}</div>
			<div class="flex-box" id="fileAudio-volume-box">
				<SliderBox
					id="fileAudio-volume" @input="onParamInput"
					min="0"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-volume-info">{{ form.volume * 100 }}%</div>
			</div>
			<div class="text">{{ local.getLabel('fileAudio-pan-box') || 'Pan' }}</div>
			<div class="flex-box" id="fileAudio-pan-box">
				<SliderBox
					id="fileAudio-pan" @input="onParamInput"
					min="-1"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-pan-info">{{ form.pan * 100 }}%</div>
			</div>
			<div class="text">{{ local.getLabel('fileAudio-dry-box') || 'Reverb - Dry' }}</div>
			<div class="flex-box" id="fileAudio-dry-box">
				<SliderBox
					id="fileAudio-dry" @input="onParamInput"
					min="0"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-dry-info">{{ form.dry * 100 }}%</div>
			</div>
			<div class="text">{{ local.getLabel('fileAudio-wet-box') || 'Reverb - Wet' }}</div>
			<div class="flex-box" id="fileAudio-wet-box">
				<SliderBox
					id="fileAudio-wet" @input="onParamInput"
					min="0"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-wet-info">{{ form.wet * 100 }}%</div>
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
			<div class="text" id="fileAudio-currentTime"></div>
			<div class="text" id="fileAudio-pointerTime"></div>
		</div>
	</DetailBox>
	<DetailBox id="fileAudio-frequency-detail" open>
		<DetailSummary>{{ local.getLabel('fileAudio-frequency-canvas') || 'Frequency' }}</DetailSummary>
		<canvas id="fileAudio-frequency-canvas" width="0" height="0"></canvas>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useFileAudioPage } from '@app/composables/useFileAudioPage';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useFileAudioPage();

onMounted(() => {
	const el = document.getElementById('fileAudio');
	if (!el) return;
	attachElementApi(el, { update: sync });
	sync();
});
</script>
