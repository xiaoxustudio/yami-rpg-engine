<template>
	<WindowFrame id="independent">
		<template #title
			><TitleBar
				>Independent
				<div class="close" /></TitleBar
		></template>
	</WindowFrame>
</template>

<script lang="ts">
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { commandCases } from '@app/commands/command-registry.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

commandCases.independent = new CommandSchema({
	name: 'independent',
	noWindow: true,
	customParse({ commands }: { commands: unknown }) {
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: t('command.independent') },
			{ children: commands },
			{ text: t('command.independent.end') }
		];
	},
	customSave() {
		Command.save({ commands: [] });
	}
});
</script>

<script setup lang="ts">
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
</script>
