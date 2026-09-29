<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiText-properties-grid.label') || 'Text Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiText-properties-grid">
			<UITextMainSection />
			<UITextEffectSection />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useUITextPage } from '@app/composables/useUITextPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { uiTextContextKey } from './ui-text/context.ts';
import UITextMainSection from './ui-text/UITextMainSection.vue';
import UITextEffectSection from './ui-text/UITextEffectSection.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUITextPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(uiTextContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const uiText = Inspector.uiText;
	if (!uiText) return;
	const elements = registryElements(inspectorEls, [
		'uiText-direction',
		'uiText-horizontalAlign',
		'uiText-verticalAlign',
		'uiText-content',
		'uiText-size',
		'uiText-lineSpacing',
		'uiText-letterSpacing',
		'uiText-color',
		'uiText-font',
		'uiText-typeface',
		'uiText-effect-type',
		'uiText-effect-shadowOffsetX',
		'uiText-effect-shadowOffsetY',
		'uiText-effect-strokeWidth',
		'uiText-effect-color',
		'uiText-overflow',
		'uiText-blend'
	]);
	const sliders = registryElements(inspectorEls, [
		'uiText-size-slider',
		'uiText-lineSpacing-slider',
		'uiText-letterSpacing-slider'
	]);
	bindInput(elements, getUIStore(), uiText);
	bindSliders(sliders);

	const el = inspectorEls.get('uiText-vue-mount');
	if (el) {
		attachElementApi(el, { sync, form });
	}
	sync();
});
</script>

<style>
#uiText-content {
	height: 140px;
}

#uiText-size-slider,
#uiText-lineSpacing-slider,
#uiText-letterSpacing-slider {
	flex: 2 1 auto;
}

#uiText-size,
#uiText-lineSpacing,
#uiText-letterSpacing {
	flex: 1 1 auto;
}
</style>
