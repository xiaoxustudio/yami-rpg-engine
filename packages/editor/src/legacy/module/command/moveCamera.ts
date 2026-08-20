import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.moveCamera = new CommandSchema({
	name: 'moveCamera',
	fields: [
		{ key: 'mode', default: 'position' },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		mode,
		position,
		actor,
		easingId,
		duration,
		wait
	}: {
		mode: string;
		position: unknown;
		actor: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words.push(t('command.moveCamera.' + mode));
		switch (mode) {
			case 'position':
				words.push(Command.parsePosition!(position));
				break;
			case 'actor':
				words.push(Command.parseActor!(actor));
				break;
		}
		words.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: t('command.moveCamera') + Token(': ') },
			{ text: words.join() }
		];
	}
});
