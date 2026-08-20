import { disable, enable, getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.downloadFile = new CommandSchema({
	name: 'downloadFile',
	fields: [
		{ key: 'url', default: '' },
		{ key: 'method', default: 'GET' },
		{ key: 'header', default: [] },
		{ key: 'data', default: [] },
		{ key: 'callback', default: '' },
		{ key: 'rateCallback', default: '' },
		{ key: 'isBackground', default: false },
		{ key: 'isBackgroundPath', domId: 'isBackground-path', default: '' }
	],
	customParse({
		url = '',
		method = 'GET',
		headers = [],
		data = [],
		callback = '',
		rateCallback = '',
		isBackground = false,
		isBackgroundPath = ''
	}: {
		url: unknown;
		method: string;
		headers: Array<{ key: unknown; value: unknown }>;
		data: Array<{ key: unknown; value: unknown }>;
		callback: string;
		rateCallback: string;
		isBackground: unknown;
		isBackgroundPath: string;
	}) {
		const head: Array<{ text?: string; color?: string }> = [
			{ color: 'network' },
			{ text: t('command.downloadFile') },
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text:
					typeof url === 'string'
						? url.length > 20
							? url.substring(0, 20) + '...'
							: url
						: Command.parseVariable!(url, 'any')
			},
			{ text: ' , ' },
			{ text: method },
			{ text: ' , ' },
			{ text: callback },
			{ text: ' , ' },
			{ text: rateCallback },
			{ text: ' -> ' }
		];
		const contents: Array<{ text?: string; color?: string }> = [];
		for (const i of headers) {
			contents.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${typeof i.key === 'string' ? i.key : Command.parseVariable!(i.key, 'any')} = ${typeof i.value === 'string' ? i.value : Command.parseVariable!(i.value, 'any')}`
				}
			);
		}
		const datas: Array<{ text?: string; color?: string }> = [];
		for (const i of data) {
			datas.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${typeof i.key === 'string' ? i.key : Command.parseVariable!(i.key, 'any')} = ${typeof i.value === 'string' ? i.value : Command.parseVariable!(i.value, 'any')}`
				}
			);
		}
		return head.concat(
			contents.slice(1),
			{ text: `, ${t('command.downloadFileData')} = ` },
			datas.slice(1),
			{ text: ' , ' },
			{ color: 'normal' },
			...(isBackground
				? [
						{
							text: isBackground as string
						},
						{ text: ' , ' },
						{ text: isBackgroundPath }
					]
				: [])
		);
	}
});

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
