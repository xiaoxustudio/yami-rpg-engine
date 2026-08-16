import { Attribute } from '@/attribute/attribute-window.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

type GetActorCommandData = {
	variable: unknown;
	position: unknown;
	area: string;
	size?: number;
	radius?: number;
	selector: string;
	teamId?: string;
	condition: string;
	attribute?: string;
	divisor?: string;
	activation: string;
	exclusion: string;
	exclusionActor?: unknown;
	exclusionTeamId?: string;
	active?: boolean;
};

Command.cases.getActor = new CommandSchema({
	name: 'getActor',
	remapSelectorPatch(selector: string) {
		switch (selector) {
			case 'team-enemy':
				return 'enemy';
			case 'team-friend':
				return 'friend';
			case 'team-member':
				return 'team';
			default:
				return selector;
		}
	},
	remapActivationPatch(activation: string, active?: boolean) {
		switch (active) {
			case true:
				return 'active';
			case false:
				return 'either';
			default:
				return activation;
		}
	},
	fields: [
		{ key: 'variable', default: { type: 'local', key: '' } },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } },
		{ key: 'area', default: 'square' },
		{ key: 'size', default: 1 },
		{ key: 'radius', default: 0.5 },
		{ key: 'selector', default: 'enemy' },
		{ key: 'teamId', default: () => Data.teams.list[0].id },
		{ key: 'condition', default: 'nearest' },
		{ key: 'attribute', default: () => Attribute.getDefAttributeId!('actor', 'number') },
		{ key: 'divisor', default: () => Attribute.getDefAttributeId!('actor', 'number') },
		{ key: 'activation', default: 'active' },
		{ key: 'exclusion', default: 'none' },
		{ key: 'exclusionActor', default: { type: 'trigger' } },
		{ key: 'exclusionTeamId', default: () => Data.teams.list[0].id }
	],
	parseCondition(condition: string, attribute?: string, divisor?: string) {
		const label = Local.get!('command.getActor.condition.' + condition);
		switch (condition) {
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
		variable,
		position,
		area,
		size,
		radius,
		selector,
		teamId,
		condition,
		attribute,
		divisor,
		activation,
		exclusion,
		exclusionActor,
		exclusionTeamId,
		active
	}: GetActorCommandData) {
		selector = this.remapSelectorPatch!(selector);
		activation = this.remapActivationPatch!(activation, active);
		condition = condition ?? 'nearest';
		exclusion = exclusion ?? 'none';
		const actor = Command.parseVariable!(variable, 'object', true);
		const words = Command.words
			.push(Command.parsePosition!(position))
			.push(Local.get!('command.getActor.' + area))
			.push(Command.parseVariableNumber!(size ?? radius, 't'));
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
		words.push(this.parseCondition!(condition, attribute, divisor));
		words.push(Local.get!('command.getActor.' + activation));
		switch (exclusion) {
			case 'actor': {
				const label = Local.get!('command.getActor.exclude');
				words.push(label + Token('(') + Command.parseActor!(exclusionActor) + Token(')'));
				break;
			}
			case 'team': {
				const label = Local.get!('command.getActor.exclude');
				words.push(
					label + Token('(') + Command.parseVariableTeam!(exclusionTeamId) + Token(')')
				);
				break;
			}
		}
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.getActor') + Token(': ') },
			{ text: actor + Token(' = ') + words.join() }
		];
	}
});
