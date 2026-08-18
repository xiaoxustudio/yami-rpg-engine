import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.webSocketSend = new CommandSchema({
	name: 'webSocketSend',
	fields: [
		{ key: 'id', default: '' },
		{ key: 'data', default: '' }
	],
	customParse({ id = '', data = '' }) {
		return [
			{ color: 'network' },
			{ text: t('command.webSocketSend') },
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: id },
			{ text: ' , ' },
			{
				text:
					typeof data === 'string'
						? data.length > 20
							? data.substring(0, 20) + '...'
							: data
						: Command.parseVariable!(data, 'any')
			}
		];
	}
});
