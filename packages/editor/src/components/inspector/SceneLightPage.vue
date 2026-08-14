<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneLight-general-grid">
			<div class="text">{{ local.getLabel('sceneLight-name') || 'Name' }}</div><TextBox id="sceneLight-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('sceneLight-type') || 'Type' }}</div><SelectBox id="sceneLight-type" v-model="form.type" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('sceneLight-blend') || 'Blend' }}</div><SelectBox id="sceneLight-blend" v-model="form.blend" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('sceneLight-x') || 'X' }}</div
			><NumberBox
				id="sceneLight-x" v-model="form.x" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneLight-y') || 'Y' }}</div
			><NumberBox
				id="sceneLight-y" v-model="form.y" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneLight-range-box') || 'Range' }}</div>
			<div class="flex-box" id="sceneLight-range-box">
				<SliderBox
					id="sceneLight-range-slider"
					v-model="form.range"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-range" v-model="form.range" @input="onParamInput"
					min="0"
					max="128"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-intensity-box') || 'Intensity' }}</div>
			<div class="flex-box" id="sceneLight-intensity-box">
				<SliderBox
					id="sceneLight-intensity-slider"
					v-model="form.intensity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneLight-intensity" v-model="form.intensity" @input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-mask') || 'Mask' }}</div
			><CustomBox
				id="sceneLight-mask" :model-value="form.mask" @input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ local.getLabel('sceneLight-anchorX-box') || 'Anchor X' }}</div>
			<div class="flex-box" id="sceneLight-anchorX-box">
				<SliderBox
					id="sceneLight-anchorX-slider"
					v-model="form.anchorX"
					min="0"
					max="1"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneLight-anchorX" v-model="form.anchorX" @input="onParamInput"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-anchorY-box') || 'Anchor Y' }}</div>
			<div class="flex-box" id="sceneLight-anchorY-box">
				<SliderBox
					id="sceneLight-anchorY-slider"
					v-model="form.anchorY"
					min="0"
					max="1"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneLight-anchorY" v-model="form.anchorY" @input="onParamInput"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-width-box') || 'Width' }}</div>
			<div class="flex-box" id="sceneLight-width-box">
				<SliderBox
					id="sceneLight-width-slider"
					v-model="form.width"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-width" v-model="form.width" @input="onParamInput"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-height-box') || 'Height' }}</div>
			<div class="flex-box" id="sceneLight-height-box">
				<SliderBox
					id="sceneLight-height-slider"
					v-model="form.height"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-height" v-model="form.height" @input="onParamInput"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-angle-box') || 'Angle' }}</div>
			<div class="flex-box" id="sceneLight-angle-box">
				<SliderBox
					id="sceneLight-angle-slider"
					v-model="form.angle"
					min="0"
					max="360"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-angle" v-model="form.angle" @input="onParamInput"
					min="-36000"
					max="36000"
					step="5"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-red-box') || 'Red' }}</div>
			<div class="flex-box" id="sceneLight-red-box">
				<SliderBox
					id="sceneLight-red-slider"
					v-model="form.red"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-red" v-model="form.red" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-green-box') || 'Green' }}</div>
			<div class="flex-box" id="sceneLight-green-box">
				<SliderBox
					id="sceneLight-green-slider"
					v-model="form.green"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-green" v-model="form.green" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-blue-box') || 'Blue' }}</div>
			<div class="flex-box" id="sceneLight-blue-box">
				<SliderBox
					id="sceneLight-blue-slider"
					v-model="form.blue"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-blue" v-model="form.blue" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-direct-box') || 'Direct Light Ratio' }}</div>
			<div class="flex-box" id="sceneLight-direct-box">
				<SliderBox
					id="sceneLight-direct-slider"
					v-model="form.direct"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneLight-direct" v-model="form.direct" @input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-conditions') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneLight-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneLight-events"
			class="inspector-list"
			filter="light"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneLight-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneLight-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

interface LightForm {
	name: string;
	type: string;
	blend: string;
	x: number;
	y: number;
	range: number;
	intensity: number;
	mask: string;
	anchorX: number;
	anchorY: number;
	width: number;
	height: number;
	angle: number;
	red: number;
	green: number;
	blue: number;
	direct: number;
}

const LIGHT_KEYS: (keyof LightForm)[] = [
	'name',
	'type',
	'blend',
	'x',
	'y',
	'range',
	'intensity',
	'mask',
	'anchorX',
	'anchorY',
	'width',
	'height',
	'angle',
	'red',
	'green',
	'blue',
	'direct'
];

const scene = useSceneStore();
const local = useLocalStore();

const form = reactive<Partial<LightForm>>({});

const sync = (): void => {
	const target = Inspector?.sceneLight?.target as Partial<LightForm> | null | undefined;
	if (!target) return;
	for (const key of LIGHT_KEYS) {
		form[key] = target[key];
	}
};

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.sceneLight?.paramInput?.({ target });
	sync();
};

onMounted(() => {
	const el = document.getElementById('sceneLight-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
	scene.syncState();
	local.syncState();
});
</script>
