import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.break = new CommandSchema({
	name: 'break',
	noWindow: true,
	customParse() {
		return [{ color: 'flow' }, { text: t('command.break') }];
	},
	customSave() {
		Command.save({});
	}
});
