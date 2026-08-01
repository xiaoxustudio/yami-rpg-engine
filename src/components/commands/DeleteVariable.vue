<template>
	<window-frame id="deleteVariable">
		<title-bar>Delete Variable<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><custom-box
					id="deleteVariable-variable"
					type="variable"
					filter="deletable"
				/>
			</grid-box>
			<button id="deleteVariable-confirm" name="confirm">Confirm</button>
			<button id="deleteVariable-cancel" name="cancel">Cancel</button>
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
