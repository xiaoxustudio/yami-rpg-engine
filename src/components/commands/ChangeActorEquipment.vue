<template>
<WindowFrame id="changeActorEquipment">
	<TitleBar>Change Actor Equipment<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="changeActorEquipment-actor" type="actor" /><text>Operation</text><select-box id="changeActorEquipment-operation" /><text>Shortcut Key</text><select-var id="changeActorEquipment-slot" /><text>Equipment</text
			><custom-box
				id="changeActorEquipment-equipmentId"
				type="file"
				filter="equipment"
			 /><text>Equipment</text
			><custom-box id="changeActorEquipment-equipment" type="equipment" /></grid-box>
		<button id="changeActorEquipment-confirm" name="confirm">Confirm</button>
		<button id="changeActorEquipment-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
