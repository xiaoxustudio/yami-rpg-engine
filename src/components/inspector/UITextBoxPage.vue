<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiTextBox-properties-grid') || 'TextBox Properties' }}</DetailSummary>
		<detail-grid id="uiTextBox-properties-grid">
			<text>{{ local.getLabel('uiTextBox-type') || 'Type' }}</text><select-box id="uiTextBox-type"></select-box>
			<text>{{ local.getLabel('uiTextBox-align') || 'Align' }}</text><select-box id="uiTextBox-align"></select-box>
			<text>{{ local.getLabel('uiTextBox-text') || 'Text' }}</text><text-box id="uiTextBox-text"></text-box>
			<text>{{ local.getLabel('uiTextBox-maxLength') || 'Max Length' }}</text
			><number-box id="uiTextBox-maxLength" min="1" max="100"></number-box>
			<text>{{ local.getLabel('uiTextBox-number') || 'Number' }}</text><number-box id="uiTextBox-number"></number-box>
			<text>{{ local.getLabel('uiTextBox-min') || 'Min' }}</text
			><number-box
				id="uiTextBox-min"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			></number-box>
			<text>{{ local.getLabel('uiTextBox-max') || 'Max' }}</text
			><number-box
				id="uiTextBox-max"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			></number-box>
			<text>{{ local.getLabel('uiTextBox-decimals') || 'Decimal Places' }}</text
			><number-box id="uiTextBox-decimals" min="0" max="10"></number-box>
			<text>{{ local.getLabel('uiTextBox-padding') || 'Padding' }}</text
			><number-box
				id="uiTextBox-padding"
				min="0"
				max="100"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiTextBox-size') || 'Size' }}</text
			><number-box
				id="uiTextBox-size"
				min="10"
				max="400"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiTextBox-font') || 'Font' }}</text><text-box id="uiTextBox-font"></text-box>
			<text>{{ local.getLabel('uiTextBox-color') || 'Text Color' }}</text><color-box id="uiTextBox-color"></color-box>
			<text>{{ local.getLabel('uiTextBox-selectionColor') || 'Selection Color' }}</text
			><color-box id="uiTextBox-selectionColor"></color-box>
			<text>{{ local.getLabel('uiTextBox-selectionBgColor') || 'Selection Bg Color' }}</text
			><color-box id="uiTextBox-selectionBgColor"></color-box>
		</detail-grid>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
