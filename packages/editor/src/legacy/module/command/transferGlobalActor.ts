import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.transferGlobalActor = new CommandSchema({
	name: 'transferGlobalActor',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } }
	],
	customParse({ actor, position }: { actor: unknown; position: unknown }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parsePosition(position));
		return [
			{ color: 'actor' },
			{ text: t('command.transferGlobalActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});
