<template>
<WindowFrame id="transferGlobalActor">
	<TitleBar>Transfer Global Actor<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="transferGlobalActor-actor" type="actor" />
			<text>Position</text
			><CustomBox id="transferGlobalActor-position" type="position" />
		</grid-box>
		<button id="transferGlobalActor-confirm" name="confirm">Confirm</button>
		<button id="transferGlobalActor-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
