import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.deleteScene = new CommandSchema({
	name: 'deleteScene',
	noWindow: true,
	customParse() {
		return [{ color: 'scene' }, { text: t('command.deleteScene') }];
	},
	customSave() {
		Command.save({});
	}
});
