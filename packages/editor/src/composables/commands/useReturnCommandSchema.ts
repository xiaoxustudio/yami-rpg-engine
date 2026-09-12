import { Command } from '@app/commands/command-object.ts';
import { composableEls } from '@app/composables/element-registry';
import { commandState } from '@app/composables/useCommandState.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.return = new CommandSchema({
	name: 'return',
	typeItems: {
		none: { name: 'None', value: 'none' },
		boolean: { name: 'Boolean', value: 'boolean' },
		number: { name: 'Number', value: 'number' },
		string: { name: 'String', value: 'string' },
		object: { name: 'Object', value: 'object' },
		actor: { name: 'Actor', value: 'actor' },
		skill: { name: 'Skill', value: 'skill' },
		state: { name: 'State', value: 'state' },
		equipment: { name: 'Equipment', value: 'equipment' },
		item: { name: 'Item', value: 'item' },
		trigger: { name: 'Trigger', value: 'trigger' },
		light: { name: 'Light', value: 'light' },
		element: { name: 'Element', value: 'element' }
	},
	fields: [
		{ key: 'type', default: () => Command.returnType },
		{ key: 'boolean', default: false },
		{ key: 'number', default: 0 },
		{ key: 'string', default: '' },
		{ key: 'object', default: { type: 'local', key: '' } },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'skill', default: { type: 'trigger' } },
		{ key: 'state', default: { type: 'trigger' } },
		{ key: 'equipment', default: { type: 'trigger' } },
		{ key: 'item', default: { type: 'trigger' } },
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'light', default: { type: 'trigger' } },
		{ key: 'element', default: { type: 'trigger' } }
	],
	customParse({ type, value }: { type: string; value: number | string | boolean }) {
		const words = Command.words;
		switch (type) {
			case 'none':
				break;
			case 'boolean':
				words.push(Command.setBooleanColor!(value.toString()));
				break;
			case 'number':
				words.push(Command.parseVariableNumber!(value));
				break;
			case 'string':
				words.push(Command.parseVariableString!(value));
				break;
			case 'object':
				words.push(Command.parseVariable!(value, 'object'));
				break;
			case 'actor':
				words.push(Command.parseActor!(value));
				break;
			case 'skill':
				words.push(Command.parseSkill!(value));
				break;
			case 'state':
				words.push(Command.parseState!(value));
				break;
			case 'equipment':
				words.push(Command.parseEquipment!(value));
				break;
			case 'item':
				words.push(Command.parseItem!(value));
				break;
			case 'trigger':
				words.push(Command.parseTrigger!(value));
				break;
			case 'light':
				words.push(Command.parseLight!(value));
				break;
			case 'element':
				words.push(Command.parseElement!(value));
				break;
		}
		let info = words.join();
		if (Command.returnType !== type) {
			info = Command.setClass('error') + (info || '?');
		}
		return [
			{ color: 'flow' },
			{ text: t('command.return') + ' ' },
			{ color: 'restore' },
			{ text: info }
		];
	}
});

export function useReturnCommandSchema() {
	const { form, load, commit } = useCommandSchema('return', { skipWrite: true });
	const loadTypeItems = (type: string): void => {
		const items = Command.cases.return.typeItems;
		composableEls.get('return-type')?.loadItems?.([items[type] ?? items.none]);
	};
	const onLoad = (params: Record<string, unknown>): void => {
		const type = (params.type ?? commandState.returnType) as string;
		const value = params.value ?? null;
		loadTypeItems(commandState.returnType);
		load({
			...params,
			type,
			boolean: type === 'boolean' && value !== null ? value : false,
			number: type === 'number' && value !== null ? value : 0,
			string: type === 'string' && value !== null ? value : '',
			object: type === 'object' && value !== null ? value : { type: 'local', key: '' },
			actor: type === 'actor' && value !== null ? value : { type: 'trigger' },
			skill: type === 'skill' && value !== null ? value : { type: 'trigger' },
			state: type === 'state' && value !== null ? value : { type: 'trigger' },
			equipment: type === 'equipment' && value !== null ? value : { type: 'trigger' },
			item: type === 'item' && value !== null ? value : { type: 'trigger' },
			trigger: type === 'trigger' && value !== null ? value : { type: 'trigger' },
			light: type === 'light' && value !== null ? value : { type: 'trigger' },
			element: type === 'element' && value !== null ? value : { type: 'trigger' }
		});
		requestFocus('return-type');
	};
	const onSave = (): void => {
		const type = form.type as string;
		switch (type) {
			case 'none':
				commit({ type });
				break;
			case 'boolean':
				commit({ type, value: form.boolean });
				break;
			case 'number':
				commit({ type, value: form.number });
				break;
			case 'string':
				commit({ type, value: form.string });
				break;
			case 'object': {
				const variable = form.object;
				if (VariableGetter.isNone!(variable as { key: string })) {
					requestFocus('return-object');
					return;
				}
				commit({ type, value: variable });
				break;
			}
			case 'actor':
				commit({ type, value: form.actor });
				break;
			case 'skill':
				commit({ type, value: form.skill });
				break;
			case 'state':
				commit({ type, value: form.state });
				break;
			case 'equipment':
				commit({ type, value: form.equipment });
				break;
			case 'item':
				commit({ type, value: form.item });
				break;
			case 'trigger':
				commit({ type, value: form.trigger });
				break;
			case 'light':
				commit({ type, value: form.light });
				break;
			case 'element':
				commit({ type, value: form.element });
				break;
		}
	};
	Command.cases.return.customLoad = onLoad;
	Command.cases.return.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
