<template>
	<UIButtonImageSection />
	<UIButtonContentSection />
	<UIButtonSoundSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { registryElements } from '@app/utils/element-registry';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useUIButtonPage } from '@app/composables/useUIButtonPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import { uiButtonContextKey } from './ui-button/context.ts';
import UIButtonImageSection from './ui-button/UIButtonImageSection.vue';
import UIButtonContentSection from './ui-button/UIButtonContentSection.vue';
import UIButtonSoundSection from './ui-button/UIButtonSoundSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useUIButtonPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(uiButtonContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const uiButton = Inspector.uiButton;
	if (!uiButton) return;
	const elements = registryElements(inspectorEls, [
		'uiButton-display',
		'uiButton-normalImage',
		'uiButton-normalClip',
		'uiButton-hoverImage',
		'uiButton-hoverClip',
		'uiButton-activeImage',
		'uiButton-activeClip',
		'uiButton-flip',
		'uiButton-border',
		'uiButton-imagePadding',
		'uiButton-imageOpacity',
		'uiButton-imageEffect',
		'uiButton-normalTint-0',
		'uiButton-normalTint-1',
		'uiButton-normalTint-2',
		'uiButton-normalTint-3',
		'uiButton-hoverTint-0',
		'uiButton-hoverTint-1',
		'uiButton-hoverTint-2',
		'uiButton-hoverTint-3',
		'uiButton-activeTint-0',
		'uiButton-activeTint-1',
		'uiButton-activeTint-2',
		'uiButton-activeTint-3',
		'uiButton-direction',
		'uiButton-horizontalAlign',
		'uiButton-verticalAlign',
		'uiButton-content',
		'uiButton-size',
		'uiButton-letterSpacing',
		'uiButton-textPadding',
		'uiButton-font',
		'uiButton-typeface',
		'uiButton-textEffect-type',
		'uiButton-textEffect-shadowOffsetX',
		'uiButton-textEffect-shadowOffsetY',
		'uiButton-textEffect-strokeWidth',
		'uiButton-textEffect-color',
		'uiButton-normalColor',
		'uiButton-hoverColor',
		'uiButton-activeColor',
		'uiButton-hoverSound',
		'uiButton-clickSound'
	]);
	const sliders = registryElements(inspectorEls, [
		'uiButton-imagePadding-slider',
		'uiButton-imageOpacity-slider',
		'uiButton-size-slider',
		'uiButton-letterSpacing-slider',
		'uiButton-textPadding-slider'
	]);
	bindInput(elements, getUIStore(), uiButton);
	bindSliders(sliders);

	const el = inspectorEls.get('uiButton-vue-mount');
	if (el) {
		attachElementApi(el, { sync, form });
	}
	sync();
});
</script>
