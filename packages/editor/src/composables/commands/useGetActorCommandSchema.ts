import { getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { reactive } from 'vue';

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
		const label = t('command.getActor.condition.' + condition);
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
			.push(t('command.getActor.' + area))
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
		words.push(t('command.getActor.' + activation));
		switch (exclusion) {
			case 'actor': {
				const label = t('command.getActor.exclude');
				words.push(label + Token('(') + Command.parseActor!(exclusionActor) + Token(')'));
				break;
			}
			case 'team': {
				const label = t('command.getActor.exclude');
				words.push(
					label + Token('(') + Command.parseVariableTeam!(exclusionTeamId) + Token(')')
				);
				break;
			}
		}
		return [
			{ color: 'actor' },
			{ text: t('command.getActor') + Token(': ') },
			{ text: actor + Token(' = ') + words.join() }
		];
	}
});

const form = reactive<Record<string, unknown>>({});

const createDefault = (): Record<string, unknown> => {
	const data: Record<string, unknown> = {};
	for (const field of Command.cases.getActor.fields) {
		const value = typeof field.default === 'function' ? field.default() : field.default;
		if (value !== undefined) {
			data[field.key] = value;
		}
	}
	return data;
};

const load = (params: Record<string, unknown> = {}): void => {
	const selector = Command.cases.getActor.remapSelectorPatch!(
		(params.selector as string) ?? 'enemy'
	);
	const activation = Command.cases.getActor.remapActivationPatch!(
		(params.activation as string) ?? 'active',
		params.active as boolean | undefined
	);
	const attrItems = Attribute.getAttributeItems!('actor', 'number');
	document.getElementById('getActor-attribute')?.loadItems?.(attrItems);
	document.getElementById('getActor-divisor')?.loadItems?.(attrItems);
	Object.assign(form, createDefault(), { ...params, selector, activation });
	write(document.getElementById('getActor-variable'), form.variable);
	write(document.getElementById('getActor-position'), form.position);
	write(document.getElementById('getActor-area'), form.area);
	write(document.getElementById('getActor-size'), form.size);
	write(document.getElementById('getActor-radius'), form.radius);
	write(document.getElementById('getActor-selector'), form.selector);
	write(document.getElementById('getActor-teamId'), form.teamId);
	write(document.getElementById('getActor-condition'), form.condition);
	write(document.getElementById('getActor-attribute'), form.attribute);
	write(document.getElementById('getActor-divisor'), form.divisor);
	write(document.getElementById('getActor-activation'), form.activation);
	write(document.getElementById('getActor-exclusion'), form.exclusion);
	write(document.getElementById('getActor-exclusionActor'), form.exclusionActor);
	write(document.getElementById('getActor-exclusionTeamId'), form.exclusionTeamId);
	getFocus(document.getElementById('getActor-variable'));
};

const save = (): void => {
	const variable = read(document.getElementById('getActor-variable')) ?? form.variable;
	if (VariableGetter.isNone!(variable)) {
		getFocus(document.getElementById('getActor-variable'));
		return;
	}
	const position = read(document.getElementById('getActor-position')) ?? form.position;
	const area = read(document.getElementById('getActor-area')) ?? form.area;
	const size = read(document.getElementById('getActor-size')) ?? form.size;
	const radius = read(document.getElementById('getActor-radius')) ?? form.radius;
	const selector = read(document.getElementById('getActor-selector')) ?? form.selector;
	const teamId = read(document.getElementById('getActor-teamId')) ?? form.teamId;
	const condition = read(document.getElementById('getActor-condition')) ?? form.condition;
	const attribute = read(document.getElementById('getActor-attribute')) ?? form.attribute;
	const divisor = read(document.getElementById('getActor-divisor')) ?? form.divisor;
	const activation = read(document.getElementById('getActor-activation')) ?? form.activation;
	const exclusion = read(document.getElementById('getActor-exclusion')) ?? form.exclusion;
	const exclusionActor =
		read(document.getElementById('getActor-exclusionActor')) ?? form.exclusionActor;
	const exclusionTeamId =
		read(document.getElementById('getActor-exclusionTeamId')) ?? form.exclusionTeamId;
	let params1;
	let params2;
	let params3;
	let params4;
	switch (area) {
		case 'square':
			params1 = { variable, position, area, size };
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
	switch (condition) {
		case 'nearest':
		case 'farthest':
		case 'random':
			params3 = { condition };
			break;
		case 'min-attribute-value':
		case 'max-attribute-value':
			if (attribute === '') {
				getFocus(document.getElementById('getActor-attribute'));
				return;
			}
			params3 = { condition, attribute };
			break;
		case 'min-attribute-ratio':
		case 'max-attribute-ratio':
			if (attribute === '') {
				getFocus(document.getElementById('getActor-attribute'));
				return;
			}
			if (divisor === '' || attribute === divisor) {
				getFocus(document.getElementById('getActor-divisor'));
				return;
			}
			params3 = { condition, attribute, divisor };
			break;
	}
	switch (exclusion) {
		case 'none':
			params4 = { activation, exclusion };
			break;
		case 'actor':
			params4 = { activation, exclusion, exclusionActor };
			break;
		case 'team':
			params4 = { activation, exclusion, exclusionTeamId };
			break;
	}
	commit({ ...params1, ...params2, ...params3, ...params4 });
};

const schema = Command.cases.getActor;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useGetActorCommandSchema() {
	return { load, save };
}
