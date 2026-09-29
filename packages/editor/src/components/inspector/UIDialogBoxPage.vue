<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiDialogBox-properties-grid.label') || 'DialogBox Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiDialogBox-properties-grid">
			<UIDialogBoxMainSection />
			<UIDialogBoxEffectSection />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useUIDialogBoxPage } from '@app/composables/useUIDialogBoxPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { uiDialogBoxContextKey } from './ui-dialog-box/context.ts';
import UIDialogBoxMainSection from './ui-dialog-box/UIDialogBoxMainSection.vue';
import UIDialogBoxEffectSection from './ui-dialog-box/UIDialogBoxEffectSection.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIDialogBoxPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(uiDialogBoxContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const uiDialogBox = Inspector.uiDialogBox;
	if (!uiDialogBox) return;
	const elements = registryElements(inspectorEls, [
		'uiDialogBox-content',
		'uiDialogBox-interval',
		'uiDialogBox-size',
		'uiDialogBox-lineSpacing',
		'uiDialogBox-letterSpacing',
		'uiDialogBox-color',
		'uiDialogBox-font',
		'uiDialogBox-typeface',
		'uiDialogBox-effect-type',
		'uiDialogBox-effect-shadowOffsetX',
		'uiDialogBox-effect-shadowOffsetY',
		'uiDialogBox-effect-strokeWidth',
		'uiDialogBox-effect-color',
		'uiDialogBox-blend'
	]);
	const sliders = registryElements(inspectorEls, [
		'uiDialogBox-size-slider',
		'uiDialogBox-lineSpacing-slider',
		'uiDialogBox-letterSpacing-slider'
	]);
	bindInput(elements, getUIStore(), uiDialogBox);
	bindSliders(sliders);

	const el = inspectorEls.get('uiDialogBox-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>

<style>
#uiDialogBox-content {
	height: 140px;
}

#uiDialogBox-size-slider,
#uiDialogBox-lineSpacing-slider,
#uiDialogBox-letterSpacing-slider {
	flex: 2 1 auto;
}

#uiDialogBox-size,
#uiDialogBox-lineSpacing,
#uiDialogBox-letterSpacing {
	flex: 1 1 auto;
}
</style>
