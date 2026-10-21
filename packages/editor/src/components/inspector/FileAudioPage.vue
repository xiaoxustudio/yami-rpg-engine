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
					:label="t('components.fileAudio-volume-box.label') || 'Volume'"
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
					:label="t('components.fileAudio-pan-box.label') || 'Pan'"
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
					:label="t('components.fileAudio-dry-box.label') || 'Reverb - Dry'"
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
					:label="t('components.fileAudio-wet-box.label') || 'Reverb - Wet'"
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
			<div
				ref="elProgress"
				class="box"
				id="fileAudio-progress"
				@pointerdown="onProgressPointerdown"
				@pointermove="onProgressPointermove"
				@pointerleave="onProgressPointerleave"
			>
				<div ref="elProgressFiller" class="box" id="fileAudio-progress-filler"></div>
			</div>
			<div ref="elProgressPointer" class="box" id="fileAudio-progress-pointer"></div>
			<div ref="elCurrentTime" class="text" id="fileAudio-currentTime"></div>
			<div ref="elPointerTime" class="text" id="fileAudio-pointerTime"></div>
		</div>
	</DetailBox>
	<DetailBox id="fileAudio-frequency-detail" open @toggle="onFrequencyToggle">
		<DetailSummary>{{
			t('components.fileAudio-frequency-canvas.label') || 'Frequency'
		}}</DetailSummary>
		<canvas ref="elCanvas" id="fileAudio-frequency-canvas" width="0" height="0"></canvas>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useFileAudioPage } from '@app/composables/useFileAudioPage';
import { useEventListener } from '@app/composables/useEventListener';
import { Inspector } from '@app/inspector/inspector.ts';
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
const elCanvas = ref<HTMLCanvasElement | null>(null);

/**
 * `themechange` 全局事件。原实现把 `fileAudio.themechange` 取出来存进模块级
 * `themechangeHandler` 后注册，并在 `onBeforeUnmount` 手工摘；而且它嵌在
 * `if (progress)` 分支里 —— 没有波形进度元素时**连这个全局监听也不注册**。
 *
 * 用 `enabled`（初始 false，进入那个分支时才置真）精确保留该时机，并**保留方法提取**
 * （先存 handler 再以普通函数调用），避免 `Inspector.fileAudio?.themechange(e)` 把 `this`
 * 隐式绑成宿主。
 */
/**
 * 频率详情展开/收起时重算画布。原先是元素优先 API 的订阅（在 `DetailBox` 实例上挂 DOM 监听）。
 * `DetailBox` 的 `toggle` emit 带的是 value（string），而这个回调并不用它，故不收参数。
 */
const onFrequencyToggle = (): void => {
	Inspector.fileAudio?.windowResize?.();
};

/**
 * 波形进度条上的三个指针监听。原先是元素优先写法
 * （在 `elProgress` 这个模板 ref 上直接 `addEventListener`）。
 *
 * ⚠️ `progressPointermove` 的实现里用了 **`this.clientWidth`**，且它在
 * `file-audio-page.ts` 里被标注为 `this: HTMLElement` —— 也就是说它**依赖
 * "以 DOM 监听方式被调用、`this` 就是那个元素"**。模板 `@pointermove` 给不了这个 `this`，
 * 所以这里显式用 `.call(el, event)` 把元素绑回去，保持原语义。
 * 另外两个（`progressPointerdown` / `progressPointerleave`）不用 `this`，直接转发即可。
 */
const onProgressPointerdown = (event: PointerEvent): void => {
	Inspector.fileAudio?.progressPointerdown?.(event);
};

const onProgressPointermove = (event: PointerEvent): void => {
	const el = elProgress.value;
	if (el) Inspector.fileAudio?.progressPointermove?.call(el, event);
};

const onProgressPointerleave = (event: PointerEvent): void => {
	Inspector.fileAudio?.progressPointerleave?.(event);
};

const themechangeHandler = ref<EventListener | null>(null);
const themechangeEnabled = ref(false);
useEventListener(window, 'themechange', (event) => themechangeHandler.value?.(event), {
	enabled: themechangeEnabled
});

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

		fileAudio.ensureWaveformBuffers?.();
		const onThemeChange = fileAudio.themechange;
		themechangeHandler.value = onThemeChange;
		themechangeEnabled.value = true;
		const el = inspectorEls.get('fileAudio');
		el?.addEventListener('resize', fileAudio.windowResize);
	}

	const el = inspectorEls.get('fileAudio');
	if (el) {
		attachElementApi(el, { update: sync });
	}
	sync();
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
