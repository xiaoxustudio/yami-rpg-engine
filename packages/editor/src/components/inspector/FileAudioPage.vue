<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileAudio-info-grid.label') || 'File Info'
		}}</DetailSummary>
		<div class="detail-grid" id="fileAudio-info-grid">
			<div class="text">{{ t('components.fileAudio-name.label') || 'Name' }}</div>
			<div class="text" id="fileAudio-name" v-tip="t('components.fileAudio-name.tip')">
				{{ form.name }}
			</div>
			<div class="text">{{ t('components.fileAudio-size.label') || 'Size' }}</div>
			<div class="text" id="fileAudio-size" v-tip="t('components.fileAudio-size.tip')">
				{{ form.size }}
			</div>
			<div class="text">{{ t('components.fileAudio-duration.label') || 'Duration' }}</div>
			<div
				class="text"
				id="fileAudio-duration"
				v-tip="t('components.fileAudio-duration.tip')"
			>
				{{ form.duration }}
			</div>
			<div class="text">{{ t('components.fileAudio-bitrate.label') || 'Bitrate' }}</div>
			<div class="text" id="fileAudio-bitrate" v-tip="t('components.fileAudio-bitrate.tip')">
				{{ form.bitrate }}
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileAudio-mixer-grid.label') || 'Mixer' }}</DetailSummary>
		<div class="detail-grid" id="fileAudio-mixer-grid">
			<div class="text">{{ t('components.fileAudio-volume-box.label') || 'Volume' }}</div>
			<div
				class="flex-box"
				id="fileAudio-volume-box"
				v-tip="t('components.fileAudio-volume-box.tip')"
			>
				<SliderBox
					id="fileAudio-volume"
					v-model="form.volume"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-volume-info">{{ form.volume * 100 }}%</div>
			</div>
			<div class="text">{{ t('components.fileAudio-pan-box.label') || 'Pan' }}</div>
			<div
				class="flex-box"
				id="fileAudio-pan-box"
				v-tip="t('components.fileAudio-pan-box.tip')"
			>
				<SliderBox
					id="fileAudio-pan"
					v-model="form.pan"
					@input="onParamInput"
					min="-1"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-pan-info">{{ form.pan * 100 }}%</div>
			</div>
			<div class="text">{{ t('components.fileAudio-dry-box.label') || 'Reverb - Dry' }}</div>
			<div
				class="flex-box"
				id="fileAudio-dry-box"
				v-tip="t('components.fileAudio-dry-box.tip')"
			>
				<SliderBox
					id="fileAudio-dry"
					v-model="form.dry"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-dry-info">{{ form.dry * 100 }}%</div>
			</div>
			<div class="text">{{ t('components.fileAudio-wet-box.label') || 'Reverb - Wet' }}</div>
			<div
				class="flex-box"
				id="fileAudio-wet-box"
				v-tip="t('components.fileAudio-wet-box.tip')"
			>
				<SliderBox
					id="fileAudio-wet"
					v-model="form.wet"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.1"
				/>
				<div class="text" id="fileAudio-wet-info">{{ form.wet * 100 }}%</div>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileAudio-progress-box.label') || 'Progress'
		}}</DetailSummary>
		<div class="box" id="fileAudio-progress-box">
			<div ref="elProgress" class="box" id="fileAudio-progress">
				<div ref="elProgressFiller" class="box" id="fileAudio-progress-filler"></div>
			</div>
			<div ref="elProgressPointer" class="box" id="fileAudio-progress-pointer"></div>
			<div ref="elCurrentTime" class="text" id="fileAudio-currentTime"></div>
			<div ref="elPointerTime" class="text" id="fileAudio-pointerTime"></div>
		</div>
	</DetailBox>
	<DetailBox ref="elFrequencyDetail" id="fileAudio-frequency-detail" open>
		<DetailSummary>{{
			t('components.fileAudio-frequency-canvas.label') || 'Frequency'
		}}</DetailSummary>
		<canvas ref="elCanvas" id="fileAudio-frequency-canvas" width="0" height="0"></canvas>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useFileAudioPage } from '@app/composables/useFileAudioPage';
import { Inspector } from '@app/inspector/inspector.ts';
import { AudioManager } from '@app/audio/audio-manager.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useFileAudioPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

const elProgress = ref<HTMLElement | null>(null);
const elProgressFiller = ref<HTMLElement | null>(null);
const elProgressPointer = ref<HTMLElement | null>(null);
const elCurrentTime = ref<HTMLElement | null>(null);
const elPointerTime = ref<HTMLElement | null>(null);
const elFrequencyDetail = ref<InstanceType<typeof DetailBox> | null>(null);
const elCanvas = ref<HTMLCanvasElement | null>(null);

let themechangeHandler: ((event: Event) => void) | null = null;

onMounted(() => {
	const fileAudio = Inspector.fileAudio;
	if (!fileAudio) return;

	const progress = elProgress.value;
	if (progress) {
		fileAudio.progress = progress;
		fileAudio.progressFiller = elProgressFiller.value;
		const pointer = elProgressPointer.value;
		if (pointer) pointer.style.display = 'none';
		fileAudio.pointer = pointer;
		fileAudio.currentTimeInfo = elCurrentTime.value;
		fileAudio.pointerTimeInfo = elPointerTime.value;
		const canvas = elCanvas.value;
		fileAudio.canvas = canvas;
		fileAudio.context = canvas?.getContext('2d', { desynchronized: true });

		const analyser = AudioManager.analyser;
		if (analyser) {
			analyser.fftSize = 512;
			analyser.smoothingTimeConstant = 0;
			fileAudio.dataArray = new Uint8Array(analyser.frequencyBinCount);
			fileAudio.intervals = new Float64Array(64);
			fileAudio.intensities = new Float64Array(64);
			fileAudio.intensities.index = 0;
		}

		// 监听器存变量再 add/remove，保证卸载时能摘掉（只 add 就摘不掉）
		const onThemeChange = fileAudio.themechange;
		themechangeHandler = onThemeChange;
		window.addEventListener('themechange', onThemeChange);
		const el = inspectorEls.get('fileAudio');
		el?.addEventListener('resize', fileAudio.windowResize);
		elFrequencyDetail.value?.on('toggle', fileAudio.windowResize);
		progress.addEventListener('pointerdown', fileAudio.progressPointerdown);
		progress.addEventListener('pointermove', fileAudio.progressPointermove);
		progress.addEventListener('pointerleave', fileAudio.progressPointerleave);
	}

	const el = inspectorEls.get('fileAudio');
	if (el) {
		attachElementApi(el, { update: sync });
	}
	sync();
});
onBeforeUnmount(() => {
	if (themechangeHandler) window.removeEventListener('themechange', themechangeHandler);
});
</script>

<style>
#fileAudio-volume,
#fileAudio-pan,
#fileAudio-dry,
#fileAudio-wet {
	flex-grow: 1;
}

#fileAudio-volume-info,
#fileAudio-pan-info,
#fileAudio-dry-info,
#fileAudio-wet-info {
	padding-right: 2px;
	width: 40px;
	text-align: right;
}

#fileAudio-progress-box {
	display: block;
	width: 100%;
	height: 160px;
	overflow: hidden;
}

#fileAudio-progress {
	position: absolute;
	width: 100%;
	height: 160px;
	background-color: var(--audio-waveform-background);
	-webkit-mask-size: 100% 100%;
	mask-size: 100% 100%;
	image-rendering: pixelated;
	transition-property: opacity;
	transition-duration: 0.5s;
	opacity: 0;
}

#fileAudio-progress-filler {
	position: absolute;
	width: 100%;
	height: 160px;
	background-color: var(--audio-waveform-background-active);
	pointer-events: none;
}

#fileAudio-progress-pointer {
	position: absolute;
	height: 160px;
	border-left: 1px dotted #cc0000;
	pointer-events: none;
}

#fileAudio-currentTime {
	position: absolute;
	margin-left: 10px;
	margin-top: 4px;
	line-height: 16px;
	font-size: 16px;
	font-family: var(--font-family-mono);
	text-shadow: var(--timeline-ruler-number-shadow);
	pointer-events: none;
}

#fileAudio-pointerTime {
	position: absolute;
	margin-left: 8px;
	margin-top: 72px;
	padding: 0 2px;
	line-height: 16px;
	font-size: 16px;
	font-family: var(--font-family-mono);
	background-color: rgba(0, 0, 0, 0.25);
	border-radius: 2px;
	pointer-events: none;
}
</style>
