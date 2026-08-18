import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.removeAnimationComponent = new CommandSchema({
	name: 'removeAnimationComponent',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'motion', default: '', required: true }
	],
	customParse({
		actor,
		animationId,
		motion
	}: {
		actor: unknown;
		animationId: unknown;
		motion: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseFileName!(animationId))
			.push(Command.parseEnumString!(motion));
		return [
			{ color: 'actor' },
			{
				text: t('command.removeAnimationComponent') + Token(': ')
			},
			{ text: words.join() }
		];
	}
});
