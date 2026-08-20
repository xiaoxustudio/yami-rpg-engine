<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.uiProgressBar-properties-grid.label') || 'ProgressBar Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiProgressBar-properties-grid">
			<div class="text">{{ t('components.uiProgressBar-image.label') || 'Image' }}</div
			><CustomBox
				id="uiProgressBar-image"
				v-model="form.image"
				type="file"
				filter="image" @input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiProgressBar-display.label') || 'Display' }}</div><SelectBox id="uiProgressBar-display" v-model="form.display" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiProgressBar-clip.label') || 'Clip' }}</div
			><CustomBox
				id="uiProgressBar-clip"
				v-model="form.clip"
				type="clip"
				image="uiProgressBar-image" @input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiProgressBar-type.label') || 'Type' }}</div><SelectBox id="uiProgressBar-type" v-model="form.type" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiProgressBar-centerX.label') || 'Center X' }}</div
			><NumberBox
				id="uiProgressBar-centerX"
				v-model="form.centerX"
				min="0"
				max="1"
				step="0.05"
				decimals="4" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiProgressBar-centerY.label') || 'Center Y' }}</div
			><NumberBox
				id="uiProgressBar-centerY"
				v-model="form.centerY"
				min="0"
				max="1"
				step="0.05"
				decimals="4" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiProgressBar-startAngle.label') || 'Start Angle' }}</div
			><NumberBox
				id="uiProgressBar-startAngle"
				v-model="form.startAngle"
				min="-360"
				max="360"
				step="5"
				decimals="4"
				unit="deg" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiProgressBar-centralAngle.label') || 'Central Angle' }}</div
			><NumberBox
				id="uiProgressBar-centralAngle"
				v-model="form.centralAngle"
				min="-360"
				max="360"
				step="5"
				decimals="4"
				unit="deg" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiProgressBar-step.label') || 'Step' }}</div
			><NumberBox id="uiProgressBar-step" v-model="form.step" min="0" max="100" @input="onParamInput"></NumberBox>
			<div class="text">{{ t('components.uiProgressBar-progress.label') || 'Progress' }}</div
			><NumberBox
				id="uiProgressBar-progress"
				v-model="form.progress"
				min="0"
				max="1"
				step="0.01"
				decimals="4" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiProgressBar-blend.label') || 'Blend' }}</div><SelectBox id="uiProgressBar-blend" v-model="form.blend" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiProgressBar-colorMode.label') || 'Color Mode' }}</div
			><SelectBox id="uiProgressBar-colorMode" v-model="form.colorMode" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiProgressBar-color-0-box.label') || 'Red' }}</div>
			<div class="flex-box" id="uiProgressBar-color-0-box">
				<SliderBox
					id="uiProgressBar-color-0-slider"
					v-model="form.color[0]"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="uiProgressBar-color-0"
					v-model="form.color[0]"
					min="0"
					max="255"
					step="5" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiProgressBar-color-1-box.label') || 'Green' }}</div>
			<div class="flex-box" id="uiProgressBar-color-1-box">
				<SliderBox
					id="uiProgressBar-color-1-slider"
					v-model="form.color[1]"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="uiProgressBar-color-1"
					v-model="form.color[1]"
					min="0"
					max="255"
					step="5" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiProgressBar-color-2-box.label') || 'Blue' }}</div>
			<div class="flex-box" id="uiProgressBar-color-2-box">
				<SliderBox
					id="uiProgressBar-color-2-slider"
					v-model="form.color[2]"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="uiProgressBar-color-2"
					v-model="form.color[2]"
					min="0"
					max="255"
					step="5" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiProgressBar-color-3-box.label') || 'Alpha' }}</div>
			<div class="flex-box" id="uiProgressBar-color-3-box">
				<SliderBox
					id="uiProgressBar-color-3-slider"
					v-model="form.color[3]"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="uiProgressBar-color-3"
					v-model="form.color[3]"
					min="0"
					max="255"
					step="5" @input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUIProgressBarPage } from '@app/composables/useUIProgressBarPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useUIProgressBarPage();

const { bindInput, bindSliders } = useInspectorInput();

const loadItems = (id: string, items: { name: string; value: string }[]) => {
	const el = document.getElementById(id) as unknown as { loadItems?: (items: { name: string; value: string }[]) => void } | null;
	el?.loadItems?.(items);
};

const relate = (id: string, config: { case: string | string[]; targets: (HTMLElement | null)[] }[]) => {
	const el = document.getElementById(id) as unknown as { enableHiddenMode?: () => { relate: (config: { case: string | string[]; targets: (HTMLElement | null)[] }[]) => void } } | null;
	if (el) el.enableHiddenMode()?.relate(config);
};

const synchronize = (sliderId: string, inputId: string) => {
	const slider = document.getElementById(sliderId) as unknown as { synchronize?: (el: HTMLElement | null) => void } | null;
	const input = document.getElementById(inputId);
	slider?.synchronize?.(input);
};

onMounted(() => {
	const uiProgressBar = Inspector.uiProgressBar;
	if (!uiProgressBar) return;

	loadItems('uiProgressBar-display', [
		{ name: 'Stretch', value: 'stretch' },
		{ name: 'Clip', value: 'clip' }
	]);
	relate('uiProgressBar-display', [
		{ case: 'clip', targets: [document.getElementById('uiProgressBar-clip')] }
	]);
	loadItems('uiProgressBar-type', [
		{ name: 'Horizontal', value: 'horizontal' },
		{ name: 'Vertical', value: 'vertical' },
		{ name: 'Round', value: 'round' }
	]);
	relate('uiProgressBar-type', [
		{ case: 'round', targets: [
			document.getElementById('uiProgressBar-centerX'),
			document.getElementById('uiProgressBar-centerY'),
			document.getElementById('uiProgressBar-startAngle'),
			document.getElementById('uiProgressBar-centralAngle')
		]}
	]);
	loadItems('uiProgressBar-blend', [
		{ name: 'Normal', value: 'normal' },
		{ name: 'Additive', value: 'additive' },
		{ name: 'Subtract', value: 'subtract' }
	]);
	loadItems('uiProgressBar-colorMode', [
		{ name: 'Texture Sampling', value: 'texture' },
		{ name: 'Fixed', value: 'fixed' }
	]);
	relate('uiProgressBar-colorMode', [
		{ case: 'fixed', targets: [
			document.getElementById('uiProgressBar-color-0-box'),
			document.getElementById('uiProgressBar-color-1-box'),
			document.getElementById('uiProgressBar-color-2-box'),
			document.getElementById('uiProgressBar-color-3-box')
		]}
	]);

	synchronize('uiProgressBar-color-0-slider', 'uiProgressBar-color-0');
	synchronize('uiProgressBar-color-1-slider', 'uiProgressBar-color-1');
	synchronize('uiProgressBar-color-2-slider', 'uiProgressBar-color-2');
	synchronize('uiProgressBar-color-3-slider', 'uiProgressBar-color-3');

	const elements = document.querySelectorAll(`#uiProgressBar-image,
    #uiProgressBar-display, #uiProgressBar-clip,
    #uiProgressBar-type, #uiProgressBar-centerX, #uiProgressBar-centerY,
    #uiProgressBar-startAngle, #uiProgressBar-centralAngle, #uiProgressBar-step,
    #uiProgressBar-progress, #uiProgressBar-blend, #uiProgressBar-colorMode,
    #uiProgressBar-color-0, #uiProgressBar-color-1,
    #uiProgressBar-color-2, #uiProgressBar-color-3`);
	const sliders = document.querySelectorAll(`
    #uiProgressBar-color-0-slider, #uiProgressBar-color-1-slider,
    #uiProgressBar-color-2-slider, #uiProgressBar-color-3-slider`);
	bindInput(elements, uiProgressBar, UI);
	bindSliders(sliders);

	const el = document.getElementById('uiProgressBar-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
