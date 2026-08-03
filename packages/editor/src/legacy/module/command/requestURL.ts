import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';
function getWindow() {
	return (window as any).Window;
}
export const RequestkeyValueBind = {
	target: null,
	type: null,
	initialize() {
		this.target = null;
		this.type = 'request-header';
		$('#request-keyValue-confirm')?.on('click', this.confirm);
	},
	parse(i: any) {
		return `${typeof i.key === 'string' ? i.key : i.key.key} = ${typeof i.value === 'string' ? i.value : i.value.key}`;
	},
	open(item: any) {
		getWindow().open('request-keyValue');
		if (!item) {
			write($('#request-keyValue-value'), '');
			write($('#request-keyValue-key'), '');
			getFocus($('#request-keyValue-key'));
		} else {
			write($('#request-keyValue-value'), item.value);
			write($('#request-keyValue-key'), item.key);
			getFocus($('#request-keyValue-key'));
		}
	},
	save() {
		const read = getElementReader('request-keyValue');
		const data = { key: read('key'), value: read('value') };
		const headers = read(this.target);
		if (headers.some((item: any) => item.key === data.key)) {
			headers.splice(
				headers.findIndex((item: any) => item.key === data.key),
				1,
				data
			);
		}
		if (!data.key) {
			return getFocus($('#request-keyValue-key'));
		}
		getWindow().close('request-keyValue');
		return data;
	},
	confirm() {
		return RequestkeyValueBind.target.save();
	}
};

// 请求RequestURL
Command.cases.requestURL = new CommandSchema({
	name: 'requestURL',
	onInitialize() {
		$('#requestURL-method').loadItems([
			{ name: 'GET', value: 'GET' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
			{ name: 'DELETE', value: 'DELETE' }
		]);
		write($('#requestURL-method'), 'GET');
		write($('#requestURL-url'), '');
		$('#requestURL-header').bind(RequestkeyValueBind);
		$('#requestURL-data').bind(RequestkeyValueBind);
		$('#requestURL-confirm')?.on('click', () => this.save());
	},
	customParse({ url = '', method = 'GET', headers = [], data = [], callback = '' }: any) {
		const head = [
			{ color: 'network' },
			{ text: Local.get('command.requestURL') },
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text: typeof url === 'string' ? url : Command.parseVariable(url, 'any')
			},
			{ text: ' , ' },
			{ text: method },
			{ text: ' , ' },
			{ text: callback },
			{ text: ' -> ' }
		];
		const contents = [];
		for (const i of headers) {
			contents.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${typeof i.key === 'string' ? i.key : Command.parseVariable(i.key, 'any')} = ${typeof i.value === 'string' ? i.value : Command.parseVariable(i.value, 'any')}`
				}
			);
		}
		const datas = [];
		for (const i of data) {
			datas.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${typeof i.key === 'string' ? i.key : Command.parseVariable(i.key, 'any')} = ${typeof i.value === 'string' ? i.value : Command.parseVariable(i.value, 'any')}`
				}
			);
		}
		return head.concat(
			contents.slice(1),
			{ text: `, ${Local.get('command.requestURLData')} = ` },
			datas.slice(1)
		);
	},
	customLoad({ url = '', method = 'GET', headers = [], data = [], callback = '' }) {
		write($('#requestURL-method'), method);
		write($('#requestURL-callback'), callback);
		write($('#requestURL-url'), url);
		getFocus($('#requestURL-url'));
		const writer = getElementWriter('requestURL');
		writer('header', headers);
		writer('data', data);
	},
	customSave() {
		const elVariable = $('#requestURL-url');
		const variable = read(elVariable);
		if (!variable || VariableGetter.isNone(variable)) {
			return getFocus(elVariable);
		}
		const reader = getElementReader('requestURL');
		Command.save({
			url: variable,
			method: reader('method'),
			headers: reader('header'),
			data: reader('data'),
			callback: reader('callback')
		});
	}
});
