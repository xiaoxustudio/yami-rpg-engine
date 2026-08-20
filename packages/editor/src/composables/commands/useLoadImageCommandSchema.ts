import '@app/legacy/module/command/loadImage.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useLoadImageCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('loadImage', {
		onLoad() {
			document
				.getElementById('loadImage-key')
				?.loadItems?.(Enum.getStringItems!('shortcut-key'));
			getFocus(document.getElementById('loadImage-element')!);
		}
	});
	const onSave = (): void => {
		const element = read(document.getElementById('loadImage-element')!) ?? form.element;
		const type = read(document.getElementById('loadImage-type')!) ?? form.type;
		switch (type) {
			case 'actor-portrait':
				commit({
					element,
					type,
					actor: read(document.getElementById('loadImage-actor')!) ?? form.actor
				});
				break;
			case 'skill-icon':
				commit({
					element,
					type,
					skill: read(document.getElementById('loadImage-skill')!) ?? form.skill
				});
				break;
			case 'state-icon':
				commit({
					element,
					type,
					state: read(document.getElementById('loadImage-state')!) ?? form.state
				});
				break;
			case 'equipment-icon':
				commit({
					element,
					type,
					equipment:
						read(document.getElementById('loadImage-equipment')!) ?? form.equipment
				});
				break;
			case 'item-icon':
				commit({
					element,
					type,
					item: read(document.getElementById('loadImage-item')!) ?? form.item
				});
				break;
			case 'shortcut-icon':
				commit({
					element,
					type,
					actor: read(document.getElementById('loadImage-actor')!) ?? form.actor,
					key: read(document.getElementById('loadImage-key')!) ?? form.key
				});
				break;
			case 'base64': {
				const variable =
					read(document.getElementById('loadImage-variable')!) ?? form.variable;
				if (VariableGetter.isNone!(variable)) {
					getFocus(document.getElementById('loadImage-variable')!);
					return;
				}
				commit({ element, type, variable });
				break;
			}
		}
	};
	Command.cases.loadImage.customSave = onSave;
	return { form, save: onSave, load };
}
