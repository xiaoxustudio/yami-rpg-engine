import '@app/legacy/module/command/webSocketClose.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useWebSocketCloseCommandSchema() {
	const { form, save, load } = useCommandSchema('webSocketClose', {
		onLoad() {
			getFocus(document.getElementById('webSocketClose-id'));
		}
	});
	const onSave = (): void => {
		const elId = document.getElementById('webSocketClose-id');
		const id = read(elId) ?? form.id;
		if (!id || VariableGetter.isNone!(id)) {
			getFocus(elId);
			return;
		}
		const code = read(document.getElementById('webSocketClose-code')) ?? form.code;
		Command.save!({
			id,
			code: code === '' ? '' : Number(code),
			reason: read(document.getElementById('webSocketClose-reason')) ?? form.reason
		});
	};
	Command.cases.webSocketClose.customSave = onSave;
	return { form, save: onSave, load };
}
