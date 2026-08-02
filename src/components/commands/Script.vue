<template>
	<WindowFrame id="script">
		<TitleBar
			>Script<text id="script-mark" class="hidden">✱</text>
			<button id="script-change" name="script-change-ts">切换为TS</button>
			<div class="maximize" id="script-maximize" />
			<div class="close" />
		</TitleBar>
		<content-frame>
			<box id="script-script"> </box>
			<button id="script-confirm" name="confirm">Confirm</button>
			<button id="script-cancel" name="cancel">Cancel</button>
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
