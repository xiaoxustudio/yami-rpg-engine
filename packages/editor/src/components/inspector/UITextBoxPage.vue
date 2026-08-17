<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiTextBox-properties-grid') || 'TextBox Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiTextBox-properties-grid">
			<div class="text">{{ local.getLabel('uiTextBox-type') || 'Type' }}</div><SelectBox id="uiTextBox-type" v-model="form.type" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiTextBox-align') || 'Align' }}</div><SelectBox id="uiTextBox-align" v-model="form.align" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiTextBox-text') || 'Text' }}</div><TextBox id="uiTextBox-text" v-model="form.text" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('uiTextBox-maxLength') || 'Max Length' }}</div
			><NumberBox id="uiTextBox-maxLength" v-model="form.maxLength" min="1" max="100" @input="onParamInput"></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-number') || 'Number' }}</div><NumberBox id="uiTextBox-number" v-model="form.number" @input="onParamInput"></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-min') || 'Min' }}</div
			><NumberBox
				id="uiTextBox-min"
				v-model="form.min"
				min="-1000000000"
				max="1000000000"
				decimals="10" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-max') || 'Max' }}</div
			><NumberBox
				id="uiTextBox-max"
				v-model="form.max"
				min="-1000000000"
				max="1000000000"
				decimals="10" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-decimals') || 'Decimal Places' }}</div
			><NumberBox id="uiTextBox-decimals" v-model="form.decimals" min="0" max="10" @input="onParamInput"></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-padding') || 'Padding' }}</div
			><NumberBox
				id="uiTextBox-padding"
				v-model="form.padding"
				min="0"
				max="100"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-size') || 'Size' }}</div
			><NumberBox
				id="uiTextBox-size"
				v-model="form.size"
				min="10"
				max="400"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-font') || 'Font' }}</div><TextBox id="uiTextBox-font" v-model="form.font" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('uiTextBox-color') || 'Text Color' }}</div><ColorBox id="uiTextBox-color" v-model="form.color" @input="onParamInput"></ColorBox>
			<div class="text">{{ local.getLabel('uiTextBox-selectionColor') || 'Selection Color' }}</div
			><ColorBox id="uiTextBox-selectionColor" v-model="form.selectionColor" @input="onParamInput"></ColorBox>
			<div class="text">{{ local.getLabel('uiTextBox-selectionBgColor') || 'Selection Bg Color' }}</div
			><ColorBox id="uiTextBox-selectionBgColor" v-model="form.selectionBgColor" @input="onParamInput"></ColorBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUITextBoxPage } from '@app/composables/useUITextBoxPage';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useUITextBoxPage();

onMounted(() => {
	const el = document.getElementById('uiTextBox-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
