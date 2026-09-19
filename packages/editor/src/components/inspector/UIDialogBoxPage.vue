<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiDialogBox-properties-grid.label') || 'DialogBox Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiDialogBox-properties-grid">
			<div class="text">{{ t('components.uiDialogBox-content.label') || 'Content' }}</div>
			<TextArea
				id="uiDialogBox-content"
				:ref="registryRef(inspectorEls, 'uiDialogBox-content')"
				v-tip="t('components.uiDialogBox-content.tip')"
				:model-value="form.content"
				menu="tag-localization"
				@input="onParamInput"
			></TextArea>
			<div class="text">
				{{ t('components.uiDialogBox-interval.label') || 'Print Interval' }}
			</div>
			<NumberBox
				id="uiDialogBox-interval"
				:ref="registryRef(inspectorEls, 'uiDialogBox-interval')"
				v-tip="t('components.uiDialogBox-interval.tip')"
				v-model="form.interval"
				min="0"
				max="100"
				decimals="4"
				unit="ms"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiDialogBox-size-box.label') || 'Size' }}</div>
			<div class="flex-box" id="uiDialogBox-size-box"
				v-tip="t('components.uiDialogBox-size-box.tip')">
				<SliderBox
					ref="elSizeSlider"
					id="uiDialogBox-size-slider"
					min="12"
					max="52"
					step="2"
				></SliderBox>
				<NumberBox
					ref="elSize"
					id="uiDialogBox-size"
					v-model="form.size"
					min="10"
					max="400"
					step="1"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiDialogBox-lineSpacing-box.label') || 'Line Spacing' }}
			</div>
			<div class="flex-box" id="uiDialogBox-lineSpacing-box"
				v-tip="t('components.uiDialogBox-lineSpacing-box.tip')">
				<SliderBox
					ref="elLineSpacingSlider"
					id="uiDialogBox-lineSpacing-slider"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					ref="elLineSpacing"
					id="uiDialogBox-lineSpacing"
					v-model="form.lineSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiDialogBox-letterSpacing-box.label') || 'Letter Spacing' }}
			</div>
			<div class="flex-box" id="uiDialogBox-letterSpacing-box"
				v-tip="t('components.uiDialogBox-letterSpacing-box.tip')">
				<SliderBox
					ref="elLetterSpacingSlider"
					id="uiDialogBox-letterSpacing-slider"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					ref="elLetterSpacing"
					id="uiDialogBox-letterSpacing"
					v-model="form.letterSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiDialogBox-color.label') || 'Color' }}</div>
			<ColorBox id="uiDialogBox-color"
				:ref="registryRef(inspectorEls, 'uiDialogBox-color')"
				v-tip="t('components.uiDialogBox-color.tip')" v-model="form.color" @input="onParamInput"></ColorBox>
			<div class="text">{{ t('components.uiDialogBox-font.label') || 'Font' }}</div>
			<TextBox id="uiDialogBox-font"
			:placeholder="t('components.uiDialogBox-font.placeholder')"
				:ref="registryRef(inspectorEls, 'uiDialogBox-font')"
				v-tip="t('components.uiDialogBox-font.tip')" v-model="form.font" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.uiDialogBox-typeface.label') || 'Typeface' }}</div>
			<SelectBox
				ref="elTypeface"
				id="uiDialogBox-typeface"
				v-tip="t('components.uiDialogBox-typeface.tip')"
				v-model="form.typeface"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiDialogBox-effect-type.label') || 'Effect' }}</div>
			<SelectBox
				ref="elEffectType"
				id="uiDialogBox-effect-type"
				v-tip="t('components.uiDialogBox-effect-type.tip')"
				v-model="form.effect.type"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.uiDialogBox-effect-shadowOffsetX.label') || 'Shadow X' }}
			</div>
			<NumberBox
				ref="elShadowOffsetX"
				id="uiDialogBox-effect-shadowOffsetX"
				v-tip="t('components.uiDialogBox-effect-shadowOffsetX.tip')"
				v-model="form.effect.shadowOffsetX"
				min="-9"
				max="9"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">
				{{ t('components.uiDialogBox-effect-shadowOffsetY.label') || 'Shadow Y' }}
			</div>
			<NumberBox
				ref="elShadowOffsetY"
				id="uiDialogBox-effect-shadowOffsetY"
				v-tip="t('components.uiDialogBox-effect-shadowOffsetY.tip')"
				v-model="form.effect.shadowOffsetY"
				min="-9"
				max="9"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">
				{{ t('components.uiDialogBox-effect-strokeWidth.label') || 'Stroke Width' }}
			</div>
			<NumberBox
				ref="elStrokeWidth"
				id="uiDialogBox-effect-strokeWidth"
				v-tip="t('components.uiDialogBox-effect-strokeWidth.tip')"
				v-model="form.effect.strokeWidth"
				min="1"
				max="20"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">
				{{ t('components.uiDialogBox-effect-color.label') || 'Effect Color' }}
			</div>
			<ColorBox
				ref="elEffectColor"
				id="uiDialogBox-effect-color"
				v-tip="t('components.uiDialogBox-effect-color.tip')"
				v-model="form.effect.color"
				@input="onParamInput"
			></ColorBox>
			<div class="text">{{ t('components.uiDialogBox-blend.label') || 'Blend' }}</div>
			<SelectBox
				ref="elBlend"
				id="uiDialogBox-blend"
				v-tip="t('components.uiDialogBox-blend.tip')"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { registryElements, registerElement, registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useUIDialogBoxPage } from '@app/composables/useUIDialogBoxPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIDialogBoxPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput, bindSliders } = useInspectorInput();

const elTypeface = ref<InstanceType<typeof SelectBox> | null>(null);
const elEffectType = ref<InstanceType<typeof SelectBox> | null>(null);
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
	// P1b：以下控件的 :ref 槽位已被具名 ref 占用 → 命令式登记（页面内批量绑定焦点/滑杆用）
	registerElement(inspectorEls, 'uiDialogBox-size', elSize.value);
	registerElement(inspectorEls, 'uiDialogBox-lineSpacing', elLineSpacing.value);
	registerElement(inspectorEls, 'uiDialogBox-letterSpacing', elLetterSpacing.value);
	registerElement(inspectorEls, 'uiDialogBox-typeface', elTypeface.value);
	registerElement(inspectorEls, 'uiDialogBox-effect-type', elEffectType.value);
	registerElement(inspectorEls, 'uiDialogBox-effect-shadowOffsetX', elShadowOffsetX.value);
	registerElement(inspectorEls, 'uiDialogBox-effect-shadowOffsetY', elShadowOffsetY.value);
	registerElement(inspectorEls, 'uiDialogBox-effect-strokeWidth', elStrokeWidth.value);
	registerElement(inspectorEls, 'uiDialogBox-effect-color', elEffectColor.value);
	registerElement(inspectorEls, 'uiDialogBox-blend', elBlend.value);
	registerElement(inspectorEls, 'uiDialogBox-size-slider', elSizeSlider.value);
	registerElement(inspectorEls, 'uiDialogBox-lineSpacing-slider', elLineSpacingSlider.value);
	registerElement(inspectorEls, 'uiDialogBox-letterSpacing-slider', elLetterSpacingSlider.value);
	const uiDialogBox = Inspector.uiDialogBox;
	if (!uiDialogBox) return;

	elTypeface.value?.loadItems([
		{ name: t('components.uiDialogBox-typeface.options.regular.name'), tip: t('components.uiDialogBox-typeface.options.regular.tip'), value: 'regular'  },
		{ name: t('components.uiDialogBox-typeface.options.bold.name'), tip: t('components.uiDialogBox-typeface.options.bold.tip'), value: 'bold'  },
		{ name: t('components.uiDialogBox-typeface.options.italic.name'), tip: t('components.uiDialogBox-typeface.options.italic.tip'), value: 'italic'  },
		{ name: t('components.uiDialogBox-typeface.options.bold-italic.name'), tip: t('components.uiDialogBox-typeface.options.bold-italic.tip'), value: 'bold-italic'  }
	]);
	elEffectType.value?.loadItems([
		{ name: t('components.uiDialogBox-effect-type.options.none.name'), tip: t('components.uiDialogBox-effect-type.options.none.tip'), value: 'none'  },
		{ name: t('components.uiDialogBox-effect-type.options.shadow.name'), tip: t('components.uiDialogBox-effect-type.options.shadow.tip'), value: 'shadow'  },
		{ name: t('components.uiDialogBox-effect-type.options.stroke.name'), tip: t('components.uiDialogBox-effect-type.options.stroke.tip'), value: 'stroke'  },
		{ name: t('components.uiDialogBox-effect-type.options.outline.name'), tip: t('components.uiDialogBox-effect-type.options.outline.tip'), value: 'outline'  }
	]);
	elBlend.value?.loadItems([
		{ name: t('components.uiDialogBox-blend.options.normal.name'), tip: t('components.uiDialogBox-blend.options.normal.tip'), value: 'normal'  },
		{ name: t('components.uiDialogBox-blend.options.additive.name'), tip: t('components.uiDialogBox-blend.options.additive.tip'), value: 'additive'  },
		{ name: t('components.uiDialogBox-blend.options.subtract.name'), tip: t('components.uiDialogBox-blend.options.subtract.tip'), value: 'subtract'  }
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
		registryElements(inspectorEls, [
		'uiDialogBox-content',
		'uiDialogBox-interval',
		'uiDialogBox-size',
		'uiDialogBox-lineSpacing',
		'uiDialogBox-letterSpacing',
		'uiDialogBox-color',
		'uiDialogBox-font',
		'uiDialogBox-typeface',
		'uiDialogBox-effect-type',
		'uiDialogBox-effect-shadowOffsetX',
		'uiDialogBox-effect-shadowOffsetY',
		'uiDialogBox-effect-strokeWidth',
		'uiDialogBox-effect-color',
		'uiDialogBox-blend'
	]);
	const sliders = registryElements(inspectorEls, ['uiDialogBox-size-slider', 'uiDialogBox-lineSpacing-slider', 'uiDialogBox-letterSpacing-slider']);
	bindInput(elements, getUIStore(), uiDialogBox);
	bindSliders(sliders);

	const el = inspectorEls.get('uiDialogBox-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>

<style>
/* 样式迁移：由 Project/css/scene.css 迁入组件（选择器为全局 id，不能用 scoped） */
#uiDialogBox-content {
	height: 140px;
}

#uiDialogBox-size-slider,
#uiDialogBox-lineSpacing-slider,
#uiDialogBox-letterSpacing-slider {
	flex: 2 1 auto;
}

#uiDialogBox-size,
#uiDialogBox-lineSpacing,
#uiDialogBox-letterSpacing {
	flex: 1 1 auto;
}
</style>

