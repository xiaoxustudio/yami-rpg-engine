<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiButton-image-properties-grid') || 'Image Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiButton-image-properties-grid">
			<div class="text">{{ local.getLabel('uiButton-display') || 'Display' }}</div><SelectBox id="uiButton-display" v-model="form.display" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiButton-normalImage') || 'Normal Image' }}</div
			><CustomBox
				id="uiButton-normalImage" :model-value="form.normalImage" @input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiButton-normalClip') || 'Normal Clip' }}</div
			><CustomBox
				id="uiButton-normalClip" :model-value="form.normalClip" @input="onParamInput"
				type="clip"
				image="uiButton-normalImage"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiButton-hoverImage') || 'Hover Image' }}</div
			><CustomBox
				id="uiButton-hoverImage" :model-value="form.hoverImage" @input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiButton-hoverClip') || 'Hover Clip' }}</div
			><CustomBox
				id="uiButton-hoverClip" :model-value="form.hoverClip" @input="onParamInput"
				type="clip"
				image="uiButton-hoverImage"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiButton-activeImage') || 'Active Image' }}</div
			><CustomBox
				id="uiButton-activeImage" :model-value="form.activeImage" @input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiButton-activeClip') || 'Active Clip' }}</div
			><CustomBox
				id="uiButton-activeClip" :model-value="form.activeClip" @input="onParamInput"
				type="clip"
				image="uiButton-activeImage"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiButton-flip') || 'Flip' }}</div><SelectBox id="uiButton-flip" v-model="form.flip" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiButton-border') || 'Border' }}</div
			><NumberBox
				id="uiButton-border" v-model="form.border" @input="onParamInput"
				min="1"
				max="100"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiButton-imagePadding-box') || 'Padding' }}</div>
			<div class="flex-box" id="uiButton-imagePadding-box">
				<SliderBox
					id="uiButton-imagePadding-slider"
					v-model="form.imagePadding"
					min="0"
					max="20"
				></SliderBox>
				<NumberBox
					id="uiButton-imagePadding" v-model="form.imagePadding" @input="onParamInput"
					min="0"
					max="100"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiButton-imageOpacity-box') || 'Opacity' }}</div>
			<div class="flex-box" id="uiButton-imageOpacity-box">
				<SliderBox
					id="uiButton-imageOpacity-slider"
					v-model="form.imageOpacity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="uiButton-imageOpacity" v-model="form.imageOpacity" @input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiButton-imageEffect') || 'Effect' }}</div><SelectBox id="uiButton-imageEffect" v-model="form.imageEffect" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiButton-normalTint-box') || 'Normal Tint' }}</div>
			<div
				id="uiButton-normalTint-box"
				class="box uiElement-grid-box with-4-columns"
			>
				<NumberBox
					id="uiButton-normalTint-0" v-model="form.normalTint[0]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-1" v-model="form.normalTint[1]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-2" v-model="form.normalTint[2]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-3" v-model="form.normalTint[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiButton-hoverTint-box') || 'Hover Tint' }}</div>
			<div
				id="uiButton-hoverTint-box"
				class="box uiElement-grid-box with-4-columns"
			>
				<NumberBox
					id="uiButton-hoverTint-0" v-model="form.hoverTint[0]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-1" v-model="form.hoverTint[1]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-2" v-model="form.hoverTint[2]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-3" v-model="form.hoverTint[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiButton-activeTint-box') || 'Active Tint' }}</div>
			<div
				id="uiButton-activeTint-box"
				class="box uiElement-grid-box with-4-columns"
			>
				<NumberBox
					id="uiButton-activeTint-0" v-model="form.activeTint[0]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-1" v-model="form.activeTint[1]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-2" v-model="form.activeTint[2]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-3" v-model="form.activeTint[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiButton-text-properties-grid') || 'Text Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiButton-text-properties-grid">
			<div class="text">{{ local.getLabel('uiButton-direction') || 'Direction' }}</div><SelectBox id="uiButton-direction" v-model="form.direction" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiButton-align-box') || 'Align' }}</div>
			<div class="flex-box" id="uiButton-align-box">
				<RadioBox
					id="uiButton-align-left"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="left"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-center"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="center"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-right"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="right"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-top"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="top"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-middle"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="middle"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-bottom"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="bottom"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
			</div>
			<div class="text">{{ local.getLabel('uiButton-content') || 'Content' }}</div
			><TextBox
				id="uiButton-content" v-model="form.content" @input="onParamInput"
				menu="tag-global-var tag-dynamic-global-var tag-localization"
			></TextBox>
			<div class="text">{{ local.getLabel('uiButton-size-box') || 'Size' }}</div>
			<div class="flex-box" id="uiButton-size-box">
				<SliderBox
					id="uiButton-size-slider"
					v-model="form.size"
					min="12"
					max="52"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiButton-size" v-model="form.size" @input="onParamInput"
					min="10"
					max="400"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiButton-letterSpacing-box') || 'Letter Spacing' }}</div>
			<div class="flex-box" id="uiButton-letterSpacing-box">
				<SliderBox
					id="uiButton-letterSpacing-slider"
					v-model="form.letterSpacing"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiButton-letterSpacing" v-model="form.letterSpacing" @input="onParamInput"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiButton-textPadding-box') || 'Padding' }}</div>
			<div class="flex-box" id="uiButton-textPadding-box">
				<SliderBox
					id="uiButton-textPadding-slider"
					v-model="form.textPadding"
					min="0"
					max="40"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiButton-textPadding" v-model="form.textPadding" @input="onParamInput"
					min="0"
					max="100"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiButton-font') || 'Font' }}</div><TextBox id="uiButton-font" v-model="form.font" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('uiButton-typeface') || 'Typeface' }}</div><SelectBox id="uiButton-typeface" v-model="form.typeface" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiButton-textEffect-type') || 'Effect' }}</div
			><SelectBox id="uiButton-textEffect-type" v-model="form.textEffect.type" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiButton-textEffect-shadowOffsetX') || 'Shadow X' }}</div
			><NumberBox
				id="uiButton-textEffect-shadowOffsetX" v-model="form.textEffect.shadowOffsetX" @input="onParamInput"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiButton-textEffect-shadowOffsetY') || 'Shadow Y' }}</div
			><NumberBox
				id="uiButton-textEffect-shadowOffsetY" v-model="form.textEffect.shadowOffsetY" @input="onParamInput"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiButton-textEffect-strokeWidth') || 'Stroke Width' }}</div
			><NumberBox
				id="uiButton-textEffect-strokeWidth" v-model="form.textEffect.strokeWidth" @input="onParamInput"
				min="1"
				max="20"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiButton-textEffect-color') || 'Effect Color' }}</div
			><ColorBox id="uiButton-textEffect-color" v-model="form.textEffect.color" @input="onParamInput"></ColorBox>
			<div class="text">{{ local.getLabel('uiButton-normalColor') || 'Normal Color' }}</div
			><ColorBox id="uiButton-normalColor" v-model="form.normalColor" @input="onParamInput"></ColorBox>
			<div class="text">{{ local.getLabel('uiButton-hoverColor') || 'Hover Color' }}</div><ColorBox id="uiButton-hoverColor" v-model="form.hoverColor" @input="onParamInput"></ColorBox>
			<div class="text">{{ local.getLabel('uiButton-activeColor') || 'Active Color' }}</div
			><ColorBox id="uiButton-activeColor" v-model="form.activeColor" @input="onParamInput"></ColorBox>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiButton-sound-effects-grid') || 'Sound Effects' }}</DetailSummary>
		<div class="detail-grid" id="uiButton-sound-effects-grid">
			<div class="text">{{ local.getLabel('uiButton-hoverSound') || 'Hover SE' }}</div
			><CustomBox
				id="uiButton-hoverSound" :model-value="form.hoverSound" @input="onParamInput"
				type="file"
				filter="audio"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiButton-clickSound') || 'Click SE' }}</div
			><CustomBox
				id="uiButton-clickSound" :model-value="form.clickSound" @input="onParamInput"
				type="file"
				filter="audio"
			></CustomBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

interface ButtonForm {
	display: string;
	normalImage: string;
	normalClip: number[];
	hoverImage: string;
	hoverClip: number[];
	activeImage: string;
	activeClip: number[];
	flip: string;
	border: number;
	imagePadding: number;
	imageOpacity: number;
	imageEffect: string;
	normalTint: number[];
	hoverTint: number[];
	activeTint: number[];
	direction: string;
	horizontalAlign: string;
	verticalAlign: string;
	content: string;
	size: number;
	letterSpacing: number;
	textPadding: number;
	font: string;
	typeface: string;
	textEffect: {
		type: string;
		shadowOffsetX: number;
		shadowOffsetY: number;
		strokeWidth: number;
		color: string;
	};
	normalColor: string;
	hoverColor: string;
	activeColor: string;
	hoverSound: string;
	clickSound: string;
}

const BUTTON_KEYS: (keyof ButtonForm)[] = [
	'display',
	'normalImage',
	'normalClip',
	'hoverImage',
	'hoverClip',
	'activeImage',
	'activeClip',
	'flip',
	'border',
	'imagePadding',
	'imageOpacity',
	'imageEffect',
	'direction',
	'horizontalAlign',
	'verticalAlign',
	'content',
	'size',
	'letterSpacing',
	'textPadding',
	'font',
	'typeface',
	'normalColor',
	'hoverColor',
	'activeColor',
	'hoverSound',
	'clickSound'
];

const ui = useUIStore();
const local = useLocalStore();

const form = reactive<ButtonForm>({
	display: 'stretch',
	normalImage: '',
	normalClip: [0, 0, 32, 32],
	hoverImage: '',
	hoverClip: [0, 0, 32, 32],
	activeImage: '',
	activeClip: [0, 0, 32, 32],
	flip: 'none',
	border: 1,
	imagePadding: 0,
	imageOpacity: 1,
	imageEffect: 'none',
	normalTint: [0, 0, 0, 0],
	hoverTint: [0, 0, 0, 0],
	activeTint: [0, 0, 0, 0],
	direction: 'horizontal-tb',
	horizontalAlign: 'center',
	verticalAlign: 'middle',
	content: '',
	size: 16,
	letterSpacing: 0,
	textPadding: 0,
	font: '',
	typeface: 'regular',
	textEffect: {
		type: 'none',
		shadowOffsetX: 1,
		shadowOffsetY: 1,
		strokeWidth: 1,
		color: '000000ff'
	},
	normalColor: 'ffffffff',
	hoverColor: 'ffffffff',
	activeColor: 'ffffffff',
	hoverSound: '',
	clickSound: ''
});

const sync = (): void => {
	const target = Inspector?.uiButton?.target as Partial<ButtonForm> | null | undefined;
	if (!target) return;
	for (const key of BUTTON_KEYS) {
		const value = target[key];
		if (value !== undefined) {
			form[key] = value;
		}
	}
	form.normalTint = target.normalTint ?? [0, 0, 0, 0];
	form.hoverTint = target.hoverTint ?? [0, 0, 0, 0];
	form.activeTint = target.activeTint ?? [0, 0, 0, 0];
	form.textEffect = {
		type: target.textEffect?.type ?? 'none',
		shadowOffsetX: target.textEffect?.shadowOffsetX ?? 1,
		shadowOffsetY: target.textEffect?.shadowOffsetY ?? 1,
		strokeWidth: target.textEffect?.strokeWidth ?? 1,
		color: target.textEffect?.color ?? '000000ff'
	};
};

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.uiButton?.paramInput?.({ target });
	sync();
};

onMounted(() => {
	const el = document.getElementById('uiButton-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
	ui.syncState();
	local.syncState();
});
</script>
