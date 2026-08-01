<template>
		<window-frame id="object-attribute">
		<title-bar>Attribute<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Key</text><select-box id="object-attribute-key" /> <text>Boolean</text
				><select-box id="object-attribute-boolean-value" /> <text>Number</text
				><number-box
					id="object-attribute-number-value"
					min="-1000000000"
					max="1000000000"
					decimals="6"
				/>
				<text>String</text
				><text-area id="object-attribute-string-value" menu="tag-localization" />
				<text>Option</text><select-box id="object-attribute-enum-value" />
			</grid-box>
			<button id="object-attribute-confirm" name="confirm">Confirm</button>
			<button id="object-attribute-cancel" name="cancel">Cancel</button>
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
