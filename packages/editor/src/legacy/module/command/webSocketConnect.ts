import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.webSocketConnect = new CommandSchema({
	name: 'webSocketConnect',
	fields: [
		{ key: 'url', default: '' },
		{ key: 'id', default: '' },
		{ key: 'protocols', default: '' },
		{ key: 'onOpen', default: '' },
		{ key: 'onMessage', default: '' },
		{ key: 'onError', default: '' },
		{ key: 'onClose', default: '' }
	],
	customParse({
		url = '',
		id = '',
		protocols = '',
		onOpen = '',
		onMessage = '',
		onError = '',
		onClose = ''
	}) {
		return [
			{ color: 'network' },
			{ text: t('command.webSocketConnect') },
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
			{ text: id }
		];
	}
});
