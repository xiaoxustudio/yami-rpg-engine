import '@app/legacy/module/command/return.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { commandState } from '@app/composables/useCommandState.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useReturnCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('return');
	const loadTypeItems = (type: string): void => {
		const items = Command.cases.return.typeItems;
		document.getElementById('return-type')?.loadItems?.([items[type] ?? items.none]);
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
		getFocus(document.getElementById('return-type'));
	};
	const onSave = (): void => {
		const type = read(document.getElementById('return-type')) ?? form.type;
		switch (type) {
			case 'none':
				commit({ type });
				break;
			case 'boolean':
				commit({
					type,
					value: read(document.getElementById('return-boolean')) ?? form.boolean
				});
				break;
			case 'number':
				commit({
					type,
					value: read(document.getElementById('return-number')) ?? form.number
				});
				break;
			case 'string':
				commit({
					type,
					value: read(document.getElementById('return-string')) ?? form.string
				});
				break;
			case 'object': {
				const variable = read(document.getElementById('return-object')) ?? form.object;
				if (VariableGetter.isNone!(variable)) {
					getFocus(document.getElementById('return-object'));
					return;
				}
				commit({ type, value: variable });
				break;
			}
			case 'actor':
				commit({
					type,
					value: read(document.getElementById('return-actor')) ?? form.actor
				});
				break;
			case 'skill':
				commit({
					type,
					value: read(document.getElementById('return-skill')) ?? form.skill
				});
				break;
			case 'state':
				commit({
					type,
					value: read(document.getElementById('return-state')) ?? form.state
				});
				break;
			case 'equipment':
				commit({
					type,
					value: read(document.getElementById('return-equipment')) ?? form.equipment
				});
				break;
			case 'item':
				commit({
					type,
					value: read(document.getElementById('return-item')) ?? form.item
				});
				break;
			case 'trigger':
				commit({
					type,
					value: read(document.getElementById('return-trigger')) ?? form.trigger
				});
				break;
			case 'light':
				commit({
					type,
					value: read(document.getElementById('return-light')) ?? form.light
				});
				break;
			case 'element':
				commit({
					type,
					value: read(document.getElementById('return-element')) ?? form.element
				});
				break;
		}
	};
	Command.cases.return.customLoad = onLoad;
	Command.cases.return.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
