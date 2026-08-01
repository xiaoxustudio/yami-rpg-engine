<template>
	<window-frame id="createObject">
		<title-bar>Create Object<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Object</text
				><custom-box id="createObject-presetId" type="preset-object" filter="any" />
				<text>Position</text
				><custom-box id="createObject-position" type="position" />
			</grid-box>
			<button id="createObject-confirm" name="confirm">Confirm</button>
			<button id="createObject-cancel" name="cancel">Cancel</button>
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
