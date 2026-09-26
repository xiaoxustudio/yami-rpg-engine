<template>
	<WindowFrame
		id="command-widget"
		:ref="registryRef(commandSuggestionEls, 'command-widget')"
		no-buttons
	>
		<div class="text" id="command-searcher-mark">&gt;</div>
		<TextBox
			id="command-searcher"
			:ref="registryRef(commandSuggestionEls, 'command-searcher')"
		/>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { commandSuggestionEls } from '@app/commands/command-tip';
import { registryRef } from '@app/utils/element-registry';

onMounted(() => {});
</script>

<style>
#command-widget {
	width: 400px;
	height: 20px;
	box-shadow: none;
	outline: none;
	/* outline-color: var(--input-border-color-focus); */
}
</style>
