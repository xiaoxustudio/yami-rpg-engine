<template>
<WindowFrame id="changeActorEquipment">
	<TitleBar>Change Actor Equipment<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="changeActorEquipment-actor" type="actor" /><text>Operation</text><SelectBox id="changeActorEquipment-operation" /><text>Shortcut Key</text><SelectVar id="changeActorEquipment-slot" /><text>Equipment</text
			><CustomBox
				id="changeActorEquipment-equipmentId"
				type="file"
				filter="equipment"
			 /><text>Equipment</text
			><CustomBox id="changeActorEquipment-equipment" type="equipment" /></grid-box>
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
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
