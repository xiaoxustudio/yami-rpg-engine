<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiProgressBar-properties-grid.label') || 'ProgressBar Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiProgressBar-properties-grid">
			<div class="text">{{ t('components.uiProgressBar-image.label') || 'Image' }}</div>
			<CustomBox
				id="uiProgressBar-image"
				:ref="registryRef(inspectorEls, 'uiProgressBar-image')"
				v-tip="t('components.uiProgressBar-image.tip')"
				v-model="form.image"
				type="file"
				filter="image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiProgressBar-display.label') || 'Display' }}</div>
			<SelectBox
				id="uiProgressBar-display"
				v-tip="t('components.uiProgressBar-display.tip')"
				ref="elDisplay"
				v-model="form.display"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiProgressBar-clip.label') || 'Clip' }}</div>
			<CustomBox
				id="uiProgressBar-clip"
				v-tip="t('components.uiProgressBar-clip.tip')"
				ref="elClip"
				v-model="form.clip"
				type="clip"
				image="uiProgressBar-image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiProgressBar-type.label') || 'Type' }}</div>
			<SelectBox
				id="uiProgressBar-type"
				v-tip="t('components.uiProgressBar-type.tip')"
				ref="elType"
				v-model="form.type"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiProgressBar-centerX.label') || 'Center X' }}</div>
			<NumberBox
				id="uiProgressBar-centerX"
				v-tip="t('components.uiProgressBar-centerX.tip')"
				ref="elCenterX"
				v-model="form.centerX"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiProgressBar-centerY.label') || 'Center Y' }}</div>
			<NumberBox
				id="uiProgressBar-centerY"
				v-tip="t('components.uiProgressBar-centerY.tip')"
				ref="elCenterY"
				v-model="form.centerY"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">
				{{ t('components.uiProgressBar-startAngle.label') || 'Start Angle' }}
			</div>
			<NumberBox
				id="uiProgressBar-startAngle"
				v-tip="t('components.uiProgressBar-startAngle.tip')"
				ref="elStartAngle"
				v-model="form.startAngle"
				min="-360"
				max="360"
				step="5"
				decimals="4"
				unit="deg"
				@input="onParamInput"
			></NumberBox>
			<div class="text">
				{{ t('components.uiProgressBar-centralAngle.label') || 'Central Angle' }}
			</div>
			<NumberBox
				id="uiProgressBar-centralAngle"
				v-tip="t('components.uiProgressBar-centralAngle.tip')"
				ref="elCentralAngle"
				v-model="form.centralAngle"
				min="-360"
				max="360"
				step="5"
				decimals="4"
				unit="deg"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiProgressBar-step.label') || 'Step' }}</div>
			<NumberBox
				id="uiProgressBar-step"
				:ref="registryRef(inspectorEls, 'uiProgressBar-step')"
				v-tip="t('components.uiProgressBar-step.tip')"
				v-model="form.step"
				min="0"
				max="100"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiProgressBar-progress.label') || 'Progress' }}</div>
			<NumberBox
				id="uiProgressBar-progress"
				:ref="registryRef(inspectorEls, 'uiProgressBar-progress')"
				v-tip="t('components.uiProgressBar-progress.tip')"
				v-model="form.progress"
				min="0"
				max="1"
				step="0.01"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiProgressBar-blend.label') || 'Blend' }}</div>
			<SelectBox
				id="uiProgressBar-blend"
				v-tip="t('components.uiProgressBar-blend.tip')"
				ref="elBlend"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.uiProgressBar-colorMode.label') || 'Color Mode' }}
			</div>
			<SelectBox
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
					id="uiProgressBar-color-3"
					ref="elColor3"
					v-model="form.color[3]"
					min="0"
					max="255"
					step="5"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { registryElements, registerElement, registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useUIProgressBarPage } from '@app/composables/useUIProgressBarPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIProgressBarPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

const { bindInput, bindSliders } = useInspectorInput();

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elDisplay = ref<InstanceType<typeof SelectBox> | null>(null);
const elClip = ref<InstanceType<typeof CustomBox> | null>(null);
const elType = ref<InstanceType<typeof SelectBox> | null>(null);
const elCenterX = ref<InstanceType<typeof NumberBox> | null>(null);
const elCenterY = ref<InstanceType<typeof NumberBox> | null>(null);
const elStartAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elCentralAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
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
	// P1b：以下控件的 :ref 槽位已被具名 ref 占用 → 命令式登记（页面内批量绑定焦点/滑杆用）
	registerElement(inspectorEls, 'uiProgressBar-display', elDisplay.value);
	registerElement(inspectorEls, 'uiProgressBar-clip', elClip.value);
	registerElement(inspectorEls, 'uiProgressBar-type', elType.value);
	registerElement(inspectorEls, 'uiProgressBar-centerX', elCenterX.value);
	registerElement(inspectorEls, 'uiProgressBar-centerY', elCenterY.value);
	registerElement(inspectorEls, 'uiProgressBar-startAngle', elStartAngle.value);
	registerElement(inspectorEls, 'uiProgressBar-centralAngle', elCentralAngle.value);
	registerElement(inspectorEls, 'uiProgressBar-blend', elBlend.value);
	registerElement(inspectorEls, 'uiProgressBar-colorMode', elColorMode.value);
	registerElement(inspectorEls, 'uiProgressBar-color-0', elColor0.value);
	registerElement(inspectorEls, 'uiProgressBar-color-1', elColor1.value);
	registerElement(inspectorEls, 'uiProgressBar-color-2', elColor2.value);
	registerElement(inspectorEls, 'uiProgressBar-color-3', elColor3.value);
	registerElement(inspectorEls, 'uiProgressBar-color-0-slider', elColor0Slider.value);
	registerElement(inspectorEls, 'uiProgressBar-color-1-slider', elColor1Slider.value);
	registerElement(inspectorEls, 'uiProgressBar-color-2-slider', elColor2Slider.value);
	registerElement(inspectorEls, 'uiProgressBar-color-3-slider', elColor3Slider.value);
	const uiProgressBar = Inspector.uiProgressBar;
	if (!uiProgressBar) return;

	loadItems(elDisplay.value, [
		{ name: 'Stretch', value: 'stretch' },
		{ name: 'Clip', value: 'clip' }
	]);
	relate(elDisplay.value, [{ case: 'clip', targets: [elClip.value?.root ?? null] }]);
	loadItems(elType.value, [
		{ name: 'Horizontal', value: 'horizontal' },
		{ name: 'Vertical', value: 'vertical' },
		{ name: 'Round', value: 'round' }
	]);
	relate(elType.value, [
		{
			case: 'round',
			targets: [
				elCenterX.value?.root ?? null,
				elCenterY.value?.root ?? null,
				elStartAngle.value?.root ?? null,
				elCentralAngle.value?.root ?? null
			]
		}
	]);
	loadItems(elBlend.value, [
		{ name: 'Normal', value: 'normal' },
		{ name: 'Additive', value: 'additive' },
		{ name: 'Subtract', value: 'subtract' }
	]);
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
/* 样式迁移：由 Project/css/scene.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
