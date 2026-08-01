<template>
	<window-frame id="itemGetter">
		<title-bar>Actor<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="itemGetter-type" /> <text>Actor</text
				><custom-box id="itemGetter-actor" type="actor" /> <text>Shortcut Key</text
				><select-var id="itemGetter-key" /> <text>Item</text
				><custom-box id="itemGetter-itemId" type="file" filter="item" />
				<text>Variable</text
				><custom-box id="itemGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="itemGetter-confirm" name="confirm">Confirm</button>
			<button id="itemGetter-cancel" name="cancel">Cancel</button>
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
