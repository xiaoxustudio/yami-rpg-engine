<template>
	<WindowFrame id="command-widget" :ref="bind('widget')" no-buttons>
		<div class="text" id="command-searcher-mark">&gt;</div>
		<TextBox :label="'&gt;'" id="command-searcher" :ref="bind('searcher')" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { commandSuggestionNodes } from '@app/composables/suggestion-nodes';

const { bind, dispose } = commandSuggestionNodes.scoped();
onUnmounted(dispose);

onMounted(() => {});
</script>

<style>
#command-widget {
	width: 400px;
	height: 20px;
	box-shadow: none;
	outline: none;
}
</style>
