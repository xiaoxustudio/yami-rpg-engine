import '@app/legacy/module/command/httpRequest.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useHttpRequestCommandSchema() {
	const { form, save, load } = useCommandSchema('httpRequest', {
		onLoad() {
			getFocus($('#httpRequest-url'));
		}
	});
	const onSave = (): void => {
		const url = read($('#httpRequest-url')) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus($('#httpRequest-url'));
			return;
		}
		const timeout = read($('#httpRequest-timeout')) ?? form.timeout;
		Command.save?.({
			url,
			method: read($('#httpRequest-method')) ?? form.method,
			headers: read($('#httpRequest-header')) ?? form.headers,
			data: read($('#httpRequest-data')) ?? form.data,
			callback: read($('#httpRequest-callback')) ?? form.callback,
			timeout: timeout === '' ? '' : Number(timeout),
			responseType: read($('#httpRequest-responseType')) ?? form.responseType,
			withCredentials: read($('#httpRequest-withCredentials')) ?? form.withCredentials,
			authUser: read($('#httpRequest-authUser')) ?? form.authUser,
			authPass: read($('#httpRequest-authPass')) ?? form.authPass
		});
	};
	Command.cases.httpRequest.customSave = onSave;
	return { form, save: onSave, load };
}
