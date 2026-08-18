import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.deleteGlobalActor = new CommandSchema({
	name: 'deleteGlobalActor',
	fields: [{ key: 'actorId', default: '', required: true }],
	customParse({ actorId }: { actorId: unknown }) {
		const words = Command.words.push(Command.parseFileName(actorId));
		return [
			{ color: 'actor' },
			{ text: t('command.deleteGlobalActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});
