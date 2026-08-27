<template>
	<WindowFrame id="preventSceneInput">
		<template #title
			><TitleBar
				>Prevent Scene Input
				<div class="close" /></TitleBar
		></template>
	</WindowFrame>
</template>

<script lang="ts">
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { commandCases } from '@app/commands/command-registry.ts';
import { t } from '@app/i18n';

commandCases.preventSceneInput = new CommandSchema({
	name: 'preventSceneInput',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: t('command.preventSceneInput') }];
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
