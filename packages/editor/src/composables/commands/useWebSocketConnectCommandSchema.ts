import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

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
		skipWrite: true,
		onLoad() {
			requestFocus('webSocketConnect-url');
		}
	});
	const onSave = (): void => {
		const url = form.url;
		if (!url || VariableGetter.isNone!(url as { key: string })) {
			requestFocus('webSocketConnect-url');
			return;
		}
		const id = form.id;
		if (!id || VariableGetter.isNone!(id as { key: string })) {
			requestFocus('webSocketConnect-id');
			return;
		}
		commit({
			url,
			id,
			protocols: form.protocols,
			onOpen: form.onOpen,
			onMessage: form.onMessage,
			onError: form.onError,
			onClose: form.onClose
		});
	};
	Command.cases.webSocketConnect.customSave = onSave;
	return { form, save: onSave, load };
}
