<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileAudio-info-grid') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileAudio-info-grid">
			<div class="text">{{ local.getLabel('fileAudio-name') || 'Name' }}</div><div class="text" id="fileAudio-name">{{ name }}</div> <div class="text">{{ local.getLabel('fileAudio-size') || 'Size' }}</div
			><div class="text" id="fileAudio-size">{{ size }}</div> <div class="text">{{ local.getLabel('fileAudio-duration') || 'Duration' }}</div
			><div class="text" id="fileAudio-duration">{{ duration }}</div> <div class="text">{{ local.getLabel('fileAudio-bitrate') || 'Bitrate' }}</div
			><div class="text" id="fileAudio-bitrate">{{ bitrate }}</div>
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
				<div class="text" id="fileAudio-volume-info">{{ volume * 100 }}%</div>
			</div>
			<div class="text">{{ local.getLabel('fileAudio-pan-box') || 'Pan' }}</div>
			<div class="flex-box" id="fileAudio-pan-box">
				<SliderBox
					id="fileAudio-pan" @input="onParamInput"
					min="-1"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-pan-info">{{ pan * 100 }}%</div>
			</div>
			<div class="text">{{ local.getLabel('fileAudio-dry-box') || 'Reverb - Dry' }}</div>
			<div class="flex-box" id="fileAudio-dry-box">
				<SliderBox
					id="fileAudio-dry" @input="onParamInput"
					min="0"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-dry-info">{{ dry * 100 }}%</div>
			</div>
			<div class="text">{{ local.getLabel('fileAudio-wet-box') || 'Reverb - Wet' }}</div>
			<div class="flex-box" id="fileAudio-wet-box">
				<SliderBox
					id="fileAudio-wet" @input="onParamInput"
					min="0"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-wet-info">{{ wet * 100 }}%</div>
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
import { onMounted, ref } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useAudioStore } from '@app/stores/audio';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const audio = useAudioStore();
const local = useLocalStore();

const name = ref('');
const size = ref('');
const duration = ref('');
const bitrate = ref('');
const volume = ref(1);
const pan = ref(0);
const dry = ref(1);
const wet = ref(0);

const update = (): void => {
	const fileAudio = Inspector?.fileAudio ?? null;
	const info = fileAudio?.info ?? null;
	if (info) {
		name.value = info.name;
		size.value = info.size;
		duration.value = info.duration;
		bitrate.value = info.bitrate;
	}
	const params = fileAudio?.params ?? null;
	if (params) {
		volume.value = params.volume;
		pan.value = params.pan;
		dry.value = params.dry;
		wet.value = params.wet;
	}
};

const onParamInput = () => {
	Inspector?.fileAudio?.paramInput?.();
};

onMounted(() => {
	const el = document.getElementById('fileAudio');
	if (!el) return;
	attachElementApi(el, { update });
	update();
	audio.syncState();
	local.syncState();
});
</script>
