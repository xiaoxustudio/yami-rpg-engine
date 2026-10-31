import { disable, enable } from '@app/utils/element-utils';
import { composableEls } from '@app/composables/element-registry';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
		method,
		headers,
		data,
		callback,
		rateCallback,
		isBackground = false,
		isBackgroundPath
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
	const { form, load, commit } = useCommandSchema('downloadFile', {
		skipWrite: true,
		onLoad() {
			requestFocus('downloadFile-url');
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		if (params.isBackground) {
			enable(composableEls.get('downloadFile-isBackground-path') as HTMLElement);
		} else {
			disable(composableEls.get('downloadFile-isBackground-path') as HTMLElement);
		}
		load(params);
	};
	const onSave = (): void => {
		const url = form.url;
		if (!url || VariableGetter.isNone!(url as { key: string })) {
			requestFocus('downloadFile-url');
			return;
		}
		commit({
			url,
			method: form.method,
			headers: form.header,
			data: form.data,
			callback: form.callback,
			rateCallback: form.rateCallback,
			isBackground: form.isBackground,
			isBackgroundPath: form.isBackgroundPath
		});
	};
	Command.cases.downloadFile.customLoad = onLoad;
	Command.cases.downloadFile.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
