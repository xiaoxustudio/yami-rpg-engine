<template>
	<WindowFrame id="unclampCamera">
		<template #title
			><TitleBar
				>Unclamp Camera
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

commandCases.unclampCamera = new CommandSchema({
	name: 'unclampCamera',
	noWindow: true,
	customParse() {
		return [{ color: 'scene' }, { text: t('command.unclampCamera') }];
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
