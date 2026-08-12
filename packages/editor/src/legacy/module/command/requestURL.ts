import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

type RequestKeyValue = {
	key: string | { key: string };
	value: string | { key: string };
};

type RequestURLCommandData = {
	url?: string | { key: string };
	method?: string;
	headers?: RequestKeyValue[];
	data?: RequestKeyValue[];
	callback?: string;
};

export const RequestkeyValueBind = {
	target: null as unknown as (string & { save?: () => unknown }) | null,
	type: null as unknown as string | null,
	initialize() {
		this.target = null;
		this.type = 'request-header';
		$('#request-keyValue-confirm')?.on('click', this.confirm);
	},
	parse(i: RequestKeyValue) {
		return `${typeof i.key === 'string' ? i.key : i.key.key} = ${typeof i.value === 'string' ? i.value : i.value.key}`;
	},
	open(item: RequestKeyValue | null) {
		Window.open!('request-keyValue');
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
		const headers = read(this.target as unknown as string);
		if (headers.some((item: RequestKeyValue) => item.key === data.key)) {
			headers.splice(
				headers.findIndex((item: RequestKeyValue) => item.key === data.key),
				1,
				data
			);
		}
		if (!data.key) {
			return getFocus($('#request-keyValue-key'));
		}
		Window.close!('request-keyValue');
		return data;
	},
	confirm() {
		return RequestkeyValueBind.target?.save?.();
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
		$('#requestURL-confirm')?.on('click', () => this.save!());
	},
	customParse({
		url = '',
		method = 'GET',
		headers = [],
		data = [],
		callback = ''
	}: RequestURLCommandData) {
		const head: Array<{ text?: string; color?: string }> = [
			{ color: 'network' },
			{ text: Local.get!('command.requestURL') },
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
		return head.concat(
			contents.slice(1),
			{ text: `, ${Local.get!('command.requestURLData')} = ` },
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
		if (!variable || VariableGetter.isNone!(variable)) {
			return getFocus(elVariable);
		}
		const reader = getElementReader('requestURL');
		Command.save!({
			url: variable,
			method: reader('method'),
			headers: reader('header'),
			data: reader('data'),
			callback: reader('callback')
		});
	}
});
