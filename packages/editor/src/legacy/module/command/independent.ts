import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.independent = new CommandSchema({
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
