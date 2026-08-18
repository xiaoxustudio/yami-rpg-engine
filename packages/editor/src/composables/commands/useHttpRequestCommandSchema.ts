import '@app/legacy/module/command/httpRequest.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useHttpRequestCommandSchema() {
	const { form, save, load } = useCommandSchema('httpRequest', {
		onLoad() {
			getFocus(document.getElementById('httpRequest-url')!);
		}
	});
	const onSave = (): void => {
		const url = read(document.getElementById('httpRequest-url')!) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus(document.getElementById('httpRequest-url')!);
			return;
		}
		const timeout = read(document.getElementById('httpRequest-timeout')!) ?? form.timeout;
		Command.save?.({
			url,
			method: read(document.getElementById('httpRequest-method')!) ?? form.method,
			headers: read(document.getElementById('httpRequest-header')!) ?? form.headers,
			data: read(document.getElementById('httpRequest-data')!) ?? form.data,
			callback: read(document.getElementById('httpRequest-callback')!) ?? form.callback,
			timeout: timeout === '' ? '' : Number(timeout),
			responseType:
				read(document.getElementById('httpRequest-responseType')!) ?? form.responseType,
			withCredentials:
				read(document.getElementById('httpRequest-withCredentials')!) ??
				form.withCredentials,
			authUser: read(document.getElementById('httpRequest-authUser')!) ?? form.authUser,
			authPass: read(document.getElementById('httpRequest-authPass')!) ?? form.authPass
		});
	};
	Command.cases.httpRequest.customSave = onSave;
	return { form, save: onSave, load };
}
