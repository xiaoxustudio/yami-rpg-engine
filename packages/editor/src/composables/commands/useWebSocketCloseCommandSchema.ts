import '@/module/command/webSocketClose.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useWebSocketCloseCommandSchema() {
	const { form, save, load } = useCommandSchema('webSocketClose', {
		onLoad() {
			getFocus($('#webSocketClose-id'));
		}
	});
	const onSave = (): void => {
		const elId = $('#webSocketClose-id');
		const id = read(elId) ?? form.id;
		if (!id || VariableGetter.isNone!(id)) {
			getFocus(elId);
			return;
		}
		const code = read($('#webSocketClose-code')) ?? form.code;
		Command.save!({
			id,
			code: code === '' ? '' : Number(code),
			reason: read($('#webSocketClose-reason')) ?? form.reason
		});
	};
	Command.cases.webSocketClose.customSave = onSave;
	return { form, save: onSave, load };
}
