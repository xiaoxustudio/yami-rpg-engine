import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
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
