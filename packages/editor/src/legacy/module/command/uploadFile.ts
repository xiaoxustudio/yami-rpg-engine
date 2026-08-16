import { Command } from '@/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.uploadFile = new CommandSchema({
	name: 'uploadFile',
	fields: [
		{ key: 'url', default: '' },
		{ key: 'method', default: 'POST' },
		{ key: 'path', default: '' },
		{ key: 'field', default: 'file' },
		{ key: 'header', default: [] },
		{ key: 'callback', default: '' },
		{ key: 'rateCallback', default: '' }
	],
	customParse({
		url = '',
		method = 'POST',
		path = '',
		field = 'file',
		headers = [],
		callback = '',
		rateCallback = ''
	}: {
		url: unknown;
		method: string;
		path: unknown;
		field: string;
		headers: Array<{ key: unknown; value: unknown }>;
		callback: string;
		rateCallback: string;
	}) {
		const head: Array<{ text?: string; color?: string }> = [
			{ color: 'network' },
			{ text: Local.get!('command.uploadFile') },
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text:
					typeof url === 'string'
						? url.length > 20
							? url.substring(0, 20) + '...'
							: url
						: Command.parseVariable!(url, 'any')
			},
			{ text: ' , ' },
			{ text: method },
			{ text: ' , ' },
			{ text: callback },
			{ text: ' -> ' }
		];
		const contents: Array<{ text?: string; color?: string }> = [];
		for (const i of headers) {
			contents.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${typeof i.key === 'string' ? i.key : Command.parseVariable!(i.key, 'any')} = ${typeof i.value === 'string' ? i.value : Command.parseVariable!(i.value, 'any')}`
				}
			);
		}
		return head.concat(
			contents.slice(1),
			{ text: `, ${Local.get!('command.uploadFilePath')} = ` },
			{ color: 'normal' },
			{
				text: typeof path === 'string' ? path : Command.parseVariable!(path, 'any')
			},
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: field },
			{ text: ' , ' },
			{ text: rateCallback }
		);
	}
});
