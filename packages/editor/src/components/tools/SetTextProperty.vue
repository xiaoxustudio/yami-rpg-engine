<template>
	<!-- 设置文本 - 属性 -->
	<WindowFrame id="setText-property" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setText-property.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setText-property-key.label') }}</div>
			<SelectBox
				:label="t('components.setText-property-key.label')"
				id="setText-property-key"
				:ref="fieldRef('setText-property-key')"
				v-tip="t('components.setText-property-key.tip')"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.setText-property-content.label') }}</div>
			<TextAreaVar
				id="setText-property-content"
				:ref="fieldRef('setText-property-content')"
				menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
				v-model="form.content"
			/>
			<div class="text">{{ t('components.setText-property-size.label') }}</div>
			<NumberBox
				:label="t('components.setText-property-size.label')"
				id="setText-property-size"
				:ref="fieldRef('setText-property-size')"
				min="10"
				max="400"
				unit="px"
				v-model="size"
			/>
			<div class="text">{{ t('components.setText-property-lineSpacing.label') }}</div>
			<NumberBox
				:label="t('components.setText-property-lineSpacing.label')"
				id="setText-property-lineSpacing"
				:ref="fieldRef('setText-property-lineSpacing')"
				min="-10"
				max="100"
				unit="px"
				v-model="lineSpacing"
			/>
			<div class="text">{{ t('components.setText-property-letterSpacing.label') }}</div>
			<NumberBox
				:label="t('components.setText-property-letterSpacing.label')"
				id="setText-property-letterSpacing"
				:ref="fieldRef('setText-property-letterSpacing')"
				min="-10"
				max="100"
				unit="px"
				v-model="letterSpacing"
			/>
			<div class="text">{{ t('components.setText-property-color.label') }}</div>
			<ColorBox
				:label="t('components.setText-property-color.label')"
				id="setText-property-color"
				:ref="fieldRef('setText-property-color')"
				v-model="color"
			/>
			<div class="text">{{ t('components.setText-property-font.label') }}</div>
			<TextBox
				:label="t('components.setText-property-font.label')"
				id="setText-property-font"
				:ref="fieldRef('setText-property-font')"
				v-model="font"
			/>
			<div class="text">{{ t('components.setText-property-effect-type.label') }}</div>
			<SelectBox
				:label="t('components.setText-property-effect-type.label')"
				id="setText-property-effect-type"
				:ref="fieldRef('setText-property-effect-type')"
				v-model="form['effect-type']"
			/>
			<div class="text">
				{{ t('components.setText-property-effect-shadowOffsetX.label') }}
			</div>
			<NumberBox
				:label="t('components.setText-property-effect-shadowOffsetX.label')"
				id="setText-property-effect-shadowOffsetX"
				:ref="fieldRef('setText-property-effect-shadowOffsetX')"
				min="-9"
				max="9"
				unit="px"
				v-model="shadowOffsetX"
			/>
			<div class="text">
				{{ t('components.setText-property-effect-shadowOffsetY.label') }}
			</div>
			<NumberBox
				:label="t('components.setText-property-effect-shadowOffsetY.label')"
				id="setText-property-effect-shadowOffsetY"
				:ref="fieldRef('setText-property-effect-shadowOffsetY')"
				min="-9"
				max="9"
				unit="px"
				v-model="shadowOffsetY"
			/>
			<div class="text">{{ t('components.setText-property-effect-strokeWidth.label') }}</div>
			<NumberBox
				:label="t('components.setText-property-effect-strokeWidth.label')"
				id="setText-property-effect-strokeWidth"
				:ref="fieldRef('setText-property-effect-strokeWidth')"
				min="1"
				max="20"
				unit="px"
				v-model="strokeWidth"
			/>
			<div class="text">{{ t('components.setText-property-effect-color.label') }}</div>
			<ColorBox
				:label="t('components.setText-property-effect-color.label')"
				id="setText-property-effect-color"
				:ref="fieldRef('setText-property-effect-color')"
				v-model="effectColor"
			/>
			<div class="text">{{ t('components.setText-property-blend.label') }}</div>
			<SelectBox
				:label="t('components.setText-property-blend.label')"
				id="setText-property-blend"
				:ref="fieldRef('setText-property-blend')"
				v-model="form.blend"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { TextProperty } from '@app/commands/property-window/set-text-property-window';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';

const { t } = useI18n();

const form = TextProperty.form;

const onConfirm = () => {
	TextProperty.confirm?.(new Event('click'));
};

// 把控件实例登记给属性窗口工厂（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
TextProperty.fields = fields;

const numberField = (key: string) =>
	computed({
		get: () => form[key] as number | string,
		set: (value) => {
			form[key] = value;
		}
	});
const stringField = (key: string) =>
	computed({
		get: () => form[key] as string | undefined,
		set: (value) => {
			form[key] = value;
		}
	});
const size = numberField('size');
const lineSpacing = numberField('lineSpacing');
const letterSpacing = numberField('letterSpacing');
const shadowOffsetX = numberField('effect-shadowOffsetX');
const shadowOffsetY = numberField('effect-shadowOffsetY');
const strokeWidth = numberField('effect-strokeWidth');
const color = stringField('color');
const font = stringField('font');
const effectColor = stringField('effect-color');

onMounted(() => {
	// 懒挂载窗口：ParamList.bind 时的 initialize 可能早退，挂载后补齐 key 选项与字段联动
	TextProperty.ensureSetup?.();
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setText-property {
	width: 324px;
	height: 194px;
}

#setText-property-content {
	height: 92px;
}

#setText-property-confirm {
	right: 108px;
	bottom: 10px;
}

#setText-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
