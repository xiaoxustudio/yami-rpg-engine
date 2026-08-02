<template>
<WindowFrame id="if">
	<TitleBar>If<close /></TitleBar>
	<content-frame>
		<grid-box> <text>Branches</text><param-list id="if-branches" /> </grid-box>
		<check-box id="if-else" class="standard"><text id="if-else-label">Else</text></check-box>
		<button id="if-confirm" name="confirm">Confirm</button>
		<button id="if-cancel" name="cancel">Cancel</button>
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
