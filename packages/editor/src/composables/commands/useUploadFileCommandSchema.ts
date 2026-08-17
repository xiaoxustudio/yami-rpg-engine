import '@app/legacy/module/command/uploadFile.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useUploadFileCommandSchema() {
	const { form, save, load } = useCommandSchema('uploadFile', {
		onLoad() {
			getFocus($('#uploadFile-url'));
		}
	});
	const onSave = (): void => {
		const url = read($('#uploadFile-url')) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus($('#uploadFile-url'));
			return;
		}
		const path = read($('#uploadFile-path')) ?? form.path;
		if (!path || VariableGetter.isNone!(path)) {
			getFocus($('#uploadFile-path'));
			return;
		}
		Command.save?.({
			url,
			method: read($('#uploadFile-method')) ?? form.method,
			path,
			field: read($('#uploadFile-field')) ?? form.field,
			headers: read($('#uploadFile-header')) ?? form.header,
			callback: read($('#uploadFile-callback')) ?? form.callback,
			rateCallback: read($('#uploadFile-rateCallback')) ?? form.rateCallback
		});
	};
	Command.cases.uploadFile.customSave = onSave;
	return { form, save: onSave, load };
}
