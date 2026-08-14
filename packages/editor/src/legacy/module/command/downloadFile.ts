import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { disable, enable, getFocus, read, write } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { RequestkeyValueBind } from './requestURL.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.downloadFile = new CommandSchema({
	name: 'downloadFile',
	onInitialize() {
		$('#downloadFile-method')?.loadItems?.([
			{ name: 'GET', value: 'GET' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
			{ name: 'DELETE', value: 'DELETE' }
		]);
		$('#downloadFile-isBackground')?.relate?.([$('#downloadFile-isBackground-path')]);
		disable($('#downloadFile-isBackground-path'));
		write($('#downloadFile-method'), 'GET');
		write($('#downloadFile-url'), '');
		write($('#downloadFile-isBackground-path'), '');
		$('#downloadFile-header')?.bind?.(RequestkeyValueBind);
		$('#downloadFile-data')?.bind?.(RequestkeyValueBind);
	},
	isBackgroundInput(event: Event & { value?: boolean }) {
		if (event.value) enable($('#downloadFile-isBackground-path'));
		else disable($('#downloadFile-isBackground-path'));
	},
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
			{ text: Local.get!('command.downloadFile') },
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
			{ text: `, ${Local.get!('command.downloadFileData')} = ` },
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
	},
	customLoad({
		url = '',
		method = 'GET',
		headers = [],
		data = [],
		callback = '',
		rateCallback = '',
		isBackground = false,
		isBackgroundPath = ''
	}) {
		write($('#downloadFile-method'), method);
		write($('#downloadFile-callback'), callback);
		write($('#downloadFile-url'), url);
		write($('#downloadFile-isBackground'), isBackground);
		write($('#downloadFile-isBackground-path'), isBackgroundPath);
		getFocus($('#downloadFile-url'));
		const elementWriter = getElementWriter('downloadFile');
		elementWriter('header', headers);
		elementWriter('data', data);
	},
	customSave() {
		const elVariable = $('#downloadFile-url');
		const variable = read(elVariable);
		if (!variable || VariableGetter.isNone!(variable)) {
			return getFocus(elVariable);
		}
		const elementReader = getElementReader('downloadFile');
		Command.save!({
			url: variable,
			method: elementReader('method'),
			headers: elementReader('header'),
			data: elementReader('data'),
			callback: elementReader('callback'),
			rateCallback: elementReader('rateCallback'),
			isBackground: elementReader('isBackground'),
			isBackgroundPath: elementReader('isBackground-path')
		});
	}
});
