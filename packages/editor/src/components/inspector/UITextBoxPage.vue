<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.uiTextBox-properties-grid.label') || 'TextBox Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiTextBox-properties-grid">
			<div class="text">{{ t('components.uiTextBox-type.label') || 'Type' }}</div><SelectBox id="uiTextBox-type" v-model="form.type" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiTextBox-align.label') || 'Align' }}</div><SelectBox id="uiTextBox-align" v-model="form.align" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiTextBox-text.label') || 'Text' }}</div><TextBox id="uiTextBox-text" v-model="form.text" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.uiTextBox-maxLength.label') || 'Max Length' }}</div
			><NumberBox id="uiTextBox-maxLength" v-model="form.maxLength" min="1" max="100" @input="onParamInput"></NumberBox>
			<div class="text">{{ t('components.uiTextBox-number.label') || 'Number' }}</div><NumberBox id="uiTextBox-number" v-model="form.number" @input="onParamInput"></NumberBox>
			<div class="text">{{ t('components.uiTextBox-min.label') || 'Min' }}</div
			><NumberBox
				id="uiTextBox-min"
				v-model="form.min"
				min="-1000000000"
				max="1000000000"
				decimals="10" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-max.label') || 'Max' }}</div
			><NumberBox
				id="uiTextBox-max"
				v-model="form.max"
				min="-1000000000"
				max="1000000000"
				decimals="10" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-decimals.label') || 'Decimal Places' }}</div
			><NumberBox id="uiTextBox-decimals" v-model="form.decimals" min="0" max="10" @input="onParamInput"></NumberBox>
			<div class="text">{{ t('components.uiTextBox-padding.label') || 'Padding' }}</div
			><NumberBox
				id="uiTextBox-padding"
				v-model="form.padding"
				min="0"
				max="100"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-size.label') || 'Size' }}</div
			><NumberBox
				id="uiTextBox-size"
				v-model="form.size"
				min="10"
				max="400"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-font.label') || 'Font' }}</div><TextBox id="uiTextBox-font" v-model="form.font" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.uiTextBox-color.label') || 'Text Color' }}</div><ColorBox id="uiTextBox-color" v-model="form.color" @input="onParamInput"></ColorBox>
			<div class="text">{{ t('components.uiTextBox-selectionColor.label') || 'Selection Color' }}</div
			><ColorBox id="uiTextBox-selectionColor" v-model="form.selectionColor" @input="onParamInput"></ColorBox>
			<div class="text">{{ t('components.uiTextBox-selectionBgColor.label') || 'Selection Bg Color' }}</div
			><ColorBox id="uiTextBox-selectionBgColor" v-model="form.selectionBgColor" @input="onParamInput"></ColorBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUITextBoxPage } from '@app/composables/useUITextBoxPage';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useUITextBoxPage();

const loadItems = (id: string, items: { name: string; value: string }[]) => {
	const el = document.getElementById(id) as unknown as { loadItems?: (items: { name: string; value: string }[]) => void } | null;
	el?.loadItems?.(items);
};

const relate = (id: string, config: { case: string | string[]; targets: (HTMLElement | null)[] }[]) => {
	const el = document.getElementById(id) as unknown as { enableHiddenMode?: () => { relate: (config: { case: string | string[]; targets: (HTMLElement | null)[] }[]) => void } } | null;
	if (el) el.enableHiddenMode()?.relate(config);
};

onMounted(() => {
	const uiTextBox = Inspector.uiTextBox;
	if (!uiTextBox) return;

	loadItems('uiTextBox-type', [
		{ name: 'Text', value: 'text' },
		{ name: 'Number', value: 'number' }
	]);
	loadItems('uiTextBox-align', [
		{ name: 'Left', value: 'left' },
		{ name: 'Center', value: 'center' },
		{ name: 'Right', value: 'right' }
	]);
	relate('uiTextBox-type', [
		{ case: 'text', targets: [document.getElementById('uiTextBox-text'), document.getElementById('uiTextBox-maxLength')] },
		{ case: 'number', targets: [
			document.getElementById('uiTextBox-number'),
			document.getElementById('uiTextBox-min'),
			document.getElementById('uiTextBox-max'),
			document.getElementById('uiTextBox-decimals')
		]}
	]);

	const elements = document.querySelectorAll(`#uiTextBox-type, #uiTextBox-align, #uiTextBox-text,
    #uiTextBox-maxLength, #uiTextBox-number, #uiTextBox-min, #uiTextBox-max,
    #uiTextBox-decimals, #uiTextBox-padding, #uiTextBox-size, #uiTextBox-font,
    #uiTextBox-color, #uiTextBox-selectionColor, #uiTextBox-selectionBgColor`);
	(elements as unknown as HTMLElement[]).forEach((el) =>
		el.addEventListener('focus', Inspector.inputFocus)
	);
	if (Inspector.inputBlur) {
		(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
			el.addEventListener('blur', Inspector.inputBlur!(uiTextBox, UI))
		);
	}

	const el = document.getElementById('uiTextBox-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
