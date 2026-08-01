<template>
	<window-frame id="fontSize">
		<title-bar>Set Font Size<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Size</text
				><number-box id="fontSize-size" min="10" max="400" unit="px" />
			</grid-box>
			<button id="fontSize-confirm" name="confirm">Confirm</button>
			<button id="fontSize-cancel" name="cancel">Cancel</button>
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
