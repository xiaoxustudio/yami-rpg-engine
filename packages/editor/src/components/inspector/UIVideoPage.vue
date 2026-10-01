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
				:label="t('components.uiVideo-playbackRate.label') || 'Playback Rate'"
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
			<SelectBox
				:label="t('components.uiVideo-loop.label') || 'Loop'"
				id="uiVideo-loop"
				v-tip="t('components.uiVideo-loop.tip')"
				ref="elLoop"
				v-model="form.loop"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiVideo-flip.label') || 'Flip' }}</div>
			<SelectBox
				:label="t('components.uiVideo-flip.label') || 'Flip'"
				id="uiVideo-flip"
				v-tip="t('components.uiVideo-flip.tip')"
				ref="elFlip"
				v-model="form.flip"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiVideo-blend.label') || 'Blend' }}</div>
			<SelectBox
				:label="t('components.uiVideo-blend.label') || 'Blend'"
				id="uiVideo-blend"
				v-tip="t('components.uiVideo-blend.tip')"
				ref="elBlend"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inspectorEls } from '@app/inspector/element-registry.ts';
import '@app/inspector/element-video-page.ts';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUIVideoPage } from '@app/composables/useUIVideoPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIVideoPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
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
		{
			name: t('components.uiVideo-loop.options.false.name'),
			tip: t('components.uiVideo-loop.options.false.tip'),
			value: false
		},
		{
			name: t('components.uiVideo-loop.options.true.name'),
			tip: t('components.uiVideo-loop.options.true.tip'),
			value: true
		}
	]);

	elFlip.value?.loadItems([
		{
			name: t('components.uiVideo-flip.options.none.name'),
			tip: t('components.uiVideo-flip.options.none.tip'),
			value: 'none'
		},
		{
			name: t('components.uiVideo-flip.options.horizontal.name'),
			tip: t('components.uiVideo-flip.options.horizontal.tip'),
			value: 'horizontal'
		},
		{
			name: t('components.uiVideo-flip.options.vertical.name'),
			tip: t('components.uiVideo-flip.options.vertical.tip'),
			value: 'vertical'
		},
		{
			name: t('components.uiVideo-flip.options.both.name'),
			tip: t('components.uiVideo-flip.options.both.tip'),
			value: 'both'
		}
	]);

	elBlend.value?.loadItems([
		{
			name: t('components.uiVideo-blend.options.normal.name'),
			tip: t('components.uiVideo-blend.options.normal.tip'),
			value: 'normal'
		},
		{
			name: t('components.uiVideo-blend.options.additive.name'),
			tip: t('components.uiVideo-blend.options.additive.tip'),
			value: 'additive'
		},
		{
			name: t('components.uiVideo-blend.options.subtract.name'),
			tip: t('components.uiVideo-blend.options.subtract.tip'),
			value: 'subtract'
		}
	]);

	const elements = [
		elVideo.value?.root,
		elPlaybackRate.value?.root,
		elLoop.value?.root,
		elFlip.value?.root,
		elBlend.value?.root
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, getUIStore(), editor);

	const el = inspectorEls.get('uiVideo-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
