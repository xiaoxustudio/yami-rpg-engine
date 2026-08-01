<template>
	<window-frame id="setAnimation">
		<title-bar>Set Animation<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="setAnimation-element" type="element" />
				<text>Properties</text><param-list id="setAnimation-properties" />
			</grid-box>
			<button id="setAnimation-confirm" name="confirm">Confirm</button>
			<button id="setAnimation-cancel" name="cancel">Cancel</button>
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
