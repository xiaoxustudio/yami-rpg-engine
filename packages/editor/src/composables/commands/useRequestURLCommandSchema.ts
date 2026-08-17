import '@app/legacy/module/command/requestURL.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRequestURLCommandSchema() {
	const { form, save, load } = useCommandSchema('requestURL', {
		onLoad() {
			getFocus($('#requestURL-url'));
		}
	});
	const onSave = (): void => {
		const url = read($('#requestURL-url')) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus($('#requestURL-url'));
			return;
		}
		Command.save?.({
			url,
			method: read($('#requestURL-method')) ?? form.method,
			headers: read($('#requestURL-header')) ?? form.headers,
			data: read($('#requestURL-data')) ?? form.data,
			callback: read($('#requestURL-callback')) ?? form.callback
		});
	};
	Command.cases.requestURL.customSave = onSave;
	return { form, save: onSave, load };
}
