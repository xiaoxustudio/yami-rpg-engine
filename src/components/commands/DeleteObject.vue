<template>
	<window-frame id="deleteObject">
		<title-bar>Delete Object<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Object</text><custom-box id="deleteObject-object" type="object" />
			</grid-box>
			<button id="deleteObject-confirm" name="confirm">Confirm</button>
			<button id="deleteObject-cancel" name="cancel">Cancel</button>
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
