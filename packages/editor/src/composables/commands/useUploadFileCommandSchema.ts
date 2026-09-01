/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
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
		skipWrite: true,
		onLoad() {
			requestFocus('uploadFile-url');
		}
	});
	const onSave = (): void => {
		const url = form.url;
		if (!url || VariableGetter.isNone!(url as { key: string })) {
			requestFocus('uploadFile-url');
			return;
		}
		const path = form.path;
		if (!path || VariableGetter.isNone!(path as { key: string })) {
			requestFocus('uploadFile-path');
			return;
		}
		commit({
			url,
			method: form.method,
			path,
			field: form.field,
			headers: form.header,
			callback: form.callback,
			rateCallback: form.rateCallback
		});
	};
	Command.cases.uploadFile.customSave = onSave;
	return { form, save: onSave, load };
}
