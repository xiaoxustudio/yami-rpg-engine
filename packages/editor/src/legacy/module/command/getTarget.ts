import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.getTarget = new CommandSchema({
	name: 'getTarget',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'selector', default: 'enemy' },
		{ key: 'condition', default: 'max-threat' },
		{ key: 'attribute', default: () => Attribute.getDefAttributeId!('actor', 'number') },
		{ key: 'divisor', default: () => Attribute.getDefAttributeId!('actor', 'number') }
	],
	parseCondition(condition: string, attribute: unknown, divisor: unknown) {
		const label = Local.get!('command.getTarget.condition.' + condition);
		switch (condition) {
			case 'max-threat':
			case 'nearest':
			case 'farthest':
			case 'random':
				return label;
			case 'min-attribute-value':
			case 'max-attribute-value':
				return (
					label + Token('(') + Command.parseAttributeKey!('actor', attribute) + Token(')')
				);
			case 'min-attribute-ratio':
			case 'max-attribute-ratio':
				return (
					label +
					Token('(') +
					Command.parseAttributeKey!('actor', attribute) +
					Token(' / ') +
					Command.parseAttributeKey!('actor', divisor) +
					Token(')')
				);
		}
	},
	customParse({
		actor,
		selector,
		condition,
		attribute,
		divisor
	}: {
		actor: unknown;
		selector: unknown;
		condition: string;
		attribute: unknown;
		divisor: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseActorSelector!(selector))
			.push(this.parseCondition!(condition, attribute, divisor));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.getTarget') + Token(': ') },
			{ text: words.join() }
		];
	}
});
