<template>
	<window-frame id="lightGetter">
		<title-bar>Light<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="lightGetter-type" /> <text>Light</text
				><custom-box id="lightGetter-presetId" type="preset-object" filter="light" />
				<text>Variable</text
				><custom-box id="lightGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="lightGetter-confirm" name="confirm">Confirm</button>
			<button id="lightGetter-cancel" name="cancel">Cancel</button>
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
