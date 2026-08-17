import '@app/legacy/module/command/downloadFile.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { disable, enable, getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDownloadFileCommandSchema() {
	const { form, save, load } = useCommandSchema('downloadFile', {
		onLoad() {
			getFocus($('#downloadFile-url'));
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		if (params.isBackground) {
			enable($('#downloadFile-isBackground-path'));
		} else {
			disable($('#downloadFile-isBackground-path'));
		}
		load(params);
	};
	const onSave = (): void => {
		const url = read($('#downloadFile-url')) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus($('#downloadFile-url'));
			return;
		}
		Command.save?.({
			url,
			method: read($('#downloadFile-method')) ?? form.method,
			headers: read($('#downloadFile-header')) ?? form.header,
			data: read($('#downloadFile-data')) ?? form.data,
			callback: read($('#downloadFile-callback')) ?? form.callback,
			rateCallback: read($('#downloadFile-rateCallback')) ?? form.rateCallback,
			isBackground: read($('#downloadFile-isBackground')) ?? form.isBackground,
			isBackgroundPath: read($('#downloadFile-isBackground-path')) ?? form.isBackgroundPath
		});
	};
	Command.cases.downloadFile.customLoad = onLoad;
	Command.cases.downloadFile.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
