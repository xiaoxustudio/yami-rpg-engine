<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiTextBox-properties-grid') || 'TextBox Properties' }}</DetailSummary>
		<detail-grid id="uiTextBox-properties-grid">
			<text>{{ local.getLabel('uiTextBox-type') || 'Type' }}</text><SelectBox id="uiTextBox-type"></SelectBox>
			<text>{{ local.getLabel('uiTextBox-align') || 'Align' }}</text><SelectBox id="uiTextBox-align"></SelectBox>
			<text>{{ local.getLabel('uiTextBox-text') || 'Text' }}</text><TextBox id="uiTextBox-text"></TextBox>
			<text>{{ local.getLabel('uiTextBox-maxLength') || 'Max Length' }}</text
			><NumberBox id="uiTextBox-maxLength" min="1" max="100"></NumberBox>
			<text>{{ local.getLabel('uiTextBox-number') || 'Number' }}</text><NumberBox id="uiTextBox-number"></NumberBox>
			<text>{{ local.getLabel('uiTextBox-min') || 'Min' }}</text
			><NumberBox
				id="uiTextBox-min"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			></NumberBox>
			<text>{{ local.getLabel('uiTextBox-max') || 'Max' }}</text
			><NumberBox
				id="uiTextBox-max"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			></NumberBox>
			<text>{{ local.getLabel('uiTextBox-decimals') || 'Decimal Places' }}</text
			><NumberBox id="uiTextBox-decimals" min="0" max="10"></NumberBox>
			<text>{{ local.getLabel('uiTextBox-padding') || 'Padding' }}</text
			><NumberBox
				id="uiTextBox-padding"
				min="0"
				max="100"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiTextBox-size') || 'Size' }}</text
			><NumberBox
				id="uiTextBox-size"
				min="10"
				max="400"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiTextBox-font') || 'Font' }}</text><TextBox id="uiTextBox-font"></TextBox>
			<text>{{ local.getLabel('uiTextBox-color') || 'Text Color' }}</text><ColorBox id="uiTextBox-color"></ColorBox>
			<text>{{ local.getLabel('uiTextBox-selectionColor') || 'Selection Color' }}</text
			><ColorBox id="uiTextBox-selectionColor"></ColorBox>
			<text>{{ local.getLabel('uiTextBox-selectionBgColor') || 'Selection Bg Color' }}</text
			><ColorBox id="uiTextBox-selectionBgColor"></ColorBox>
		</detail-grid>
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
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
