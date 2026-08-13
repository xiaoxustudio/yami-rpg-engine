import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.getMultipleActors = new CommandSchema({
	name: 'getMultipleActors',
	onInitialize() {
		$('#getMultipleActors-area').loadItems([
			{ name: 'Rectangle', value: 'rectangle' },
			{ name: 'Circle', value: 'circle' }
		]);
		$('#getMultipleActors-area')
			.enableHiddenMode()
			.relate([
				{
					case: 'rectangle',
					targets: [$('#getMultipleActors-width'), $('#getMultipleActors-height')]
				},
				{ case: 'circle', targets: [$('#getMultipleActors-radius')] }
			]);
		$('#getMultipleActors-selector').loadItems([
			{ name: 'Team Enemy', value: 'enemy' },
			{ name: 'Team Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Any', value: 'any' }
		]);
		$('#getMultipleActors-selector')
			.enableHiddenMode()
			.relate([
				{
					case: ['enemy', 'friend', 'team'],
					targets: [$('#getMultipleActors-teamId')]
				}
			]);
		$('#getMultipleActors-activation').loadItems([
			{ name: 'Active', value: 'active' },
			{ name: 'Inactive', value: 'inactive' },
			{ name: 'Either', value: 'either' }
		]);
		$('#getMultipleActors').on('open', function (event: Event) {
			const items = Data.createTeamItems!();
			$('#getMultipleActors-teamId').loadItems(items);
		});
		$('#getMultipleActors').on('closed', function (event: Event) {
			clear($('#getMultipleActors-teamId'));
		});
	},
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
	},
	customLoad({
		variable = { type: 'local', key: '' },
		position = { type: 'absolute', x: 0, y: 0 },
		area = 'rectangle',
		width = 1,
		height = 1,
		radius = 0.5,
		selector = 'enemy',
		teamId = Data.teams.list[0].id,
		activation = 'active'
	}) {
		const write = getElementWriter('getMultipleActors');
		write('variable', variable);
		write('position', position);
		write('area', area);
		write('width', width);
		write('height', height);
		write('radius', radius);
		write('selector', selector);
		write('teamId', teamId);
		write('activation', activation);
		getFocus($('#getMultipleActors-variable'));
	},
	customSave() {
		const read = getElementReader('getMultipleActors');
		const variable = read('variable');
		if (VariableGetter.isNone!(variable)) {
			return getFocus($('#getMultipleActors-variable'));
		}
		const position = read('position');
		const area = read('area');
		const width = read('width');
		const height = read('height');
		const radius = read('radius');
		const selector = read('selector');
		const teamId = read('teamId');
		const activation = read('activation');
		let params1;
		let params2;
		switch (area) {
			case 'rectangle':
				params1 = { variable, position, area, width, height };
				break;
			case 'circle':
				params1 = { variable, position, area, radius };
				break;
		}
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				params2 = { selector, teamId };
				break;
			case 'any':
				params2 = { selector };
				break;
		}
		Command.save!({ ...params1, ...params2, activation });
	}
});
