<template>
<WindowFrame id="stopAudio">
	<TitleBar>Stop Audio<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box"> <div class="text">Type</div><SelectBox id="stopAudio-type" /> </div>
		<button id="stopAudio-confirm" name="confirm">Confirm</button>
		<button id="stopAudio-cancel" name="cancel">Cancel</button>
	</div>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
