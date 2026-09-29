<template>
	<UIImageGeneralSection />
	<UIImageTransformSection />
	<DetailBox
		id="uiElement-events-group"
		:ref="registryRef(inspectorEls, 'uiElement-events-group')"
		open
	>
		<DetailSummary>{{ t('components.uiElement-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="uiElement-events"
			v-tip="t('components.uiElement-events.tip')"
			:ref="registryRef(inspectorEls, 'uiElement-events')"
			class="inspector-list"
			filter="element"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox
		id="uiElement-scripts-group"
		:ref="registryRef(inspectorEls, 'uiElement-scripts-group')"
		open
	>
		<DetailSummary>{{ t('components.uiElement-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="uiElement-scripts"
			v-tip="t('components.uiElement-scripts.tip')"
			:ref="registryRef(inspectorEls, 'uiElement-scripts')"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane
		id="uiElement-parameter-pane"
		:ref="registryRef(inspectorEls, 'uiElement-parameter-pane')"
	></ParameterPane>
	<UIImagePropertiesSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef, registryElements } from '@app/utils/element-registry';
import { useUIImagePage } from '@app/composables/useUIImagePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import { uiImageContextKey } from './ui-image/context.ts';
import UIImageGeneralSection from './ui-image/UIImageGeneralSection.vue';
import UIImageTransformSection from './ui-image/UIImageTransformSection.vue';
import UIImagePropertiesSection from './ui-image/UIImagePropertiesSection.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIImagePage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(uiImageContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const uiImage = Inspector.uiImage;
	if (!uiImage) return;
	const elements = registryElements(inspectorEls, [
		'uiImage-image',
		'uiImage-display',
		'uiImage-flip',
		'uiImage-blend',
		'uiImage-shiftX',
		'uiImage-shiftY',
		'uiImage-clip',
		'uiImage-border',
		'uiImage-tint-0',
		'uiImage-tint-1',
		'uiImage-tint-2',
		'uiImage-tint-3'
	]);
	const sliders = registryElements(inspectorEls, [
		'uiImage-tint-0-slider',
		'uiImage-tint-1-slider',
		'uiImage-tint-2-slider',
		'uiImage-tint-3-slider'
	]);
	bindInput(elements, getUIStore(), uiImage);
	bindSliders(sliders);

	const el = inspectorEls.get('uiImage-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>

<style>
#uiImage-tint-0-slider,
#uiImage-tint-1-slider,
#uiImage-tint-2-slider,
#uiImage-tint-3-slider {
	flex: 2 1 auto;
}

#uiImage-tint-0,
#uiImage-tint-1,
#uiImage-tint-2,
#uiImage-tint-3 {
	flex: 1 1 auto;
}
</style>
