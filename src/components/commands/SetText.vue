<template>
	<window-frame id="setText">
		<title-bar>Set Text<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="setText-element" type="element" />
				<text>Properties</text><param-list id="setText-properties" />
			</grid-box>
			<button id="setText-confirm" name="confirm">Confirm</button>
			<button id="setText-cancel" name="cancel">Cancel</button>
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
