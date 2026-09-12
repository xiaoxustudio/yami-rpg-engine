<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiText-properties-grid.label') || 'Text Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiText-properties-grid">
			<div class="text">{{ t('components.uiText-direction.label') || 'Direction' }}</div>
			<SelectBox
				ref="elDirection"
				id="uiText-direction"
				v-tip="t('components.uiText-direction.tip')"
				v-model="form.direction"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiText-align-box.label') || 'Align' }}</div>
			<div class="flex-box" id="uiText-align-box">
				<RadioBox
					id="uiText-align-left"
				v-tip="t('components.uiText-align-left.tip')"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="left"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-center"
				v-tip="t('components.uiText-align-center.tip')"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="center"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-right"
				v-tip="t('components.uiText-align-right.tip')"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="right"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-top"
				v-tip="t('components.uiText-align-top.tip')"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="top"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-middle"
				v-tip="t('components.uiText-align-middle.tip')"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="middle"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-bottom"
				v-tip="t('components.uiText-align-bottom.tip')"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="bottom"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
			</div>
			<div class="text">{{ t('components.uiText-content.label') || 'Content' }}</div>
			<TextArea
				id="uiText-content"
				v-tip="t('components.uiText-content.tip')"
				v-model="form.content"
				menu="tag-global-var tag-dynamic-global-var tag-localization"
				@input="onParamInput"
			></TextArea>
			<div class="text">{{ t('components.uiText-size-box.label') || 'Size' }}</div>
			<div class="flex-box" id="uiText-size-box"
				v-tip="t('components.uiText-size-box.tip')">
				<SliderBox
					ref="elSizeSlider"
					id="uiText-size-slider"
					v-model="form.size"
					min="12"
					max="52"
					step="2"
				></SliderBox>
				<NumberBox
					ref="elSize"
					id="uiText-size"
					v-model="form.size"
					min="10"
					max="400"
					step="1"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiText-lineSpacing-box.label') || 'Line Spacing' }}
			</div>
			<div class="flex-box" id="uiText-lineSpacing-box"
				v-tip="t('components.uiText-lineSpacing-box.tip')">
				<SliderBox
					ref="elLineSpacingSlider"
					id="uiText-lineSpacing-slider"
					v-model="form.lineSpacing"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					ref="elLineSpacing"
					id="uiText-lineSpacing"
					v-model="form.lineSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiText-letterSpacing-box.label') || 'Letter Spacing' }}
			</div>
			<div class="flex-box" id="uiText-letterSpacing-box"
				v-tip="t('components.uiText-letterSpacing-box.tip')">
				<SliderBox
					ref="elLetterSpacingSlider"
					id="uiText-letterSpacing-slider"
					v-model="form.letterSpacing"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					ref="elLetterSpacing"
					id="uiText-letterSpacing"
					v-model="form.letterSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiText-color.label') || 'Color' }}</div>
			<ColorBox id="uiText-color"
				v-tip="t('components.uiText-color.tip')" v-model="form.color" @input="onParamInput"></ColorBox>
			<div class="text">{{ t('components.uiText-font.label') || 'Font' }}</div>
			<TextBox id="uiText-font"
				v-tip="t('components.uiText-font.tip')" v-model="form.font" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.uiText-typeface.label') || 'Typeface' }}</div>
			<SelectBox
				ref="elTypeface"
				id="uiText-typeface"
				v-tip="t('components.uiText-typeface.tip')"
				v-model="form.typeface"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiText-effect-type.label') || 'Effect' }}</div>
			<SelectBox
				ref="elEffectType"
				id="uiText-effect-type"
				v-tip="t('components.uiText-effect-type.tip')"
				v-model="form.effect.type"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.uiText-effect-shadowOffsetX.label') || 'Shadow X' }}
			</div>
			<NumberBox
				ref="elShadowOffsetX"
				id="uiText-effect-shadowOffsetX"
				v-tip="t('components.uiText-effect-shadowOffsetX.tip')"
				v-model="form.effect.shadowOffsetX"
				min="-9"
				max="9"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">
				{{ t('components.uiText-effect-shadowOffsetY.label') || 'Shadow Y' }}
			</div>
			<NumberBox
				ref="elShadowOffsetY"
				id="uiText-effect-shadowOffsetY"
				v-tip="t('components.uiText-effect-shadowOffsetY.tip')"
				v-model="form.effect.shadowOffsetY"
				min="-9"
				max="9"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">
				{{ t('components.uiText-effect-strokeWidth.label') || 'Stroke Width' }}
			</div>
			<NumberBox
				ref="elStrokeWidth"
				id="uiText-effect-strokeWidth"
				v-tip="t('components.uiText-effect-strokeWidth.tip')"
				v-model="form.effect.strokeWidth"
				min="1"
				max="20"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">
				{{ t('components.uiText-effect-color.label') || 'Effect Color' }}
			</div>
			<ColorBox
				ref="elEffectColor"
				id="uiText-effect-color"
				v-tip="t('components.uiText-effect-color.tip')"
				v-model="form.effect.color"
				@input="onParamInput"
			></ColorBox>
			<div class="text">{{ t('components.uiText-overflow.label') || 'Overflow' }}</div>
			<SelectBox
				ref="elOverflow"
				id="uiText-overflow"
				v-tip="t('components.uiText-overflow.tip')"
				v-model="form.overflow"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiText-blend.label') || 'Blend' }}</div>
			<SelectBox
				ref="elBlend"
				id="uiText-blend"
				v-tip="t('components.uiText-blend.tip')"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUITextPage } from '@app/composables/useUITextPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUITextPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput, bindSliders } = useInspectorInput();

const elDirection = ref<InstanceType<typeof SelectBox> | null>(null);
const elTypeface = ref<InstanceType<typeof SelectBox> | null>(null);
const elEffectType = ref<InstanceType<typeof SelectBox> | null>(null);
const elOverflow = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elSizeSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elSize = ref<InstanceType<typeof NumberBox> | null>(null);
const elLineSpacingSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elLineSpacing = ref<InstanceType<typeof NumberBox> | null>(null);
const elLetterSpacingSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elLetterSpacing = ref<InstanceType<typeof NumberBox> | null>(null);
const elShadowOffsetX = ref<InstanceType<typeof NumberBox> | null>(null);
const elShadowOffsetY = ref<InstanceType<typeof NumberBox> | null>(null);
const elStrokeWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elEffectColor = ref<InstanceType<typeof ColorBox> | null>(null);

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
	const uiText = Inspector.uiText;
	if (!uiText) return;

	elDirection.value?.loadItems([
		{ name: t('components.uiText-direction.options.horizontal-tb.name'), tip: t('components.uiText-direction.options.horizontal-tb.tip'), value: 'horizontal-tb'  },
		{ name: t('components.uiText-direction.options.vertical-lr.name'), tip: t('components.uiText-direction.options.vertical-lr.tip'), value: 'vertical-lr'  },
		{ name: t('components.uiText-direction.options.vertical-rl.name'), tip: t('components.uiText-direction.options.vertical-rl.tip'), value: 'vertical-rl'  }
	]);
	elTypeface.value?.loadItems([
		{ name: t('components.uiText-typeface.options.regular.name'), tip: t('components.uiText-typeface.options.regular.tip'), value: 'regular'  },
		{ name: t('components.uiText-typeface.options.bold.name'), tip: t('components.uiText-typeface.options.bold.tip'), value: 'bold'  },
		{ name: t('components.uiText-typeface.options.italic.name'), tip: t('components.uiText-typeface.options.italic.tip'), value: 'italic'  },
		{ name: t('components.uiText-typeface.options.bold-italic.name'), tip: t('components.uiText-typeface.options.bold-italic.tip'), value: 'bold-italic'  }
	]);
	elEffectType.value?.loadItems([
		{ name: t('components.uiText-effect-type.options.none.name'), tip: t('components.uiText-effect-type.options.none.tip'), value: 'none'  },
		{ name: t('components.uiText-effect-type.options.shadow.name'), tip: t('components.uiText-effect-type.options.shadow.tip'), value: 'shadow'  },
		{ name: t('components.uiText-effect-type.options.stroke.name'), tip: t('components.uiText-effect-type.options.stroke.tip'), value: 'stroke'  },
		{ name: t('components.uiText-effect-type.options.outline.name'), tip: t('components.uiText-effect-type.options.outline.tip'), value: 'outline'  }
	]);
	elOverflow.value?.loadItems([
		{ name: t('components.uiText-overflow.options.visible.name'), tip: t('components.uiText-overflow.options.visible.tip'), value: 'visible'  },
		{ name: t('components.uiText-overflow.options.wrap.name'), tip: t('components.uiText-overflow.options.wrap.tip'), value: 'wrap'  },
		{ name: t('components.uiText-overflow.options.truncate.name'), tip: t('components.uiText-overflow.options.truncate.tip'), value: 'truncate'  },
		{ name: t('components.uiText-overflow.options.wrap-truncate.name'), tip: t('components.uiText-overflow.options.wrap-truncate.tip'), value: 'wrap-truncate'  }
	]);
	elBlend.value?.loadItems([
		{ name: t('components.uiText-blend.options.normal.name'), tip: t('components.uiText-blend.options.normal.tip'), value: 'normal'  },
		{ name: t('components.uiText-blend.options.additive.name'), tip: t('components.uiText-blend.options.additive.tip'), value: 'additive'  },
		{ name: t('components.uiText-blend.options.subtract.name'), tip: t('components.uiText-blend.options.subtract.tip'), value: 'subtract'  }
	]);
	synchronize(elSizeSlider.value, elSize.value);
	synchronize(elLineSpacingSlider.value, elLineSpacing.value);
	synchronize(elLetterSpacingSlider.value, elLetterSpacing.value);
	elEffectType.value?.enableHiddenMode();
	elEffectType.value?.relate([
		{
			case: 'shadow',
			targets: [
				elShadowOffsetX.value?.root ?? null,
				elShadowOffsetY.value?.root ?? null,
				elEffectColor.value?.root ?? null
			]
		},
		{
			case: 'stroke',
			targets: [elStrokeWidth.value?.root ?? null, elEffectColor.value?.root ?? null]
		},
		{ case: 'outline', targets: [elEffectColor.value?.root ?? null] }
	]);

	const elements =
		document.querySelectorAll(`#uiText-direction, #uiText-horizontalAlign, #uiText-verticalAlign,
    #uiText-content, #uiText-size, #uiText-lineSpacing, #uiText-letterSpacing, #uiText-color, #uiText-font,
    #uiText-typeface, #uiText-effect-type, #uiText-effect-shadowOffsetX, #uiText-effect-shadowOffsetY,
    #uiText-effect-strokeWidth, #uiText-effect-color, #uiText-overflow, #uiText-blend`);
	const sliders = document.querySelectorAll(
		'#uiText-size-slider, #uiText-lineSpacing-slider, #uiText-letterSpacing-slider'
	);
	bindInput(elements, uiText, UI);
	bindSliders(sliders);

	const el = document.getElementById('uiText-vue-mount');
	if (el) {
		attachElementApi(el, { sync, form });
	}
	sync();
});
</script>

<style>
/* 样式迁移：由 Project/css/scene.css 迁入组件（选择器为全局 id，不能用 scoped） */
#uiText-content {
	height: 140px;
}

#uiText-size-slider,
#uiText-lineSpacing-slider,
#uiText-letterSpacing-slider {
	flex: 2 1 auto;
}

#uiText-size,
#uiText-lineSpacing,
#uiText-letterSpacing {
	flex: 1 1 auto;
}
</style>

