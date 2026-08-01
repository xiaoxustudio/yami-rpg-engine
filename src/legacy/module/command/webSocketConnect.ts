import { $, getElementReader } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.webSocketConnect = new CommandSchema({
	name: 'webSocketConnect',
	onInitialize() {
		write($('#webSocketConnect-url'), '');
		write($('#webSocketConnect-id'), '');
		write($('#webSocketConnect-protocols'), '');
		$('#webSocketConnect-confirm').on('click', () => this.save());
	},
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
			{ text: Local.get('command.webSocketConnect') },
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text:
					typeof url === 'string'
						? url.length > 20
							? url.substring(0, 20) + '...'
							: url
						: Command.parseVariable(url, 'any')
			},
			{ text: ' , ' },
			{ text: id }
		];
	},
	customLoad({
		url = '',
		id = '',
		protocols = '',
		onOpen = '',
		onMessage = '',
		onError = '',
		onClose = ''
	}) {
		write($('#webSocketConnect-url'), url);
		write($('#webSocketConnect-id'), id);
		write($('#webSocketConnect-protocols'), protocols);
		write($('#webSocketConnect-onOpen'), onOpen);
		write($('#webSocketConnect-onMessage'), onMessage);
		write($('#webSocketConnect-onError'), onError);
		write($('#webSocketConnect-onClose'), onClose);
		getFocus($('#webSocketConnect-url'));
	},
	customSave() {
		const elUrl = $('#webSocketConnect-url');
		const url = read(elUrl);
		if (!url || VariableGetter.isNone(url)) {
			return getFocus(elUrl);
		}
		const elId = $('#webSocketConnect-id');
		const id = read(elId);
		if (!id || VariableGetter.isNone(id)) {
			return getFocus(elId);
		}
		const reader = getElementReader('webSocketConnect');
		Command.save({
			url: url,
			id: id,
			protocols: reader('protocols'),
			onOpen: reader('onOpen'),
			onMessage: reader('onMessage'),
			onError: reader('onError'),
			onClose: reader('onClose')
		});
	}
});
