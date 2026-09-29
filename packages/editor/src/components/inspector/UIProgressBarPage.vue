<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiProgressBar-properties-grid.label') || 'ProgressBar Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiProgressBar-properties-grid">
			<UIProgressBarMainSection />
			<UIProgressBarColorSection />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useUIProgressBarPage } from '@app/composables/useUIProgressBarPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { uiProgressBarContextKey } from './ui-progress-bar/context.ts';
import UIProgressBarMainSection from './ui-progress-bar/UIProgressBarMainSection.vue';
import UIProgressBarColorSection from './ui-progress-bar/UIProgressBarColorSection.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIProgressBarPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(uiProgressBarContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const uiProgressBar = Inspector.uiProgressBar;
	if (!uiProgressBar) return;
	const elements = registryElements(inspectorEls, [
		'uiProgressBar-image',
		'uiProgressBar-display',
		'uiProgressBar-clip',
		'uiProgressBar-type',
		'uiProgressBar-centerX',
		'uiProgressBar-centerY',
		'uiProgressBar-startAngle',
		'uiProgressBar-centralAngle',
		'uiProgressBar-step',
		'uiProgressBar-progress',
		'uiProgressBar-blend',
		'uiProgressBar-colorMode',
		'uiProgressBar-color-0',
		'uiProgressBar-color-1',
		'uiProgressBar-color-2',
		'uiProgressBar-color-3'
	]);
	const sliders = registryElements(inspectorEls, [
		'uiProgressBar-color-0-slider',
		'uiProgressBar-color-1-slider',
		'uiProgressBar-color-2-slider',
		'uiProgressBar-color-3-slider'
	]);
	bindInput(elements, getUIStore(), uiProgressBar);
	bindSliders(sliders);

	const el = inspectorEls.get('uiProgressBar-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>

<style>
#uiProgressBar-color-0-slider,
#uiProgressBar-color-1-slider,
#uiProgressBar-color-2-slider,
#uiProgressBar-color-3-slider {
	flex: 2 1 auto;
}

#uiProgressBar-color-0,
#uiProgressBar-color-1,
#uiProgressBar-color-2,
#uiProgressBar-color-3 {
	flex: 1 1 auto;
}
</style>
