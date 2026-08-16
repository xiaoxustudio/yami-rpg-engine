import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.createTrigger = new CommandSchema({
	name: 'createTrigger',
	fields: [
		{ key: 'triggerId', default: '' },
		{ key: 'caster', default: { type: 'trigger' } },
		{ key: 'origin', default: { type: 'actor', actor: { type: 'trigger' } } },
		{ key: 'angle', default: { type: 'direction', degrees: 0 } },
		{ key: 'distance', default: 0 },
		{ key: 'scale', default: 1 },
		{ key: 'timeScale', default: 1 }
	],
	customParse({
		triggerId,
		caster,
		origin,
		angle,
		distance,
		scale,
		timeScale
	}: {
		triggerId: unknown;
		caster: unknown;
		origin: unknown;
		angle: unknown;
		distance: unknown;
		scale: unknown;
		timeScale: unknown;
	}) {
		const casterName = Command.parseActor!(caster);
		const originName = Command.parsePosition!(origin);
		const words = Command.words
			.push(Command.parseVariableFile!(triggerId))
			.push(casterName)
			.push(originName.indexOf(casterName) === -1 ? originName : '')
			.push(Command.parseAngle!(angle))
			.push(Command.parseVariableNumber!(distance, 't'))
			.push(Command.parseVariableNumber!(scale))
			.push(Command.parseVariableNumber!(timeScale));
		return [
			{ color: 'skill' },
			{ text: Local.get!('command.createTrigger') + Token(': ') },
			{ text: words.join() }
		];
	}
});
