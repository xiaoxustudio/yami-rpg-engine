<template>
	<!-- 设置文本框 - 属性 -->
	<window-frame id="setTextBox-property">
		<title-bar>Text Property<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Property</text><select-box id="setTextBox-property-key" />
				<text>Type</text><select-box id="setTextBox-property-type" />
				<text>Text</text><string-var id="setTextBox-property-text" />
				<text>Number</text
				><number-var
					id="setTextBox-property-number"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Min</text
				><number-var
					id="setTextBox-property-min"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Max</text
				><number-var
					id="setTextBox-property-max"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Decimal Places</text
				><number-box id="setTextBox-property-decimals" min="0" max="10" />
				<text>Color</text><color-box id="setTextBox-property-color" />
			</grid-box>
			<button id="setTextBox-property-confirm" name="confirm">Confirm</button>
			<button id="setTextBox-property-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
