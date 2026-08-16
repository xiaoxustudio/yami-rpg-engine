import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.getMultipleActors = new CommandSchema({
	name: 'getMultipleActors',
	fields: [
		{ key: 'variable', default: { type: 'local', key: '' } },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } },
		{ key: 'area', default: 'rectangle' },
		{ key: 'width', default: 1 },
		{ key: 'height', default: 1 },
		{ key: 'radius', default: 0.5 },
		{ key: 'selector', default: 'enemy' },
		{ key: 'teamId', default: () => Data.teams.list[0].id },
		{ key: 'activation', default: 'active' }
	],
	customParse({
		variable,
		position,
		area,
		width,
		height,
		radius,
		selector,
		teamId,
		activation
	}: {
		variable: unknown;
		position: unknown;
		area: string;
		width: unknown;
		height: unknown;
		radius: unknown;
		selector: string;
		teamId: unknown;
		activation: string;
	}) {
		const actors = Command.parseVariable!(variable, 'object', true);
		const words = Command.words
			.push(Command.parsePosition!(position))
			.push(Local.get!('command.getMultipleActors.' + area));
		switch (area) {
			case 'rectangle':
				words.push(Command.parseVariableNumber!(width, 't'));
				words.push(Command.parseVariableNumber!(height, 't'));
				break;
			case 'circle':
				words.push(Command.parseVariableNumber!(radius, 't'));
				break;
		}
		const selectorLabel = Command.parseActorSelector!(selector);
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				words.push(
					selectorLabel + Token('(') + Command.parseVariableTeam!(teamId) + Token(')')
				);
				break;
			case 'any':
				words.push(selectorLabel);
				break;
		}
		words.push(Local.get!('command.getMultipleActors.' + activation));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.getMultipleActors') + Token(': ') },
			{ text: actors + Token(' = ') + words.join() }
		];
	}
});
