import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
		method = 'GET',
		headers = [],
		data = [],
		callback = '',
		timeout = '',
		responseType = 'json',
		withCredentials = false,
		authUser = '',
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
