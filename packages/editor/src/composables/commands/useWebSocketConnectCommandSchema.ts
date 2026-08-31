/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus, read } from '@app/utils/element-utils';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

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
	customParse({ url = '', id = '' }) {
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

export function useWebSocketConnectCommandSchema() {
	const { form, load, commit } = useCommandSchema('webSocketConnect', {
		onLoad() {
			getFocus(document.getElementById('webSocketConnect-url'));
		}
	});
	const onSave = (): void => {
		const elUrl = document.getElementById('webSocketConnect-url');
		const url = read(elUrl) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus(elUrl);
			return;
		}
		const elId = document.getElementById('webSocketConnect-id');
		const id = read(elId) ?? form.id;
		if (!id || VariableGetter.isNone!(id)) {
			getFocus(elId);
			return;
		}
		commit({
			url,
			id,
			protocols:
				read(document.getElementById('webSocketConnect-protocols')) ?? form.protocols,
			onOpen: read(document.getElementById('webSocketConnect-onOpen')) ?? form.onOpen,
			onMessage:
				read(document.getElementById('webSocketConnect-onMessage')) ?? form.onMessage,
			onError: read(document.getElementById('webSocketConnect-onError')) ?? form.onError,
			onClose: read(document.getElementById('webSocketConnect-onClose')) ?? form.onClose
		});
	};
	Command.cases.webSocketConnect.customSave = onSave;
	return { form, save: onSave, load };
}
