import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.changeActorSprite = new CommandSchema({
	name: 'changeActorSprite',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'spriteId', default: '', required: true },
		{ key: 'image', default: '' }
	],
	customParse({
		actor,
		animationId,
		spriteId,
		image
	}: {
		actor: unknown;
		animationId: unknown;
		spriteId: unknown;
		image: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseFileName!(animationId))
			.push(Command.parseSpriteName!(animationId, spriteId))
			.push(Command.parseFileName!(image));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.changeActorSprite') + Token(': ') },
			{ text: words.join() }
		];
	}
});
