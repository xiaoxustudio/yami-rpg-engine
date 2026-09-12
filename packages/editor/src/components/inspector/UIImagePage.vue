<template>
	<DetailBox id="uiElement-general-group"
				:ref="registryRef(inspectorEls, 'uiElement-general-group')" open>
		<DetailSummary>{{
			t('components.uiElement-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="uiElement-general-grid">
			<div class="text">{{ t('components.uiElement-name.label') || 'Name' }}</div>
			<TextBox id="uiElement-name"
				v-tip="t('components.uiElement-name.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-name')" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">
				{{ t('components.uiElement-pointerEvents.label') || 'Pointer Events' }}
			</div>
			<SelectBox
				id="uiElement-pointerEvents"
				v-tip="t('components.uiElement-pointerEvents.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-pointerEvents')"
				v-model="form.pointerEvents"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
	<DetailBox id="uiElement-transform-group"
				:ref="registryRef(inspectorEls, 'uiElement-transform-group')" open>
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
				v-tip="t('components.uiElement-transform-align-left.tip')"
					class="uiElement-transform-align"
					value="left"
				>
					<div class="text">&#xf036;</div>
				</button>
				<button
					id="uiElement-transform-align-center"
				v-tip="t('components.uiElement-transform-align-center.tip')"
					class="uiElement-transform-align"
					value="center"
				>
					<div class="text">&#xf037;</div>
				</button>
				<button
					id="uiElement-transform-align-right"
				v-tip="t('components.uiElement-transform-align-right.tip')"
					class="uiElement-transform-align"
					value="right"
				>
					<div class="text">&#xf038;</div>
				</button>
				<button
					id="uiElement-transform-align-top"
				v-tip="t('components.uiElement-transform-align-top.tip')"
					class="uiElement-transform-align rotated"
					value="top"
				>
					<div class="text">&#xf036;</div>
				</button>
				<button
					id="uiElement-transform-align-middle"
				v-tip="t('components.uiElement-transform-align-middle.tip')"
					class="uiElement-transform-align rotated"
					value="middle"
				>
					<div class="text">&#xf037;</div>
				</button>
				<button
					id="uiElement-transform-align-bottom"
				v-tip="t('components.uiElement-transform-align-bottom.tip')"
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
				v-tip="t('components.uiElement-transform-anchorX.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-transform-anchorX')"
					v-model="form.anchorX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-anchorY"
				v-tip="t('components.uiElement-transform-anchorY.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-transform-anchorY')"
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
				v-tip="t('components.uiElement-transform-x.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-transform-x')"
					v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-x2"
				v-tip="t('components.uiElement-transform-x2.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-transform-x2')"
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
				v-tip="t('components.uiElement-transform-y.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-transform-y')"
					v-model="form.y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-y2"
				v-tip="t('components.uiElement-transform-y2.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-transform-y2')"
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
				v-tip="t('components.uiElement-transform-width.tip')"
					v-model="form.width"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-width2"
				v-tip="t('components.uiElement-transform-width2.tip')"
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
				v-tip="t('components.uiElement-transform-height.tip')"
					v-model="form.height"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-height2"
				v-tip="t('components.uiElement-transform-height2.tip')"
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
				v-tip="t('components.uiElement-transform-rotation.tip')"
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
				v-tip="t('components.uiElement-transform-scaleX.tip')"
					v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-scaleY"
				v-tip="t('components.uiElement-transform-scaleY.tip')"
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
				v-tip="t('components.uiElement-transform-skewX.tip')"
					v-model="form.skewX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-skewY"
				v-tip="t('components.uiElement-transform-skewY.tip')"
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
				v-tip="t('components.uiElement-transform-opacity.tip')"
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
	<DetailBox id="uiElement-events-group"
				:ref="registryRef(inspectorEls, 'uiElement-events-group')" open>
		<DetailSummary>{{ t('components.uiElement-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="uiElement-events"
				v-tip="t('components.uiElement-events.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-events')"
			class="inspector-list"
			filter="element"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox id="uiElement-scripts-group"
				:ref="registryRef(inspectorEls, 'uiElement-scripts-group')" open>
		<DetailSummary>{{ t('components.uiElement-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList id="uiElement-scripts"
				v-tip="t('components.uiElement-scripts.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-scripts')" class="inspector-list" flexible></ParamList>
	</DetailBox>
	<ParameterPane id="uiElement-parameter-pane"
				:ref="registryRef(inspectorEls, 'uiElement-parameter-pane')"></ParameterPane>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiImage-properties-grid.label') || 'Image Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiImage-properties-grid">
			<div class="text">{{ t('components.uiImage-image.label') || 'Image' }}</div>
			<CustomBox
				id="uiImage-image"
				v-tip="t('components.uiImage-image.tip')"
				v-model="form.image"
				type="file"
				filter="image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiImage-display.label') || 'Display' }}</div>
			<SelectBox
				ref="elDisplay"
				id="uiImage-display"
				v-tip="t('components.uiImage-display.tip')"
				v-model="form.display"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiImage-flip.label') || 'Flip' }}</div>
			<SelectBox
				ref="elFlip"
				id="uiImage-flip"
				v-tip="t('components.uiImage-flip.tip')"
				v-model="form.flip"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiImage-blend.label') || 'Blend' }}</div>
			<SelectBox
				ref="elBlend"
				id="uiImage-blend"
				v-tip="t('components.uiImage-blend.tip')"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiImage-shift-box.label') || 'Shift' }}</div>
			<div
				ref="elShiftBox"
				id="uiImage-shift-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiImage-shiftX"
				v-tip="t('components.uiImage-shiftX.tip')"
					v-model="form.shiftX"
					min="-10000"
					max="10000"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiImage-shiftY"
				v-tip="t('components.uiImage-shiftY.tip')"
					v-model="form.shiftY"
					min="-10000"
					max="10000"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiImage-clip.label') || 'Clip' }}</div>
			<CustomBox
				ref="elClip"
				id="uiImage-clip"
				v-tip="t('components.uiImage-clip.tip')"
				v-model="form.clip"
				type="clip"
				image="uiImage-image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiImage-border.label') || 'Border' }}</div>
			<NumberBox
				ref="elBorder"
				id="uiImage-border"
				v-tip="t('components.uiImage-border.tip')"
				v-model="form.border"
				min="1"
				max="100"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiImage-tint-0-box.label') || 'Tint - Red' }}</div>
			<div class="flex-box" id="uiImage-tint-0-box"
				v-tip="t('components.uiImage-tint-0-box.tip')">
				<SliderBox
					ref="elTint0Slider"
					id="uiImage-tint-0-slider"
					v-model="form['tint-0']"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					ref="elTint0"
					id="uiImage-tint-0"
					v-model="form['tint-0']"
					min="-255"
					max="255"
					step="5"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiImage-tint-1-box.label') || 'Tint - Green' }}</div>
			<div class="flex-box" id="uiImage-tint-1-box"
				v-tip="t('components.uiImage-tint-1-box.tip')">
				<SliderBox
					ref="elTint1Slider"
					id="uiImage-tint-1-slider"
					v-model="form['tint-1']"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					ref="elTint1"
					id="uiImage-tint-1"
					v-model="form['tint-1']"
					min="-255"
					max="255"
					step="5"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiImage-tint-2-box.label') || 'Tint - Blue' }}</div>
			<div class="flex-box" id="uiImage-tint-2-box"
				v-tip="t('components.uiImage-tint-2-box.tip')">
				<SliderBox
					ref="elTint2Slider"
					id="uiImage-tint-2-slider"
					v-model="form['tint-2']"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					ref="elTint2"
					id="uiImage-tint-2"
					v-model="form['tint-2']"
					min="-255"
					max="255"
					step="5"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiImage-tint-3-box.label') || 'Tint - Grayscale' }}
			</div>
			<div class="flex-box" id="uiImage-tint-3-box"
				v-tip="t('components.uiImage-tint-3-box.tip')">
				<SliderBox
					ref="elTint3Slider"
					id="uiImage-tint-3-slider"
					v-model="form['tint-3']"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					ref="elTint3"
					id="uiImage-tint-3"
					v-model="form['tint-3']"
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
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
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

const { form, sync, onParamInput: onParamInputEvent } = useUIImagePage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput, bindSliders } = useInspectorInput();

const elDisplay = ref<InstanceType<typeof SelectBox> | null>(null);
const elFlip = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elShiftBox = ref<HTMLElement | null>(null);
const elClip = ref<InstanceType<typeof CustomBox> | null>(null);
const elBorder = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint0Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint0 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint1Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint1 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint2Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint2 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint3Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint3 = ref<InstanceType<typeof NumberBox> | null>(null);

const synchronize = (
	slider: InstanceType<typeof SliderBox> | null,
	input: InstanceType<typeof NumberBox> | null
) => {
	const el = input?.root ?? null;
	if (!el) return;
	slider?.synchronize(
		el as HTMLElement & {
			write(value: number | string): void;
			input: HTMLInputElement;
		}
	);
};

onMounted(() => {
	const uiImage = Inspector.uiImage;
	if (!uiImage) return;

	elDisplay.value?.loadItems([
		{ name: t('components.uiImage-display.options.stretch.name'), tip: t('components.uiImage-display.options.stretch.tip'), value: 'stretch'  },
		{ name: t('components.uiImage-display.options.tile.name'), tip: t('components.uiImage-display.options.tile.tip'), value: 'tile'  },
		{ name: t('components.uiImage-display.options.clip.name'), tip: t('components.uiImage-display.options.clip.tip'), value: 'clip'  },
		{ name: t('components.uiImage-display.options.slice.name'), tip: t('components.uiImage-display.options.slice.tip'), value: 'slice'  }
	]);
	elDisplay.value?.enableHiddenMode();
	elDisplay.value?.relate([
		{
			case: ['stretch', 'tile'],
			targets: [elFlip.value?.root ?? null, elShiftBox.value]
		},
		{
			case: 'clip',
			targets: [elFlip.value?.root ?? null, elClip.value?.root ?? null]
		},
		{
			case: 'slice',
			targets: [elClip.value?.root ?? null, elBorder.value?.root ?? null]
		}
	]);
	elFlip.value?.loadItems([
		{ name: t('components.uiImage-flip.options.none.name'), tip: t('components.uiImage-flip.options.none.tip'), value: 'none'  },
		{ name: t('components.uiImage-flip.options.horizontal.name'), tip: t('components.uiImage-flip.options.horizontal.tip'), value: 'horizontal'  },
		{ name: t('components.uiImage-flip.options.vertical.name'), tip: t('components.uiImage-flip.options.vertical.tip'), value: 'vertical'  },
		{ name: t('components.uiImage-flip.options.both.name'), tip: t('components.uiImage-flip.options.both.tip'), value: 'both'  }
	]);
	elBlend.value?.loadItems([
		{ name: t('components.uiImage-blend.options.normal.name'), tip: t('components.uiImage-blend.options.normal.tip'), value: 'normal'  },
		{ name: t('components.uiImage-blend.options.additive.name'), tip: t('components.uiImage-blend.options.additive.tip'), value: 'additive'  },
		{ name: t('components.uiImage-blend.options.subtract.name'), tip: t('components.uiImage-blend.options.subtract.tip'), value: 'subtract'  },
		{ name: t('components.uiImage-blend.options.mask.name'), tip: t('components.uiImage-blend.options.mask.tip'), value: 'mask'  }
	]);
	synchronize(elTint0Slider.value, elTint0.value);
	synchronize(elTint1Slider.value, elTint1.value);
	synchronize(elTint2Slider.value, elTint2.value);
	synchronize(elTint3Slider.value, elTint3.value);

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

<style>
/* 样式迁移：由 Project/css/scene.css 迁入组件（选择器为全局 id，不能用 scoped） */
#uiImage-tint-0-slider,
#uiImage-tint-1-slider,
#uiImage-tint-2-slider,
#uiImage-tint-3-slider {
	flex: 2 1 auto;
}

#uiImage-tint-0,
#uiImage-tint-1,
#uiImage-tint-2,
#uiImage-tint-3 {
	flex: 1 1 auto;
}
</style>

