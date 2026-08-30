/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

Command.cases.httpRequest = new CommandSchema({
	name: 'httpRequest',
	fields: [
		{ key: 'url', default: '' },
		{ key: 'method', default: 'GET' },
		{ key: 'headers', default: [], domId: 'header' },
		{ key: 'data', default: [], domId: 'data' },
		{ key: 'callback', default: '' },
		{ key: 'timeout', default: '' },
		{ key: 'responseType', default: 'json' },
		{ key: 'withCredentials', default: false },
		{ key: 'authUser', default: '' },
		{ key: 'authPass', default: '' }
	],
	customParse({
		url = '',
		method,
		headers,
		data,
		callback,
		timeout,
		responseType,
		withCredentials = false,
		authUser,
		authPass = ''
	}: {
		url: unknown;
		method: string;
		headers: Array<{ key: unknown; value: unknown }>;
		data: Array<{ key: unknown; value: unknown }>;
		callback: string;
		timeout: string;
		responseType: string;
		withCredentials: unknown;
		authUser: string;
		authPass: unknown;
	}) {
		const head: Array<{ text?: string; color?: string }> = [
			{ color: 'network' },
			{ text: t('command.httpRequest') },
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text: typeof url === 'string' ? url : Command.parseVariable!(url, 'any')
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
		const extra: Array<{ text?: string; color?: string }> = [];
		if (timeout !== '' && timeout !== null && timeout !== undefined) {
			extra.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${t('command.httpRequestTimeout')} = ${timeout}`
				}
			);
		}
		extra.push(
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text: `${t('command.httpRequestResponseType')} = ${responseType}`
			}
		);
		if (withCredentials) {
			extra.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{ text: t('command.httpRequestWithCredentials') }
			);
		}
		if (authUser || authPass) {
			extra.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${t('command.httpRequestAuth')} = ${authUser}`
				}
			);
		}
		return head.concat(
			contents.slice(1),
			{ text: `, ${t('command.httpRequestData')} = ` },
			datas.slice(1),
			...extra
		);
	}
});

export function useHttpRequestCommandSchema() {
	const { form, load, commit } = useCommandSchema('httpRequest', {
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
		commit({
			url,
			method: read(document.getElementById('httpRequest-method')!) ?? form.method,
			headers: form.headers,
			data: form.data,
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
