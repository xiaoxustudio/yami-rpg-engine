<template>
	<WindowFrame id="deleteScene">
		<template #title><TitleBar>Delete Scene<div class="close" /></TitleBar></template>
		
		
	</WindowFrame>
</template>

<script lang="ts">
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { commandCases } from '@app/commands/command-registry.ts';
import { t } from '@app/i18n';

commandCases.deleteScene = new CommandSchema({
	name: 'deleteScene',
	noWindow: true,
	customParse() {
		return [{ color: 'scene' }, { text: t('command.deleteScene') }];
	},
	customSave() {
		Command.save({});
	}
});
</script>

<script setup lang="ts">
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useLocalStore } from '@app/stores/local';
</script>
