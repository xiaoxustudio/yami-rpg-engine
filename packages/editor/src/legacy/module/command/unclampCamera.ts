import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.unclampCamera = new CommandSchema({
	name: 'unclampCamera',
	noWindow: true,
	customParse() {
		return [{ color: 'scene' }, { text: t('command.unclampCamera') }];
	},
	customSave() {
		Command.save({});
	}
});
