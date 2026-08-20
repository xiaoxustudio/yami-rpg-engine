import '@app/legacy/module/command/uploadFile.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useUploadFileCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('uploadFile', {
		onLoad() {
			getFocus(document.getElementById('uploadFile-url'));
		}
	});
	const onSave = (): void => {
		const url = read(document.getElementById('uploadFile-url')) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus(document.getElementById('uploadFile-url'));
			return;
		}
		const path = read(document.getElementById('uploadFile-path')) ?? form.path;
		if (!path || VariableGetter.isNone!(path)) {
			getFocus(document.getElementById('uploadFile-path'));
			return;
		}
		commit({
			url,
			method: read(document.getElementById('uploadFile-method')) ?? form.method,
			path,
			field: read(document.getElementById('uploadFile-field')) ?? form.field,
			headers: read(document.getElementById('uploadFile-header')) ?? form.header,
			callback: read(document.getElementById('uploadFile-callback')) ?? form.callback,
			rateCallback:
				read(document.getElementById('uploadFile-rateCallback')) ?? form.rateCallback
		});
	};
	Command.cases.uploadFile.customSave = onSave;
	return { form, save: onSave, load };
}
