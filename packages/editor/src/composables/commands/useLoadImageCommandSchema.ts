import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.loadImage = new CommandSchema({
	name: 'loadImage',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'type', default: 'actor-portrait' },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'skill', default: { type: 'trigger' } },
		{ key: 'state', default: { type: 'trigger' } },
		{ key: 'equipment', default: { type: 'trigger' } },
		{ key: 'item', default: { type: 'trigger' } },
		{ key: 'key', default: () => Enum.getDefStringId!('shortcut-key') },
		{ key: 'variable', default: { type: 'local', key: '' } }
	],
	customParse({
		element,
		type,
		actor,
		skill,
		state,
		equipment,
		item,
		key,
		variable
	}: {
		element: unknown;
		type: string;
		actor: unknown;
		skill: unknown;
		state: unknown;
		equipment: unknown;
		item: unknown;
		key: unknown;
		variable: unknown;
	}) {
		const words = Command.words.push(Command.parseElement!(element));
		const label = t('command.loadImage.' + type);
		let content;
		switch (type) {
			case 'actor-portrait':
				content = Command.parseActor!(actor);
				break;
			case 'skill-icon':
				content = Command.parseSkill!(skill);
				break;
			case 'state-icon':
				content = Command.parseState!(state);
				break;
			case 'equipment-icon':
				content = Command.parseEquipment!(equipment);
				break;
			case 'item-icon':
				content = Command.parseItem!(item);
				break;
			case 'shortcut-icon': {
				const actorInfo = Command.parseActor!(actor);
				const shortcutKey = Command.parseVariableEnum!('shortcut-key', key);
				content = actorInfo + Token(' -> ') + shortcutKey;
				break;
			}
			case 'base64':
				content = Command.parseVariable!(variable, 'string');
				break;
		}
		words.push(label + Token('(') + content + Token(')'));
		return [
			{ color: 'element' },
			{ text: t('command.loadImage') + Token(': ') },
			{ text: words.join() }
		];
	}
});

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
