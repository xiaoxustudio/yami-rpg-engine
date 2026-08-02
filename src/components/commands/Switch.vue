<template>
<WindowFrame id="switch">
	<TitleBar>Switch<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Variable</text
			><custom-box id="switch-variable" type="variable" filter="all" />
			<text>Branches</text><param-list id="switch-branches" />
		</grid-box>
		<check-box id="switch-default" class="standard"
			><text id="switch-default-label">Default</text></check-box
		>
		<button id="switch-confirm" name="confirm">Confirm</button>
		<button id="switch-cancel" name="cancel">Cancel</button>
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
