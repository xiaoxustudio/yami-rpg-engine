import '@app/legacy/module/command/webSocketSend.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useWebSocketSendCommandSchema() {
	const { form, save, load } = useCommandSchema('webSocketSend', {
		onLoad() {
			getFocus(document.getElementById('webSocketSend-id'));
		}
	});
	const onSave = (): void => {
		const elId = document.getElementById('webSocketSend-id');
		const id = read(elId) ?? form.id;
		if (!id || VariableGetter.isNone!(id)) {
			getFocus(elId);
			return;
		}
		const elData = document.getElementById('webSocketSend-data');
		const data = read(elData) ?? form.data;
		if (!data || VariableGetter.isNone!(data)) {
			getFocus(elData);
			return;
		}
		Command.save!({ id, data });
	};
	Command.cases.webSocketSend.customSave = onSave;
	return { form, save: onSave, load };
}
