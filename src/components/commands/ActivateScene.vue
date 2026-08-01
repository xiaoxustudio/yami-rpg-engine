<template>
	<window-frame id="activateScene">
		<title-bar>Activate Scene<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Scene</text><select-box id="activateScene-pointer" />
			</grid-box>
			<button id="activateScene-confirm" name="confirm">Confirm</button>
			<button id="activateScene-cancel" name="cancel">Cancel</button>
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
