<template>
	<WindowFrame id="relaunchApp">
		<template #title
			><TitleBar
				>Relaunch App
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

commandCases.relaunchApp = new CommandSchema({
	name: 'relaunchApp',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: t('command.relaunchApp') }];
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
