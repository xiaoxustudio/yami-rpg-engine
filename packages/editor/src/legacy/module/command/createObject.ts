import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.createObject = new CommandSchema({
	name: 'createObject',
	fields: [
		{ key: 'presetId', default: '', required: true },
		{
			key: 'position',
			default: { type: 'actor', actor: { type: 'trigger' } }
		}
	],
	customParse({ presetId, position }: { presetId: unknown; position: unknown }) {
		const words = Command.words
			.push(Command.parsePresetObject(presetId))
			.push(Command.parsePosition(position));
		return [
			{ color: 'object' },
			{ text: t('command.createObject') + Token(': ') },
			{ text: words.join() }
		];
	}
});
