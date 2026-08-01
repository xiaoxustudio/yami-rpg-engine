import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { RequestkeyValueBind } from './requestURL.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.uploadFile = new CommandSchema({
	name: 'uploadFile',
	onInitialize() {
		$('#uploadFile-method').loadItems([
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' }
		]);
		write($('#uploadFile-method'), 'POST');
		write($('#uploadFile-url'), '');
		write($('#uploadFile-path'), '');
		$('#uploadFile-header').bind(RequestkeyValueBind);
		write($('#uploadFile-field'), 'file');
		$('#uploadFile-confirm')?.on('click', () => this.save());
	},
	customParse({
		url = '',
		method = 'POST',
		path = '',
		field = 'file',
		headers = [],
		callback = '',
		rateCallback = ''
	}: any) {
		const head = [
			{ color: 'network' },
			{ text: Local.get('command.uploadFile') },
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text:
					typeof url === 'string'
						? url.length > 20
							? url.substring(0, 20) + '...'
							: url
						: Command.parseVariable(url, 'any')
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
		return head.concat(
			contents.slice(1),
			{ text: `, ${Local.get('command.uploadFilePath')} = ` },
			{ color: 'normal' },
			{
				text: typeof path === 'string' ? path : Command.parseVariable(path, 'any')
			},
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: field },
			{ text: ' , ' },
			{ text: rateCallback }
		);
	},
	customLoad({
		url = '',
		method = 'POST',
		path = '',
		field = 'file',
		headers = [],
		callback = '',
		rateCallback = ''
	}) {
		write($('#uploadFile-method'), method);
		write($('#uploadFile-callback'), callback);
		write($('#uploadFile-rateCallback'), rateCallback);
		write($('#uploadFile-url'), url);
		write($('#uploadFile-path'), path);
		write($('#uploadFile-field'), field);
		getFocus($('#uploadFile-url'));
		const writer = getElementWriter('uploadFile');
		writer('header', headers);
	},
	customSave() {
		const elVariable = $('#uploadFile-url');
		const variable = read(elVariable);
		if (!variable || VariableGetter.isNone(variable)) {
			return getFocus(elVariable);
		}
		const elPath = $('#uploadFile-path');
		const path = read(elPath);
		if (!path || VariableGetter.isNone(path)) {
			return getFocus(elPath);
		}
		const reader = getElementReader('uploadFile');
		Command.save({
			url: variable,
			method: reader('method'),
			path: path,
			field: reader('field'),
			headers: reader('header'),
			callback: reader('callback'),
			rateCallback: reader('rateCallback')
		});
	}
});
