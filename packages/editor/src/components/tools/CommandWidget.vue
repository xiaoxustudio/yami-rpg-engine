<template>
	<WindowFrame id="command-widget" no-buttons>
		<div class="text" id="command-searcher-mark">&gt;</div>
		<TextBox id="command-searcher" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TextBox from '@app/components/common/TextBox.vue';

onMounted(() => {});
</script>
