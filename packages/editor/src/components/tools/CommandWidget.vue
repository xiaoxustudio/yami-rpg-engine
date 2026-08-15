<template>
	<WindowFrame id="command-widget" no-buttons>
		<div class="text" id="command-searcher-mark">&gt;</div>
		<TextBox id="command-searcher" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
