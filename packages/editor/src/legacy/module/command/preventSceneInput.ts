import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.preventSceneInput = new CommandSchema({
	name: 'preventSceneInput',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: t('command.preventSceneInput') }];
	},
	customSave() {
		Command.save({});
	}
});
