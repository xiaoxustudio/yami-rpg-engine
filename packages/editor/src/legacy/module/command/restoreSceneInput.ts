import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.restoreSceneInput = new CommandSchema({
	name: 'restoreSceneInput',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: t('command.restoreSceneInput') }];
	},
	customSave() {
		Command.save({});
	}
});
