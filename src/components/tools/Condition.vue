<template>
	<WindowFrame id="condition">
		<TitleBar>Condition<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Condition Type</text><select-box id="condition-type" />
				<text>Variable</text
				><custom-box id="condition-key" type="global-variable" filter="all" />
				<text>Operation</text><select-box id="condition-boolean-operation" />
				<text>Boolean</text><select-box id="condition-boolean-value" />
				<text>Operation</text><select-box id="condition-number-operation" />
				<text>Number</text
				><number-box
					id="condition-number-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Operation</text><select-box id="condition-string-operation" />
				<text>String</text><text-area id="condition-string-value" />
			</grid-box>
			<button id="condition-confirm" name="confirm">Confirm</button>
			<button id="condition-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
