<template>
<WindowFrame id="wait">
	<TitleBar>Wait<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Duration</text
			><NumberVar id="wait-duration" min="1" max="3600000" unit="ms" />
		</div>
		<button id="wait-confirm" name="confirm">Confirm</button>
		<button id="wait-cancel" name="cancel">Cancel</button>
	</div>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberVar from '@app/components/common/NumberVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
