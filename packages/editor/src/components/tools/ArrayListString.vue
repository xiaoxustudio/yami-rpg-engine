<template>
	<WindowFrame id="arrayList-string">
		<TitleBar>String<div class="close" /></TitleBar>
		<div class="content-frame">
			<TextArea id="arrayList-string-value" />
			<button id="arrayList-string-confirm" name="confirm">Confirm</button>
			<button id="arrayList-string-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextArea from '@app/components/common/TextArea.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
