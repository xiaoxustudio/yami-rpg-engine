import { Command } from '@/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.commandLine = new CommandSchema({
	name: 'commandLine',
	fields: [
		{ key: 'type', default: 'get' },
		{ key: 'key', default: '' },
		{ key: 'value', default: '' },
		{ key: 'variable', default: { type: 'local', key: '' } }
	],
	customParse({ type = 'get', key = '', value = '', variable = { type: 'local', key: '' } }) {
		const head = [
			{ color: 'system' },
			{ text: Local.get!('command.commandLine') },
			{ color: 'normal' },
			{ text: ' ' }
		];
		switch (type) {
			case 'set':
				const raw_value =
					typeof value == 'string' ? value : Command.parseVariable!(value, 'string');
				return head.concat(
					{ color: 'flow' },
					{ text: Local.get!('command.commandLine.set') },
					{ text: ' ' },
					{ color: 'text' },
					{ color: 'save' },
					{
						text: typeof key == 'string' ? key : Command.parseVariable!(key, 'string')
					},
					{ text: ' ' },
					...(raw_value.length
						? [
								{
									text: '='
								},
								{ text: ' ' },
								{ color: 'gray' },
								{ color: 'save' },
								{
									text: raw_value
								}
							]
						: [])
				);
				break;
			case 'has':
			case 'rm':
			case 'get':
				head.push(
					{ color: 'flow' },
					{
						text:
							type === 'get'
								? Local.get!('command.commandLine.get')
								: type === 'rm'
									? Local.get!('command.commandLine.rm')
									: Local.get!('command.commandLine.has')
					},
					{ text: ' ' },
					{ color: 'text' },
					{ color: 'save' },
					{
						text: typeof key == 'string' ? key : Command.parseVariable!(key, 'string')
					},
					{ text: ' ' },
					{ color: 'gray' },
					{ color: 'save' },
					{
						text: Local.get!('command.commandLine.variable')
					},
					{ text: ' ' },
					{
						text: Command.parseVariable!(variable, 'string')
					}
				);
				break;
		}

		return head;
	}
});
