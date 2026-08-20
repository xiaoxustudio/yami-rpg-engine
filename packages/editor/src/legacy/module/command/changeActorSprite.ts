import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
			{ text: t('command.changeActorSprite') + Token(': ') },
			{ text: words.join() }
		];
	}
});
