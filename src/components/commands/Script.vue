<template>
	<window-frame id="script">
		<title-bar
			>Script<text id="script-mark" class="hidden">✱</text>
			<button id="script-change" name="script-change-ts">切换为TS</button>
			<maximize id="script-maximize" />
			<close />
		</title-bar>
		<content-frame>
			<box id="script-script"> </box>
			<button id="script-confirm" name="confirm">Confirm</button>
			<button id="script-cancel" name="cancel">Cancel</button>
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
