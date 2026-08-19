import '@app/legacy/module/command/webSocketConnect.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useWebSocketConnectCommandSchema() {
	const { form, save, load } = useCommandSchema('webSocketConnect', {
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
		Command.save!({
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
