<template>
	<UIButtonImageSection />
	<UIButtonContentSection />
	<UIButtonSoundSection />
</template>

<script setup lang="ts">
import { onMounted, provide, onUnmounted } from 'vue';
import { uiButtonNodes } from '@app/composables/inspector-page-nodes';
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
import { useUIButtonPage } from '@app/composables/useUIButtonPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
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
	const elements = [
		uiButtonNodes.pick('display'),
		uiButtonNodes.pick('normalImage'),
		uiButtonNodes.pick('normalClip'),
		uiButtonNodes.pick('hoverImage'),
		uiButtonNodes.pick('hoverClip'),
		uiButtonNodes.pick('activeImage'),
		uiButtonNodes.pick('activeClip'),
		uiButtonNodes.pick('flip'),
		uiButtonNodes.pick('border'),
		uiButtonNodes.pick('imagePadding'),
		uiButtonNodes.pick('imageOpacity'),
		uiButtonNodes.pick('imageEffect'),
		uiButtonNodes.pick('normalTint0'),
		uiButtonNodes.pick('normalTint1'),
		uiButtonNodes.pick('normalTint2'),
		uiButtonNodes.pick('normalTint3'),
		uiButtonNodes.pick('hoverTint0'),
		uiButtonNodes.pick('hoverTint1'),
		uiButtonNodes.pick('hoverTint2'),
		uiButtonNodes.pick('hoverTint3'),
		uiButtonNodes.pick('activeTint0'),
		uiButtonNodes.pick('activeTint1'),
		uiButtonNodes.pick('activeTint2'),
		uiButtonNodes.pick('activeTint3'),
		uiButtonNodes.pick('direction'),
		uiButtonNodes.pick('horizontalAlign'),
		uiButtonNodes.pick('verticalAlign'),
		uiButtonNodes.pick('content'),
		uiButtonNodes.pick('size'),
		uiButtonNodes.pick('letterSpacing'),
		uiButtonNodes.pick('textPadding'),
		uiButtonNodes.pick('font'),
		uiButtonNodes.pick('typeface'),
		uiButtonNodes.pick('textEffectType'),
		uiButtonNodes.pick('textEffectShadowOffsetX'),
		uiButtonNodes.pick('textEffectShadowOffsetY'),
		uiButtonNodes.pick('textEffectStrokeWidth'),
		uiButtonNodes.pick('textEffectColor'),
		uiButtonNodes.pick('normalColor'),
		uiButtonNodes.pick('hoverColor'),
		uiButtonNodes.pick('activeColor'),
		uiButtonNodes.pick('hoverSound'),
		uiButtonNodes.pick('clickSound')
	].filter((el): el is HTMLElement => el != null);
	const sliders = [
		uiButtonNodes.pick('imagePaddingSlider'),
		uiButtonNodes.pick('imageOpacitySlider'),
		uiButtonNodes.pick('sizeSlider'),
		uiButtonNodes.pick('letterSpacingSlider'),
		uiButtonNodes.pick('textPaddingSlider')
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, getUIStore(), uiButton);
	bindSliders(sliders);

	const bridgeApi: PageSyncApi = { sync, form };
	inspectorPageSync.uiButton.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.uiButton.reset(bridgeApi));
	sync();
});
</script>
