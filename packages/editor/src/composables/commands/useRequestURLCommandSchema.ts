import '@app/legacy/module/command/requestURL.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRequestURLCommandSchema() {
	const { form, save, load } = useCommandSchema('requestURL', {
		onLoad() {
			getFocus(document.getElementById('requestURL-url'));
		}
	});
	const onSave = (): void => {
		const url = read(document.getElementById('requestURL-url')) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus(document.getElementById('requestURL-url'));
			return;
		}
		Command.save?.({
			url,
			method: read(document.getElementById('requestURL-method')) ?? form.method,
			headers: read(document.getElementById('requestURL-header')) ?? form.headers,
			data: read(document.getElementById('requestURL-data')) ?? form.data,
			callback: read(document.getElementById('requestURL-callback')) ?? form.callback
		});
	};
	Command.cases.requestURL.customSave = onSave;
	return { form, save: onSave, load };
}
