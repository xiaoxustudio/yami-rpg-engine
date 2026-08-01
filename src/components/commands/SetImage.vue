<template>
	<window-frame id="setImage">
		<title-bar>Set Image<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="setImage-element" type="element" />
				<text>Properties</text><param-list id="setImage-properties" />
			</grid-box>
			<button id="setImage-confirm" name="confirm">Confirm</button>
			<button id="setImage-cancel" name="cancel">Cancel</button>
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
