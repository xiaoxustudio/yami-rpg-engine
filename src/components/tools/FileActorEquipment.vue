<template>
	<window-frame id="fileActor-equipment">
		<title-bar>Equipment<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Equipment</text
				><custom-box id="fileActor-equipment-id" type="file" filter="equipment" />
				<text>Slot</text><select-box id="fileActor-equipment-slot" />
			</grid-box>
			<button id="fileActor-equipment-confirm" name="confirm">Confirm</button>
			<button id="fileActor-equipment-cancel" name="cancel">Cancel</button>
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
