import { $, getElementReader } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.detectTargets = new CommandSchema({
	name: 'detectTargets',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'distance', default: 0 },
		{ key: 'selector', default: 'enemy' },
		{ key: 'inSight', default: false }
	],
	onInitialize() {
		$('#detectTargets-selector').loadItems([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		]);
		$('#detectTargets-inSight').loadItems([
			{ name: 'Enabled', value: true },
			{ name: 'Disabled', value: false }
		]);
	},
	parseInSight(inSight: boolean) {
		switch (inSight) {
			case true:
				return Local.get!('command.detectTargets.inSight');
			case false:
				return '';
		}
	},
	customParse({
		actor,
		distance,
		selector,
		inSight
	}: {
		actor: unknown;
		distance: unknown;
		selector: unknown;
		inSight: boolean;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Token('≤') + Command.parseVariableNumber!(distance, 't'))
			.push(Command.parseActorSelector!(selector))
			.push(this.parseInSight!(inSight));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.detectTargets') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#detectTargets-actor'));
	},
	customSave() {
		const read = getElementReader('detectTargets');
		const distance = read('distance');
		if (distance === 0) {
			return getFocus($('#detectTargets-distance'), 'all');
		}
		Command.save!({
			actor: read('actor'),
			distance,
			selector: read('selector'),
			inSight: read('inSight')
		});
	}
});
