import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.reset = new CommandSchema({
	name: 'reset',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: t('command.reset') }];
	},
	customSave() {
		Command.save({});
	}
});
