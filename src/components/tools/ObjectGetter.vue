<template>
		<window-frame id="objectGetter">
		<title-bar>Scene Object<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="objectGetter-type" /> <text>Object</text
				><custom-box id="objectGetter-presetId" type="preset-object" filter="any" />
				<text>Variable</text
				><custom-box id="objectGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="objectGetter-confirm" name="confirm">Confirm</button>
			<button id="objectGetter-cancel" name="cancel">Cancel</button>
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
