<template>
	<DetailBox id="uiElement-general-group" open>
		<DetailSummary>{{ local.getLabel('uiElement-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="uiElement-general-grid">
			<div class="text">{{ local.getLabel('uiElement-name') || 'Name' }}</div><TextBox id="uiElement-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('uiElement-pointerEvents') || 'Pointer Events' }}</div
			><SelectBox id="uiElement-pointerEvents" v-model="form.pointerEvents" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
	<DetailBox id="uiElement-transform-group" open>
		<DetailSummary>{{ local.getLabel('uiElement-transform-grid') || 'Transform' }}</DetailSummary>
		<div class="detail-grid" id="uiElement-transform-grid">
			<div class="text">{{ local.getLabel('uiElement-transform-align-box') || 'Align' }}</div>
			<div class="flex-box" id="uiElement-transform-align-box">
				<button
					id="uiElement-transform-align-left"
					class="uiElement-transform-align"
					value="left"
				>
					<div class="text">&#xf036;</div>
				</button>
				<button
					id="uiElement-transform-align-center"
					class="uiElement-transform-align"
					value="center"
				>
					<div class="text">&#xf037;</div>
				</button>
				<button
					id="uiElement-transform-align-right"
					class="uiElement-transform-align"
					value="right"
				>
					<div class="text">&#xf038;</div>
				</button>
				<button
					id="uiElement-transform-align-top"
					class="uiElement-transform-align rotated"
					value="top"
				>
					<div class="text">&#xf036;</div>
				</button>
				<button
					id="uiElement-transform-align-middle"
					class="uiElement-transform-align rotated"
					value="middle"
				>
					<div class="text">&#xf037;</div>
				</button>
				<button
					id="uiElement-transform-align-bottom"
					class="uiElement-transform-align rotated"
					value="bottom"
				>
					<div class="text">&#xf038;</div>
				</button>
			</div>
			<div class="text">{{ local.getLabel('uiElement-transform-anchor-box') || 'Anchor' }}</div>
			<div
				id="uiElement-transform-anchor-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-anchorX" v-model="form.anchorX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-anchorY" v-model="form.anchorY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiElement-transform-x-box') || 'X' }}</div>
			<div
				id="uiElement-transform-x-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-x" v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-x2" v-model="form.x2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiElement-transform-y-box') || 'Y' }}</div>
			<div
				id="uiElement-transform-y-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-y" v-model="form.y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-y2" v-model="form.y2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiElement-transform-width-box') || 'Width' }}</div>
			<div
				id="uiElement-transform-width-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-width" v-model="form.width"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-width2" v-model="form.width2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiElement-transform-height-box') || 'Height' }}</div>
			<div
				id="uiElement-transform-height-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-height" v-model="form.height"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-height2" v-model="form.height2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiElement-transform-rotation-box') || 'Rotation' }}</div>
			<div
				id="uiElement-transform-rotation-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-rotation" v-model="form.rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiElement-transform-scale-box') || 'Scale' }}</div>
			<div
				id="uiElement-transform-scale-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-scaleX" v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-scaleY" v-model="form.scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiElement-transform-skew-box') || 'Skew' }}</div>
			<div
				id="uiElement-transform-skew-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-skewX" v-model="form.skewX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-skewY" v-model="form.skewY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiElement-transform-opacity-box') || 'Opacity' }}</div>
			<div
				id="uiElement-transform-opacity-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-opacity" v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox id="uiElement-events-group" open>
		<DetailSummary>{{ local.getLabel('uiElement-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="uiElement-events"
			class="inspector-list"
			filter="element"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox id="uiElement-scripts-group" open>
		<DetailSummary>{{ local.getLabel('uiElement-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="uiElement-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="uiElement-parameter-pane"></ParameterPane>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiImage-properties-grid') || 'Image Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiImage-properties-grid">
			<div class="text">{{ local.getLabel('uiImage-image') || 'Image' }}</div
			><CustomBox id="uiImage-image" type="file" filter="image" @input="onParamInput"></CustomBox>
			<div class="text">{{ local.getLabel('uiImage-display') || 'Display' }}</div><SelectBox id="uiImage-display" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiImage-flip') || 'Flip' }}</div><SelectBox id="uiImage-flip" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiImage-blend') || 'Blend' }}</div><SelectBox id="uiImage-blend" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiImage-shift-box') || 'Shift' }}</div>
			<div id="uiImage-shift-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiImage-shiftX"
					min="-10000"
					max="10000"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiImage-shiftY"
					min="-10000"
					max="10000"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiImage-clip') || 'Clip' }}</div
			><CustomBox
				id="uiImage-clip"
				type="clip"
				image="uiImage-image" @input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiImage-border') || 'Border' }}</div
			><NumberBox
				id="uiImage-border"
				min="1"
				max="100"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiImage-tint-0-box') || 'Tint - Red' }}</div>
			<div class="flex-box" id="uiImage-tint-0-box">
				<SliderBox
					id="uiImage-tint-0-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="uiImage-tint-0"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiImage-tint-1-box') || 'Tint - Green' }}</div>
			<div class="flex-box" id="uiImage-tint-1-box">
				<SliderBox
					id="uiImage-tint-1-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="uiImage-tint-1"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiImage-tint-2-box') || 'Tint - Blue' }}</div>
			<div class="flex-box" id="uiImage-tint-2-box">
				<SliderBox
					id="uiImage-tint-2-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="uiImage-tint-2"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiImage-tint-3-box') || 'Tint - Grayscale' }}</div>
			<div class="flex-box" id="uiImage-tint-3-box">
				<SliderBox
					id="uiImage-tint-3-slider"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="uiImage-tint-3"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIImagePage } from '@app/composables/useUIImagePage';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useUIImagePage();

onMounted(() => {
	const el = document.getElementById('uiImage-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
