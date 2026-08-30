<template>
	<WindowFrame id="continueGame">
		<template #title
			><TitleBar
				>Continue Game
				<div class="close" /></TitleBar
		></template>
	</WindowFrame>
</template>

<script lang="ts">
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { commandCases } from '@app/commands/command-registry.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

commandCases.continueGame = new CommandSchema({
	name: 'continueGame',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: t('command.continueGame') }];
	},
	customSave() {
		Command.save({});
	}
});
</script>

<script setup lang="ts">
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
</script>
