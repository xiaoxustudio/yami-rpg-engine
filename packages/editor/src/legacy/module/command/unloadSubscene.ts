import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.unloadSubscene = new CommandSchema({
	name: 'unloadSubscene',
	fields: [{ key: 'sceneId', default: '', required: true }],
	customParse({ sceneId }: { sceneId: unknown }) {
		return [
			{ color: 'scene' },
			{ text: t('command.unloadSubscene') + Token(': ') },
			{ text: Command.parseVariableFile(sceneId) }
		];
	}
});
