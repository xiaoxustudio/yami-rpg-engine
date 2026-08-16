import '@/module/command/loadImage.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Enum } from '@/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useLoadImageCommandSchema() {
	const { form, save, load } = useCommandSchema('loadImage', {
		onLoad() {
			$('#loadImage-key')?.loadItems?.(Enum.getStringItems!('shortcut-key'));
			getFocus($('#loadImage-element'));
		}
	});
	const onSave = (): void => {
		const element = read($('#loadImage-element')) ?? form.element;
		const type = read($('#loadImage-type')) ?? form.type;
		switch (type) {
			case 'actor-portrait':
				Command.save?.({
					element,
					type,
					actor: read($('#loadImage-actor')) ?? form.actor
				});
				break;
			case 'skill-icon':
				Command.save?.({
					element,
					type,
					skill: read($('#loadImage-skill')) ?? form.skill
				});
				break;
			case 'state-icon':
				Command.save?.({
					element,
					type,
					state: read($('#loadImage-state')) ?? form.state
				});
				break;
			case 'equipment-icon':
				Command.save?.({
					element,
					type,
					equipment: read($('#loadImage-equipment')) ?? form.equipment
				});
				break;
			case 'item-icon':
				Command.save?.({
					element,
					type,
					item: read($('#loadImage-item')) ?? form.item
				});
				break;
			case 'shortcut-icon':
				Command.save?.({
					element,
					type,
					actor: read($('#loadImage-actor')) ?? form.actor,
					key: read($('#loadImage-key')) ?? form.key
				});
				break;
			case 'base64': {
				const variable = read($('#loadImage-variable')) ?? form.variable;
				if (VariableGetter.isNone!(variable)) {
					getFocus($('#loadImage-variable'));
					return;
				}
				Command.save?.({ element, type, variable });
				break;
			}
		}
	};
	Command.cases.loadImage.customSave = onSave;
	return { form, save: onSave, load };
}
