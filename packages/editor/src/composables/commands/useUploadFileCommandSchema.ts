import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.uploadFile = new CommandSchema({
	name: 'uploadFile',
	fields: [
		{ key: 'url', default: '' },
		{ key: 'method', default: 'POST' },
		{ key: 'path', default: '' },
		{ key: 'field', default: 'file' },
		{ key: 'header', default: [] },
		{ key: 'callback', default: '' },
		{ key: 'rateCallback', default: '' }
	],
	customParse({
		url = '',
		method,
		path = '',
		field,
		headers,
		callback,
		rateCallback
	}: {
		url: unknown;
		method: string;
		path: unknown;
		field: string;
		headers: Array<{ key: unknown; value: unknown }>;
		callback: string;
		rateCallback: string;
	}) {
		const head: Array<{ text?: string; color?: string }> = [
			{ color: 'network' },
			{ text: t('command.uploadFile') },
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
		return head.concat(
			contents.slice(1),
			{ text: `, ${t('command.uploadFilePath')} = ` },
			{ color: 'normal' },
			{
				text: typeof path === 'string' ? path : Command.parseVariable!(path, 'any')
			},
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: field },
			{ text: ' , ' },
			{ text: rateCallback }
		);
	}
});

export function useUploadFileCommandSchema() {
	const { form, load, commit } = useCommandSchema('uploadFile', {
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
			headers: form.header,
			callback: read(document.getElementById('uploadFile-callback')) ?? form.callback,
			rateCallback:
				read(document.getElementById('uploadFile-rateCallback')) ?? form.rateCallback
		});
	};
	Command.cases.uploadFile.customSave = onSave;
	return { form, save: onSave, load };
}
