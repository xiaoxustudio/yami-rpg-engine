<template>
	<div class="text">{{ t('components.uiTextBox-padding.label') || 'Padding' }}</div>
	<NumberBox
		:label="t('components.uiTextBox-padding.label') || 'Padding'"
		id="uiTextBox-padding"
		:ref="registryRef(inspectorEls, 'uiTextBox-padding')"
		v-tip="t('components.uiTextBox-padding.tip')"
		v-model="form.padding"
		min="0"
		max="100"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiTextBox-size.label') || 'Size' }}</div>
	<NumberBox
		:label="t('components.uiTextBox-size.label') || 'Size'"
		id="uiTextBox-size"
		:ref="registryRef(inspectorEls, 'uiTextBox-size')"
		v-tip="t('components.uiTextBox-size.tip')"
		v-model="form.size"
		min="10"
		max="400"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiTextBox-font.label') || 'Font' }}</div>
	<TextBox
		:label="t('components.uiTextBox-font.label') || 'Font'"
		id="uiTextBox-font"
		:placeholder="t('components.uiTextBox-font.placeholder')"
		:ref="registryRef(inspectorEls, 'uiTextBox-font')"
		v-tip="t('components.uiTextBox-font.tip')"
		v-model="form.font"
		@input="onParamInput"
	></TextBox>
	<div class="text">{{ t('components.uiTextBox-color.label') || 'Text Color' }}</div>
	<ColorBox
		id="uiTextBox-color"
		:ref="registryRef(inspectorEls, 'uiTextBox-color')"
		v-tip="t('components.uiTextBox-color.tip')"
		v-model="form.color"
		@input="onParamInput"
	></ColorBox>
	<div class="text">
		{{ t('components.uiTextBox-selectionColor.label') || 'Selection Color' }}
	</div>
	<ColorBox
		id="uiTextBox-selectionColor"
		:ref="registryRef(inspectorEls, 'uiTextBox-selectionColor')"
		v-tip="t('components.uiTextBox-selectionColor.tip')"
		v-model="form.selectionColor"
		@input="onParamInput"
	></ColorBox>
	<div class="text">
		{{ t('components.uiTextBox-selectionBgColor.label') || 'Selection Bg Color' }}
	</div>
	<ColorBox
		id="uiTextBox-selectionBgColor"
		:ref="registryRef(inspectorEls, 'uiTextBox-selectionBgColor')"
		v-tip="t('components.uiTextBox-selectionBgColor.tip')"
		v-model="form.selectionBgColor"
		@input="onParamInput"
	></ColorBox>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { uiTextBoxContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiTextBoxContextKey)!;
</script>
