import '@/module/command/return.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useReturnCommandSchema() {
	const { form, save, load } = useCommandSchema('return');
	const loadTypeItems = (type: string): void => {
		const items = Command.cases.return.typeItems;
		$('#return-type')?.loadItems?.([items[type] ?? items.none]);
	};
	const onLoad = (params: Record<string, unknown>): void => {
		const type = (params.type ?? Command.returnType) as string;
		const value = params.value ?? null;
		loadTypeItems(Command.returnType);
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
		getFocus($('#return-type'));
	};
	const onSave = (): void => {
		const type = read($('#return-type')) ?? form.type;
		switch (type) {
			case 'none':
				Command.save?.({ type });
				break;
			case 'boolean':
				Command.save?.({ type, value: read($('#return-boolean')) ?? form.boolean });
				break;
			case 'number':
				Command.save?.({ type, value: read($('#return-number')) ?? form.number });
				break;
			case 'string':
				Command.save?.({ type, value: read($('#return-string')) ?? form.string });
				break;
			case 'object': {
				const variable = read($('#return-object')) ?? form.object;
				if (VariableGetter.isNone!(variable)) {
					getFocus($('#return-object'));
					return;
				}
				Command.save?.({ type, value: variable });
				break;
			}
			case 'actor':
				Command.save?.({ type, value: read($('#return-actor')) ?? form.actor });
				break;
			case 'skill':
				Command.save?.({ type, value: read($('#return-skill')) ?? form.skill });
				break;
			case 'state':
				Command.save?.({ type, value: read($('#return-state')) ?? form.state });
				break;
			case 'equipment':
				Command.save?.({ type, value: read($('#return-equipment')) ?? form.equipment });
				break;
			case 'item':
				Command.save?.({ type, value: read($('#return-item')) ?? form.item });
				break;
			case 'trigger':
				Command.save?.({ type, value: read($('#return-trigger')) ?? form.trigger });
				break;
			case 'light':
				Command.save?.({ type, value: read($('#return-light')) ?? form.light });
				break;
			case 'element':
				Command.save?.({ type, value: read($('#return-element')) ?? form.element });
				break;
		}
	};
	Command.cases.return.customLoad = onLoad;
	Command.cases.return.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
