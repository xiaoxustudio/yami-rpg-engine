import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.pauseGame = new CommandSchema({
	name: 'pauseGame',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: t('command.pauseGame') }];
	},
	customSave() {
		Command.save({});
	}
});
