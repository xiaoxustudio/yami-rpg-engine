import { Command } from '@/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.webSocketClose = new CommandSchema({
	name: 'webSocketClose',
	fields: [
		{ key: 'id', default: '' },
		{ key: 'code', default: '' },
		{ key: 'reason', default: '' }
	],
	customParse({ id = '', code = '', reason = '' }) {
		const head = [
			{ color: 'network' },
			{ text: Local.get!('command.webSocketClose') },
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: id }
		];
		if (code !== '' && code !== null && code !== undefined) {
			head.push({ text: ' , ' }, { text: String(code) });
		}
		if (reason) {
			head.push({ text: ' , ' }, { text: reason });
		}
		return head;
	}
});
