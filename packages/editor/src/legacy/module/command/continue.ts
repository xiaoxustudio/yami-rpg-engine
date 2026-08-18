import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.continue = new CommandSchema({
	name: 'continue',
	noWindow: true,
	customParse() {
		return [{ color: 'flow' }, { text: t('command.continue') }];
	},
	customSave() {
		Command.save({});
	}
});
