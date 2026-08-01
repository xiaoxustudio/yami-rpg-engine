<template>
		<window-frame id="regionGetter">
		<title-bar>Region<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="regionGetter-type" /> <text>Region</text
				><custom-box
					id="regionGetter-presetId"
					type="preset-object"
					filter="region"
				/>
			</grid-box>
			<button id="regionGetter-confirm" name="confirm">Confirm</button>
			<button id="regionGetter-cancel" name="cancel">Cancel</button>
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
