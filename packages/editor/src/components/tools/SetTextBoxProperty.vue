<template>
	<!-- 设置文本框 - 属性 -->
	<WindowFrame id="setTextBox-property" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTextBox-property.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTextBox-property-key.label') }}</div>
			<SelectBox
				id="setTextBox-property-key"
				:ref="fieldRef('setTextBox-property-key')"
				v-tip="t('components.setTextBox-property-key.tip')"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.setTextBox-property-type.label') }}</div>
			<SelectBox
				id="setTextBox-property-type"
				:ref="fieldRef('setTextBox-property-type')"
				v-model="form.type"
			/>
			<div class="text">{{ t('components.setTextBox-property-text.label') }}</div>
			<StringVar
				id="setTextBox-property-text"
				:ref="fieldRef('setTextBox-property-text')"
				v-model="form.text"
			/>
			<div class="text">{{ t('components.setTextBox-property-number.label') }}</div>
			<NumberVar
				id="setTextBox-property-number"
				:ref="fieldRef('setTextBox-property-number')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.number"
			/>
			<div class="text">{{ t('components.setTextBox-property-min.label') }}</div>
			<NumberVar
				id="setTextBox-property-min"
				:ref="fieldRef('setTextBox-property-min')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.min"
			/>
			<div class="text">{{ t('components.setTextBox-property-max.label') }}</div>
			<NumberVar
				id="setTextBox-property-max"
				:ref="fieldRef('setTextBox-property-max')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.max"
			/>
			<div class="text">{{ t('components.setTextBox-property-decimals.label') }}</div>
			<NumberBox
				:label="t('components.setTextBox-property-decimals.label')"
				id="setTextBox-property-decimals"
				:ref="fieldRef('setTextBox-property-decimals')"
				min="0"
				max="10"
				v-model="decimals"
			/>
			<div class="text">{{ t('components.setTextBox-property-color.label') }}</div>
			<ColorBox
				id="setTextBox-property-color"
				:ref="fieldRef('setTextBox-property-color')"
				v-model="color"
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
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { TextBoxProperty } from '@app/commands/property-window/set-textbox-property-window';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';

const { t } = useI18n();

const form = TextBoxProperty.form;

const onConfirm = () => {
	TextBoxProperty.confirm?.(new Event('click'));
};

// 把控件实例登记给属性窗口工厂（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
TextBoxProperty.fields = fields;

const decimals = computed({
	get: () => form.decimals as number | string,
	set: (value) => {
		form.decimals = value;
	}
});
const color = computed({
	get: () => form.color as string | undefined,
	set: (value) => {
		form.color = value;
	}
});

onMounted(() => {
	// 懒挂载窗口：ParamList.bind 时的 initialize 可能早退，挂载后补齐 key 选项与字段联动
	TextBoxProperty.ensureSetup?.();
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setTextBox-property {
	width: 324px;
	height: 122px;
}

#setTextBox-property-confirm {
	right: 108px;
	bottom: 10px;
}

#setTextBox-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
