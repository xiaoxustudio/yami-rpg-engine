import { Command } from '@/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
			{ text: Local.get!('command.return') + ' ' },
			{ color: 'restore' },
			{ text: info }
		];
	}
});
