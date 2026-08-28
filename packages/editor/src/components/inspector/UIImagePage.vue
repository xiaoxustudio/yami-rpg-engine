<template>
	<DetailBox id="uiElement-general-group" open>
		<DetailSummary>{{
			t('components.uiElement-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="uiElement-general-grid">
			<div class="text">{{ t('components.uiElement-name.label') || 'Name' }}</div>
			<TextBox id="uiElement-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">
				{{ t('components.uiElement-pointerEvents.label') || 'Pointer Events' }}
			</div>
			<SelectBox
				id="uiElement-pointerEvents"
				v-model="form.pointerEvents"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
	<DetailBox id="uiElement-transform-group" open>
		<DetailSummary>{{
			t('components.uiElement-transform-grid.label') || 'Transform'
		}}</DetailSummary>
		<div class="detail-grid" id="uiElement-transform-grid">
			<div class="text">
				{{ t('components.uiElement-transform-align-box.label') || 'Align' }}
			</div>
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
			<div class="text">
				{{ t('components.uiElement-transform-anchor-box.label') || 'Anchor' }}
			</div>
			<div id="uiElement-transform-anchor-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-anchorX"
					v-model="form.anchorX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-anchorY"
					v-model="form.anchorY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiElement-transform-x-box.label') || 'X' }}</div>
			<div id="uiElement-transform-x-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-x"
					v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-x2"
					v-model="form.x2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiElement-transform-y-box.label') || 'Y' }}</div>
			<div id="uiElement-transform-y-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-y"
					v-model="form.y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-y2"
					v-model="form.y2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-width-box.label') || 'Width' }}
			</div>
			<div id="uiElement-transform-width-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-width"
					v-model="form.width"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-width2"
					v-model="form.width2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-height-box.label') || 'Height' }}
			</div>
			<div id="uiElement-transform-height-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-height"
					v-model="form.height"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-height2"
					v-model="form.height2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-rotation-box.label') || 'Rotation' }}
			</div>
			<div
				id="uiElement-transform-rotation-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-rotation"
					v-model="form.rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-scale-box.label') || 'Scale' }}
			</div>
			<div id="uiElement-transform-scale-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-scaleX"
					v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-scaleY"
					v-model="form.scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-skew-box.label') || 'Skew' }}
			</div>
			<div id="uiElement-transform-skew-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-skewX"
					v-model="form.skewX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-skewY"
					v-model="form.skewY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-opacity-box.label') || 'Opacity' }}
			</div>
			<div id="uiElement-transform-opacity-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-opacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox id="uiElement-events-group" open>
		<DetailSummary>{{ t('components.uiElement-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="uiElement-events"
			class="inspector-list"
			filter="element"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox id="uiElement-scripts-group" open>
		<DetailSummary>{{ t('components.uiElement-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList id="uiElement-scripts" class="inspector-list" flexible></ParamList>
	</DetailBox>
	<ParameterPane id="uiElement-parameter-pane"></ParameterPane>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiImage-properties-grid.label') || 'Image Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiImage-properties-grid">
			<div class="text">{{ t('components.uiImage-image.label') || 'Image' }}</div>
			<CustomBox
				id="uiImage-image"
				type="file"
				filter="image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiImage-display.label') || 'Display' }}</div>
			<SelectBox id="uiImage-display" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiImage-flip.label') || 'Flip' }}</div>
			<SelectBox id="uiImage-flip" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiImage-blend.label') || 'Blend' }}</div>
			<SelectBox id="uiImage-blend" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiImage-shift-box.label') || 'Shift' }}</div>
			<div id="uiImage-shift-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiImage-shiftX"
					min="-10000"
					max="10000"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiImage-shiftY"
					min="-10000"
					max="10000"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiImage-clip.label') || 'Clip' }}</div>
			<CustomBox
				id="uiImage-clip"
				type="clip"
				image="uiImage-image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiImage-border.label') || 'Border' }}</div>
			<NumberBox
				id="uiImage-border"
				min="1"
				max="100"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiImage-tint-0-box.label') || 'Tint - Red' }}</div>
			<div class="flex-box" id="uiImage-tint-0-box">
				<SliderBox id="uiImage-tint-0-slider" min="-255" max="255" step="15"></SliderBox>
				<NumberBox id="uiImage-tint-0" min="-255" max="255" step="5"></NumberBox>
			</div>
			<div class="text">{{ t('components.uiImage-tint-1-box.label') || 'Tint - Green' }}</div>
			<div class="flex-box" id="uiImage-tint-1-box">
				<SliderBox id="uiImage-tint-1-slider" min="-255" max="255" step="15"></SliderBox>
				<NumberBox id="uiImage-tint-1" min="-255" max="255" step="5"></NumberBox>
			</div>
			<div class="text">{{ t('components.uiImage-tint-2-box.label') || 'Tint - Blue' }}</div>
			<div class="flex-box" id="uiImage-tint-2-box">
				<SliderBox id="uiImage-tint-2-slider" min="-255" max="255" step="15"></SliderBox>
				<NumberBox id="uiImage-tint-2" min="-255" max="255" step="5"></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiImage-tint-3-box.label') || 'Tint - Grayscale' }}
			</div>
			<div class="flex-box" id="uiImage-tint-3-box">
				<SliderBox id="uiImage-tint-3-slider" min="0" max="255" step="15"></SliderBox>
				<NumberBox id="uiImage-tint-3" min="0" max="255" step="5"></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUIImagePage } from '@app/composables/useUIImagePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useUIImagePage();

const { bindInput, bindSliders } = useInspectorInput();

const loadItems = (id: string, items: { name: string; value: string }[]) => {
	const el = document.getElementById(id) as unknown as {
		loadItems?: (items: { name: string; value: string }[]) => void;
	} | null;
	el?.loadItems?.(items);
};

const relate = (
	id: string,
	config: { case: string | string[]; targets: (HTMLElement | null)[] }[]
) => {
	const el = document.getElementById(id) as unknown as {
		enableHiddenMode?: () => {
			relate: (
				config: { case: string | string[]; targets: (HTMLElement | null)[] }[]
			) => void;
		};
	} | null;
	if (el) el.enableHiddenMode()?.relate(config);
};

const synchronize = (sliderId: string, inputId: string) => {
	const slider = document.getElementById(sliderId) as unknown as {
		synchronize?: (el: HTMLElement | null) => void;
	} | null;
	const input = document.getElementById(inputId);
	slider?.synchronize?.(input);
};

onMounted(() => {
	const uiImage = Inspector.uiImage;
	if (!uiImage) return;

	loadItems('uiImage-display', [
		{ name: 'Stretch', value: 'stretch' },
		{ name: 'Tile', value: 'tile' },
		{ name: 'Clip', value: 'clip' },
		{ name: 'Slice', value: 'slice' }
	]);
	relate('uiImage-display', [
		{
			case: ['stretch', 'tile'],
			targets: [
				document.getElementById('uiImage-flip'),
				document.getElementById('uiImage-shift-box')
			]
		},
		{
			case: 'clip',
			targets: [
				document.getElementById('uiImage-flip'),
				document.getElementById('uiImage-clip')
			]
		},
		{
			case: 'slice',
			targets: [
				document.getElementById('uiImage-clip'),
				document.getElementById('uiImage-border')
			]
		}
	]);
	loadItems('uiImage-flip', [
		{ name: 'None', value: 'none' },
		{ name: 'Horizontal', value: 'horizontal' },
		{ name: 'Vertical', value: 'vertical' },
		{ name: 'Both', value: 'both' }
	]);
	loadItems('uiImage-blend', [
		{ name: 'Normal', value: 'normal' },
		{ name: 'Additive', value: 'additive' },
		{ name: 'Subtract', value: 'subtract' },
		{ name: 'Mask', value: 'mask' }
	]);
	synchronize('uiImage-tint-0-slider', 'uiImage-tint-0');
	synchronize('uiImage-tint-1-slider', 'uiImage-tint-1');
	synchronize('uiImage-tint-2-slider', 'uiImage-tint-2');
	synchronize('uiImage-tint-3-slider', 'uiImage-tint-3');

	const elements = document.querySelectorAll(`#uiImage-image,
    #uiImage-display, #uiImage-flip, #uiImage-blend,
    #uiImage-shiftX, #uiImage-shiftY, #uiImage-clip, #uiImage-border,
    #uiImage-tint-0, #uiImage-tint-1, #uiImage-tint-2, #uiImage-tint-3`);
	const sliders = document.querySelectorAll(`
    #uiImage-tint-0-slider, #uiImage-tint-1-slider,
    #uiImage-tint-2-slider, #uiImage-tint-3-slider`);
	bindInput(elements, uiImage, UI);
	bindSliders(sliders);

	const el = document.getElementById('uiImage-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
