import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
			.push(t('command.getMultipleActors.' + area));
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
		words.push(t('command.getMultipleActors.' + activation));
		return [
			{ color: 'actor' },
			{ text: t('command.getMultipleActors') + Token(': ') },
			{ text: actors + Token(' = ') + words.join() }
		];
	}
});
