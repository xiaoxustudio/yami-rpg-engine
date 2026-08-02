<template>
	<WindowFrame id="edit-data">
		<TitleBar
			>edit data<text id="edit-data-mark" class="hidden">✱</text>
			<maximize id="edit-data-maximize" />
			<close />
		</TitleBar>
		<content-frame>
			<box id="edit-data-current"> </box>
			<button id="edit-data-confirm" name="confirm">Confirm</button>
			<button id="edit-data-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
