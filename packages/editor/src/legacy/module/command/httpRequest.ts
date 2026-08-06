import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { RequestkeyValueBind } from './requestURL.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.httpRequest = new CommandSchema({
	name: 'httpRequest',
	onInitialize() {
		$('#httpRequest-method').loadItems([
			{ name: 'GET', value: 'GET' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
			{ name: 'DELETE', value: 'DELETE' },
			{ name: 'PATCH', value: 'PATCH' }
		]);
		$('#httpRequest-responseType').loadItems([
			{ name: 'JSON', value: 'json' },
			{ name: 'Text', value: 'text' },
			{ name: 'Blob', value: 'blob' },
			{ name: 'ArrayBuffer', value: 'arraybuffer' },
			{ name: 'Document', value: 'document' },
			{ name: 'Stream', value: 'stream' }
		]);
		write($('#httpRequest-method'), 'GET');
		write($('#httpRequest-url'), '');
		$('#httpRequest-header').bind(RequestkeyValueBind);
		$('#httpRequest-data').bind(RequestkeyValueBind);
		write($('#httpRequest-timeout'), '');
		write($('#httpRequest-responseType'), 'json');
		write($('#httpRequest-withCredentials'), false);
		write($('#httpRequest-authUser'), '');
		write($('#httpRequest-authPass'), '');
		$('#httpRequest-confirm')?.on('click', () => this.save!());
	},
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
	}: any) {
		const head = [
			{ color: 'network' },
			{ text: Local.get!('command.httpRequest') },
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
		const contents = [] as any[];
		for (const i of headers) {
			contents.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${typeof i.key === 'string' ? i.key : Command.parseVariable!(i.key, 'any')} = ${typeof i.value === 'string' ? i.value : Command.parseVariable!(i.value, 'any')}`
				}
			);
		}
		const datas = [] as any[];
		for (const i of data) {
			datas.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${typeof i.key === 'string' ? i.key : Command.parseVariable!(i.key, 'any')} = ${typeof i.value === 'string' ? i.value : Command.parseVariable!(i.value, 'any')}`
				}
			);
		}
		const extra = [] as any[];
		if (timeout !== '' && timeout !== null && timeout !== undefined) {
			extra.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${Local.get!('command.httpRequestTimeout')} = ${timeout}`
				}
			);
		}
		extra.push(
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text: `${Local.get!('command.httpRequestResponseType')} = ${responseType}`
			}
		);
		if (withCredentials) {
			extra.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{ text: Local.get!('command.httpRequestWithCredentials') }
			);
		}
		if (authUser || authPass) {
			extra.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${Local.get!('command.httpRequestAuth')} = ${authUser}`
				}
			);
		}
		return head.concat(
			contents.slice(1),
			{ text: `, ${Local.get!('command.httpRequestData')} = ` },
			datas.slice(1),
			...extra
		);
	},
	customLoad({
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
	}) {
		write($('#httpRequest-method'), method);
		write($('#httpRequest-callback'), callback);
		write($('#httpRequest-url'), url);
		write($('#httpRequest-timeout'), timeout ?? '');
		write($('#httpRequest-responseType'), responseType);
		write($('#httpRequest-withCredentials'), withCredentials);
		write($('#httpRequest-authUser'), authUser);
		write($('#httpRequest-authPass'), authPass);
		getFocus($('#httpRequest-url'));
		const writer = getElementWriter('httpRequest');
		writer('header', headers);
		writer('data', data);
	},
	customSave() {
		const elVariable = $('#httpRequest-url');
		const variable = read(elVariable);
		if (!variable || VariableGetter.isNone!(variable)) {
			return getFocus(elVariable);
		}
		const elementReader = getElementReader('httpRequest');
		const timeout = elementReader('timeout');
		Command.save!({
			url: variable,
			method: elementReader('method'),
			headers: elementReader('header'),
			data: elementReader('data'),
			callback: elementReader('callback'),
			timeout: timeout === '' ? '' : Number(timeout),
			responseType: elementReader('responseType'),
			withCredentials: elementReader('withCredentials'),
			authUser: elementReader('authUser'),
			authPass: elementReader('authPass')
		});
	}
});
