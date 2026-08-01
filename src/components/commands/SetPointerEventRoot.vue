<template>
	<window-frame id="setPointerEventRoot">
		<title-bar>Set Pointer Event Root<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="setPointerEventRoot-operation" />
				<text>Element</text
				><custom-box id="setPointerEventRoot-element" type="element" />
			</grid-box>
			<button id="setPointerEventRoot-confirm" name="confirm">Confirm</button>
			<button id="setPointerEventRoot-cancel" name="cancel">Cancel</button>
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
