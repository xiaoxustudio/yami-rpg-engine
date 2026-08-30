/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { reactive } from 'vue';

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
		const label = t('command.getTarget.condition.' + condition);
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
			{ text: t('command.getTarget') + Token(': ') },
			{ text: words.join() }
		];
	}
});

const form = reactive<Record<string, unknown>>({});

const createDefault = (): Record<string, unknown> => {
	const data: Record<string, unknown> = {};
	for (const field of Command.cases.getTarget.fields) {
		const value = typeof field.default === 'function' ? field.default() : field.default;
		if (value !== undefined) {
			data[field.key] = value;
		}
	}
	return data;
};

const load = (params: Record<string, unknown> = {}): void => {
	const attrItems = Attribute.getAttributeItems!('actor', 'number');
	document.getElementById('getTarget-attribute')?.loadItems?.(attrItems);
	document.getElementById('getTarget-divisor')?.loadItems?.(attrItems);
	Object.assign(form, createDefault(), params);
	getFocus(document.getElementById('getTarget-actor')!);
};

const save = (): void => {
	const actor = form.actor;
	const selector = form.selector;
	const condition = form.condition;
	switch (condition) {
		case 'max-threat':
		case 'nearest':
		case 'farthest':
		case 'random':
			commit({ actor, selector, condition });
			break;
		case 'min-attribute-value':
		case 'max-attribute-value': {
			const attribute = form.attribute;
			if (attribute === '') {
				getFocus(document.getElementById('getTarget-attribute')!);
				return;
			}
			commit({ actor, selector, condition, attribute });
			break;
		}
		case 'min-attribute-ratio':
		case 'max-attribute-ratio': {
			const attribute = form.attribute;
			const divisor = form.divisor;
			if (attribute === '') {
				getFocus(document.getElementById('getTarget-attribute')!);
				return;
			}
			if (divisor === '') {
				getFocus(document.getElementById('getTarget-divisor')!);
				return;
			}
			commit({
				actor,
				selector,
				condition,
				attribute,
				divisor
			});
			break;
		}
	}
};

const schema = Command.cases.getTarget;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useGetTargetCommandSchema() {
	return { form, load, save };
}
