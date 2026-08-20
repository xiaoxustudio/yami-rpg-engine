import '@app/legacy/module/command/downloadFile.ts';
import { disable, enable, getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDownloadFileCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('downloadFile', {
		onLoad() {
			getFocus(document.getElementById('downloadFile-url')!);
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		if (params.isBackground) {
			enable(document.getElementById('downloadFile-isBackground-path')!);
		} else {
			disable(document.getElementById('downloadFile-isBackground-path')!);
		}
		load(params);
	};
	const onSave = (): void => {
		const url = read(document.getElementById('downloadFile-url')!) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus(document.getElementById('downloadFile-url')!);
			return;
		}
		commit({
			url,
			method: read(document.getElementById('downloadFile-method')!) ?? form.method,
			headers: read(document.getElementById('downloadFile-header')!) ?? form.header,
			data: read(document.getElementById('downloadFile-data')!) ?? form.data,
			callback: read(document.getElementById('downloadFile-callback')!) ?? form.callback,
			rateCallback:
				read(document.getElementById('downloadFile-rateCallback')!) ?? form.rateCallback,
			isBackground:
				read(document.getElementById('downloadFile-isBackground')!) ?? form.isBackground,
			isBackgroundPath:
				read(document.getElementById('downloadFile-isBackground-path')!) ??
				form.isBackgroundPath
		});
	};
	Command.cases.downloadFile.customLoad = onLoad;
	Command.cases.downloadFile.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
