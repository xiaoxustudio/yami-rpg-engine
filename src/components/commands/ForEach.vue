<template>
<window-frame id="forEach">
	<title-bar>For Each<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Data</text><select-box id="forEach-data" /> <text>List Variable</text
			><custom-box id="forEach-list" type="variable" filter="object" />
			<text>Actor</text><custom-box id="forEach-actor" type="actor" />
			<text>Parent Element</text><custom-box id="forEach-element" type="element" />
			<text>Attribute Group</text
			><custom-box id="forEach-attribute-groupId" type="attribute-group" />
			<text>Enum Group</text
			><custom-box id="forEach-enum-groupId" type="enum-group" />
			<text>Write to Variable</text
			><custom-box id="forEach-variable" type="variable" filter="object" />
			<text>Write Save Index</text
			><custom-box id="forEach-saveIndex" type="variable" filter="number" />
			<text>Touch Id</text
			><custom-box id="forEach-touchId" type="variable" filter="number" />
		</grid-box>
		<button id="forEach-confirm" name="confirm">Confirm</button>
		<button id="forEach-cancel" name="cancel">Cancel</button>
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
