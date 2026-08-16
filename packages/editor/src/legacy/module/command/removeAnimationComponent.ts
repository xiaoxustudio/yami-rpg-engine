import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
				text: Local.get!('command.removeAnimationComponent') + Token(': ')
			},
			{ text: words.join() }
		];
	}
});
