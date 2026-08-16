import '@/module/command/webSocketConnect.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useWebSocketConnectCommandSchema() {
	const { form, save, load } = useCommandSchema('webSocketConnect', {
		onLoad() {
			getFocus($('#webSocketConnect-url'));
		}
	});
	const onSave = (): void => {
		const elUrl = $('#webSocketConnect-url');
		const url = read(elUrl) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus(elUrl);
			return;
		}
		const elId = $('#webSocketConnect-id');
		const id = read(elId) ?? form.id;
		if (!id || VariableGetter.isNone!(id)) {
			getFocus(elId);
			return;
		}
		Command.save!({
			url,
			id,
			protocols: read($('#webSocketConnect-protocols')) ?? form.protocols,
			onOpen: read($('#webSocketConnect-onOpen')) ?? form.onOpen,
			onMessage: read($('#webSocketConnect-onMessage')) ?? form.onMessage,
			onError: read($('#webSocketConnect-onError')) ?? form.onError,
			onClose: read($('#webSocketConnect-onClose')) ?? form.onClose
		});
	};
	Command.cases.webSocketConnect.customSave = onSave;
	return { form, save: onSave, load };
}
