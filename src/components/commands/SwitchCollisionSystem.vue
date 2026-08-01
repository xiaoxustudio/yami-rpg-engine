<template>
	<window-frame id="switchCollisionSystem">
		<title-bar>Switch Collision System<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="switchCollisionSystem-operation" />
			</grid-box>
			<button id="switchCollisionSystem-confirm" name="confirm">Confirm</button>
			<button id="switchCollisionSystem-cancel" name="cancel">Cancel</button>
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
