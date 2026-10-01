<template>
	<div class="text">
		{{ t('components.uiProgressBar-colorMode.label') || 'Color Mode' }}
	</div>
	<SelectBox
		:label="t('components.uiProgressBar-colorMode.label') || 'Color Mode'"
		id="uiProgressBar-colorMode"
		v-tip="t('components.uiProgressBar-colorMode.tip')"
		ref="elColorMode"
		v-model="form.colorMode"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.uiProgressBar-color-0-box.label') || 'Red' }}</div>
	<div
		class="flex-box"
		id="uiProgressBar-color-0-box"
		v-tip="t('components.uiProgressBar-color-0-box.tip')"
		ref="elColor0Box"
	>
		<SliderBox
			id="uiProgressBar-color-0-slider"
			ref="elColor0Slider"
			v-model="form.color[0]"
			min="0"
			max="255"
			step="5"
		></SliderBox>
		<NumberBox
			:label="t('components.uiProgressBar-color-0-box.label') || 'Red'"
			id="uiProgressBar-color-0"
			ref="elColor0"
			v-model="form.color[0]"
			min="0"
			max="255"
			step="5"
			@input="onParamInput"
		></NumberBox>
	</div>
	<div class="text">{{ t('components.uiProgressBar-color-1-box.label') || 'Green' }}</div>
	<div
		class="flex-box"
		id="uiProgressBar-color-1-box"
		v-tip="t('components.uiProgressBar-color-1-box.tip')"
		ref="elColor1Box"
	>
		<SliderBox
			id="uiProgressBar-color-1-slider"
			ref="elColor1Slider"
			v-model="form.color[1]"
			min="0"
			max="255"
			step="5"
		></SliderBox>
		<NumberBox
			:label="t('components.uiProgressBar-color-1-box.label') || 'Green'"
			id="uiProgressBar-color-1"
			ref="elColor1"
			v-model="form.color[1]"
			min="0"
			max="255"
			step="5"
			@input="onParamInput"
		></NumberBox>
	</div>
	<div class="text">{{ t('components.uiProgressBar-color-2-box.label') || 'Blue' }}</div>
	<div
		class="flex-box"
		id="uiProgressBar-color-2-box"
		v-tip="t('components.uiProgressBar-color-2-box.tip')"
		ref="elColor2Box"
	>
		<SliderBox
			id="uiProgressBar-color-2-slider"
			ref="elColor2Slider"
			v-model="form.color[2]"
			min="0"
			max="255"
			step="5"
		></SliderBox>
		<NumberBox
			:label="t('components.uiProgressBar-color-2-box.label') || 'Blue'"
			id="uiProgressBar-color-2"
			ref="elColor2"
			v-model="form.color[2]"
			min="0"
			max="255"
			step="5"
			@input="onParamInput"
		></NumberBox>
	</div>
	<div class="text">{{ t('components.uiProgressBar-color-3-box.label') || 'Alpha' }}</div>
	<div
		class="flex-box"
		id="uiProgressBar-color-3-box"
		v-tip="t('components.uiProgressBar-color-3-box.tip')"
		ref="elColor3Box"
	>
		<SliderBox
			id="uiProgressBar-color-3-slider"
			ref="elColor3Slider"
			v-model="form.color[3]"
			min="0"
			max="255"
			step="5"
		></SliderBox>
		<NumberBox
			:label="t('components.uiProgressBar-color-3-box.label') || 'Alpha'"
			id="uiProgressBar-color-3"
			ref="elColor3"
			v-model="form.color[3]"
			min="0"
			max="255"
			step="5"
			@input="onParamInput"
		></NumberBox>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { uiProgressBarContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiProgressBarContextKey)!;

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elColorMode = ref<InstanceType<typeof SelectBox> | null>(null);
const elColor0Box = ref<HTMLElement | null>(null);
const elColor0Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elColor0 = ref<InstanceType<typeof NumberBox> | null>(null);
const elColor1Box = ref<HTMLElement | null>(null);
const elColor1Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elColor1 = ref<InstanceType<typeof NumberBox> | null>(null);
const elColor2Box = ref<HTMLElement | null>(null);
const elColor2Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elColor2 = ref<InstanceType<typeof NumberBox> | null>(null);
const elColor3Box = ref<HTMLElement | null>(null);
const elColor3Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elColor3 = ref<InstanceType<typeof NumberBox> | null>(null);

const loadItems = (el: InstanceType<typeof SelectBox> | null, items: unknown[]) => {
	el?.loadItems(items);
};

const relate = (
	el: InstanceType<typeof SelectBox> | null,
	config: { case: string | string[]; targets: (HTMLElement | null)[] }[]
) => {
	if (el) {
		el.enableHiddenMode();
		el.relate(config);
	}
};

const synchronize = (
	slider: InstanceType<typeof SliderBox> | null,
	input: InstanceType<typeof NumberBox> | null
) => {
	slider?.synchronize(input?.root as SyncTarget);
};

onMounted(() => {
	registerElement(inspectorEls, 'uiProgressBar-colorMode', elColorMode.value);
	registerElement(inspectorEls, 'uiProgressBar-color-0', elColor0.value);
	registerElement(inspectorEls, 'uiProgressBar-color-1', elColor1.value);
	registerElement(inspectorEls, 'uiProgressBar-color-2', elColor2.value);
	registerElement(inspectorEls, 'uiProgressBar-color-3', elColor3.value);
	registerElement(inspectorEls, 'uiProgressBar-color-0-slider', elColor0Slider.value);
	registerElement(inspectorEls, 'uiProgressBar-color-1-slider', elColor1Slider.value);
	registerElement(inspectorEls, 'uiProgressBar-color-2-slider', elColor2Slider.value);
	registerElement(inspectorEls, 'uiProgressBar-color-3-slider', elColor3Slider.value);
	loadItems(elColorMode.value, [
		{ name: 'Texture Sampling', value: 'texture' },
		{ name: 'Fixed', value: 'fixed' }
	]);
	relate(elColorMode.value, [
		{
			case: 'fixed',
			targets: [elColor0Box.value, elColor1Box.value, elColor2Box.value, elColor3Box.value]
		}
	]);
	synchronize(elColor0Slider.value, elColor0.value);
	synchronize(elColor1Slider.value, elColor1.value);
	synchronize(elColor2Slider.value, elColor2.value);
	synchronize(elColor3Slider.value, elColor3.value);
});
</script>
