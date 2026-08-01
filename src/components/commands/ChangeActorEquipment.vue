<template>
<window-frame id="changeActorEquipment">
	<title-bar>Change Actor Equipment<close /></title-bar>
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
</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
