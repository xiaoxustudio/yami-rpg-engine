<template>
	<div class="text">{{ t('components.sceneRegion-name.label') || 'Name' }}</div>
	<TextBox
		id="sceneRegion-name"
		v-tip="t('components.sceneRegion-name.tip')"
		ref="elName"
		v-model="form.name"
		@input="onParamInput"
	></TextBox>
	<div class="text">{{ t('components.sceneRegion-color.label') || 'Color' }}</div>
	<ColorBox
		id="sceneRegion-color"
		v-tip="t('components.sceneRegion-color.tip')"
		ref="elColor"
		v-model="form.color"
		@input="onParamInput"
	></ColorBox>
	<div class="text">{{ t('components.sceneRegion-x.label') || 'X' }}</div>
	<NumberBox
		id="sceneRegion-x"
		v-tip="t('components.sceneRegion-x.tip')"
		ref="elX"
		v-model="form.x"
		@input="onParamInput"
		min="-128"
		max="640"
		step="0.1"
		decimals="4"
	></NumberBox>
	<div class="text">{{ t('components.sceneRegion-y.label') || 'Y' }}</div>
	<NumberBox
		id="sceneRegion-y"
		v-tip="t('components.sceneRegion-y.tip')"
		ref="elY"
		v-model="form.y"
		@input="onParamInput"
		min="-128"
		max="640"
		step="0.1"
		decimals="4"
	></NumberBox>
	<div class="text">{{ t('components.sceneRegion-width.label') || 'Width' }}</div>
	<NumberBox
		id="sceneRegion-width"
		v-tip="t('components.sceneRegion-width.tip')"
		ref="elWidth"
		v-model="form.width"
		@input="onParamInput"
		min="0"
		max="512"
		decimals="4"
	></NumberBox>
	<div class="text">{{ t('components.sceneRegion-height.label') || 'Height' }}</div>
	<NumberBox
		id="sceneRegion-height"
		v-tip="t('components.sceneRegion-height.tip')"
		ref="elHeight"
		v-model="form.height"
		@input="onParamInput"
		min="0"
		max="512"
		decimals="4"
	></NumberBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { sceneRegionContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(sceneRegionContextKey)!;
const { bindInput } = useInspectorInput();

const elName = ref<InstanceType<typeof TextBox> | null>(null);
const elColor = ref<InstanceType<typeof ColorBox> | null>(null);
const elX = ref<InstanceType<typeof NumberBox> | null>(null);
const elY = ref<InstanceType<typeof NumberBox> | null>(null);
const elWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elHeight = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	const editor = Inspector.sceneRegion;
	if (!editor) return;
	try {
		const elements = [
			elName.value?.root,
			elColor.value?.root,
			elX.value?.root,
			elY.value?.root,
			elWidth.value?.root,
			elHeight.value?.root
		].filter((el): el is HTMLElement => el != null);
		bindInput(elements, editor, Scene);
	} catch (e) {
		console.warn('[SceneRegionPage] properties init skipped:', (e as Error)?.message);
	}
});
</script>
