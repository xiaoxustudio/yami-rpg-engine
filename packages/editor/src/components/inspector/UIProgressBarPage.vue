<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiProgressBar-properties-grid') || 'ProgressBar Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiProgressBar-properties-grid">
			<div class="text">{{ local.getLabel('uiProgressBar-image') || 'Image' }}</div
			><CustomBox
				id="uiProgressBar-image"
				v-model="form.image"
				type="file"
				filter="image" @input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiProgressBar-display') || 'Display' }}</div><SelectBox id="uiProgressBar-display" v-model="form.display" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiProgressBar-clip') || 'Clip' }}</div
			><CustomBox
				id="uiProgressBar-clip"
				v-model="form.clip"
				type="clip"
				image="uiProgressBar-image" @input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiProgressBar-type') || 'Type' }}</div><SelectBox id="uiProgressBar-type" v-model="form.type" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiProgressBar-centerX') || 'Center X' }}</div
			><NumberBox
				id="uiProgressBar-centerX"
				v-model="form.centerX"
				min="0"
				max="1"
				step="0.05"
				decimals="4" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiProgressBar-centerY') || 'Center Y' }}</div
			><NumberBox
				id="uiProgressBar-centerY"
				v-model="form.centerY"
				min="0"
				max="1"
				step="0.05"
				decimals="4" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiProgressBar-startAngle') || 'Start Angle' }}</div
			><NumberBox
				id="uiProgressBar-startAngle"
				v-model="form.startAngle"
				min="-360"
				max="360"
				step="5"
				decimals="4"
				unit="deg" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiProgressBar-centralAngle') || 'Central Angle' }}</div
			><NumberBox
				id="uiProgressBar-centralAngle"
				v-model="form.centralAngle"
				min="-360"
				max="360"
				step="5"
				decimals="4"
				unit="deg" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiProgressBar-step') || 'Step' }}</div
			><NumberBox id="uiProgressBar-step" v-model="form.step" min="0" max="100" @input="onParamInput"></NumberBox>
			<div class="text">{{ local.getLabel('uiProgressBar-progress') || 'Progress' }}</div
			><NumberBox
				id="uiProgressBar-progress"
				v-model="form.progress"
				min="0"
				max="1"
				step="0.01"
				decimals="4" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiProgressBar-blend') || 'Blend' }}</div><SelectBox id="uiProgressBar-blend" v-model="form.blend" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiProgressBar-colorMode') || 'Color Mode' }}</div
			><SelectBox id="uiProgressBar-colorMode" v-model="form.colorMode" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiProgressBar-color-0-box') || 'Red' }}</div>
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
			<div class="text">{{ local.getLabel('uiProgressBar-color-1-box') || 'Green' }}</div>
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
			<div class="text">{{ local.getLabel('uiProgressBar-color-2-box') || 'Blue' }}</div>
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
			<div class="text">{{ local.getLabel('uiProgressBar-color-3-box') || 'Alpha' }}</div>
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
import { useUIProgressBarPage } from '@app/composables/useUIProgressBarPage';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useUIProgressBarPage();

onMounted(() => {
	const el = document.getElementById('uiProgressBar-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
