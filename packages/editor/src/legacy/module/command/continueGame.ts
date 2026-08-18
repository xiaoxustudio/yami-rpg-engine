import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.continueGame = new CommandSchema({
	name: 'continueGame',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: t('command.continueGame') }];
	},
	customSave() {
		Command.save({});
	}
});
