<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiTextBox-properties-grid') || 'TextBox Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiTextBox-properties-grid">
			<div class="text">{{ local.getLabel('uiTextBox-type') || 'Type' }}</div><SelectBox id="uiTextBox-type" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiTextBox-align') || 'Align' }}</div><SelectBox id="uiTextBox-align" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiTextBox-text') || 'Text' }}</div><TextBox id="uiTextBox-text" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('uiTextBox-maxLength') || 'Max Length' }}</div
			><NumberBox id="uiTextBox-maxLength" min="1" max="100" @input="onParamInput"></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-number') || 'Number' }}</div><NumberBox id="uiTextBox-number" @input="onParamInput"></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-min') || 'Min' }}</div
			><NumberBox
				id="uiTextBox-min"
				min="-1000000000"
				max="1000000000"
				decimals="10" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-max') || 'Max' }}</div
			><NumberBox
				id="uiTextBox-max"
				min="-1000000000"
				max="1000000000"
				decimals="10" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-decimals') || 'Decimal Places' }}</div
			><NumberBox id="uiTextBox-decimals" min="0" max="10" @input="onParamInput"></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-padding') || 'Padding' }}</div
			><NumberBox
				id="uiTextBox-padding"
				min="0"
				max="100"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-size') || 'Size' }}</div
			><NumberBox
				id="uiTextBox-size"
				min="10"
				max="400"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiTextBox-font') || 'Font' }}</div><TextBox id="uiTextBox-font" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('uiTextBox-color') || 'Text Color' }}</div><ColorBox id="uiTextBox-color" @input="onParamInput"></ColorBox>
			<div class="text">{{ local.getLabel('uiTextBox-selectionColor') || 'Selection Color' }}</div
			><ColorBox id="uiTextBox-selectionColor" @input="onParamInput"></ColorBox>
			<div class="text">{{ local.getLabel('uiTextBox-selectionBgColor') || 'Selection Bg Color' }}</div
			><ColorBox id="uiTextBox-selectionBgColor" @input="onParamInput"></ColorBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const ui = useUIStore();
const onParamInput = (event: any) => {
	const target = event?.target ?? document.activeElement;
	(window as any).Inspector?.uiElement?.paramInput?.({ target });
};

const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
