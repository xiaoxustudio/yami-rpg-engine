<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiVideo-properties-grid.label') || 'Video Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiVideo-properties-grid">
			<div class="text">{{ t('components.uiVideo-video.label') || 'Video' }}</div>
			<CustomBox
				id="uiVideo-video"
				v-tip="t('components.uiVideo-video.tip')"
				ref="elVideo"
				v-model="form.video"
				type="file"
				filter="video"
				@input="onParamInput"
			></CustomBox>
			<div class="text">
				{{ t('components.uiVideo-playbackRate.label') || 'Playback Rate' }}
			</div>
			<NumberBox
				id="uiVideo-playbackRate"
				v-tip="t('components.uiVideo-playbackRate.tip')"
				ref="elPlaybackRate"
				v-model="form.playbackRate"
				min="0"
				max="4"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiVideo-loop.label') || 'Loop' }}</div>
			<SelectBox id="uiVideo-loop"
				v-tip="t('components.uiVideo-loop.tip')" ref="elLoop" v-model="form.loop" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiVideo-flip.label') || 'Flip' }}</div>
			<SelectBox id="uiVideo-flip"
				v-tip="t('components.uiVideo-flip.tip')" ref="elFlip" v-model="form.flip" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiVideo-blend.label') || 'Blend' }}</div>
			<SelectBox id="uiVideo-blend"
				v-tip="t('components.uiVideo-blend.tip')" ref="elBlend" v-model="form.blend" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import '@app/inspector/element-video-page.ts';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUIVideoPage } from '@app/composables/useUIVideoPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIVideoPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput } = useInspectorInput();

const elVideo = ref<InstanceType<typeof CustomBox> | null>(null);
const elPlaybackRate = ref<InstanceType<typeof NumberBox> | null>(null);
const elLoop = ref<InstanceType<typeof SelectBox> | null>(null);
const elFlip = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);

onMounted(() => {
	const editor = Inspector.uiVideo;
	if (!editor) return;

	elLoop.value?.loadItems([
		{ name: 'Once', value: false },
		{ name: 'Loop', value: true }
	]);

	elFlip.value?.loadItems([
		{ name: 'None', value: 'none' },
		{ name: 'Horizontal', value: 'horizontal' },
		{ name: 'Vertical', value: 'vertical' },
		{ name: 'Both', value: 'both' }
	]);

	elBlend.value?.loadItems([
		{ name: 'Normal', value: 'normal' },
		{ name: 'Additive', value: 'additive' },
		{ name: 'Subtract', value: 'subtract' }
	]);

	const elements = [
		elVideo.value?.root,
		elPlaybackRate.value?.root,
		elLoop.value?.root,
		elFlip.value?.root,
		elBlend.value?.root
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, editor, UI);

	const el = document.getElementById('uiVideo-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
