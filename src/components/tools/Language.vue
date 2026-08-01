<template>
	<window-frame id="language">
		<title-bar>Language<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Name</text><select-box id="language-name" /> <text>Font</text
				><custom-box id="language-font" type="file" filter="font" />
				<text>Font Size Scaling</text
				><number-box id="language-scale" min="0.5" max="2" decimals="10" />
			</grid-box>
			<button id="language-confirm" name="confirm">Confirm</button>
			<button id="language-cancel" name="cancel">Cancel</button>
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
