import { getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { getElementReader, $ } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

export type RequestKeyValue = {
	key: string | { key: string };
	value: string | { key: string };
};

export const RequestkeyValueBind = {
	target: null as unknown as (string & { save?: () => unknown }) | null,
	type: null as unknown as string | null,
	initialize() {
		this.target = null;
		this.type = 'request-header';
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

Command.cases.requestURL = new CommandSchema({
	name: 'requestURL',
	fields: [
		{ key: 'url', default: '' },
		{ key: 'method', default: 'GET' },
		{ key: 'headers', default: [], domId: 'header' },
		{ key: 'data', default: [], domId: 'data' },
		{ key: 'callback', default: '' }
	],
	customParse({
		url = '',
		method = 'GET',
		headers = [],
		data = [],
		callback = ''
	}: {
		url: unknown;
		method: string;
		headers: RequestKeyValue[];
		data: RequestKeyValue[];
		callback: unknown;
	}) {
		const head: Array<{ text?: string; color?: string }> = [
			{ color: 'network' },
			{ text: t('command.requestURL') },
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
			{ text: `, ${t('command.requestURLData')} = ` },
			datas.slice(1)
		);
	}
});

export function useRequestURLCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('requestURL', {
		onLoad() {
			getFocus(document.getElementById('requestURL-url'));
		}
	});
	const onSave = (): void => {
		const url = read(document.getElementById('requestURL-url')) ?? form.url;
		if (!url || VariableGetter.isNone!(url)) {
			getFocus(document.getElementById('requestURL-url'));
			return;
		}
		commit({
			url,
			method: read(document.getElementById('requestURL-method')) ?? form.method,
			headers: form.headers,
			data: form.data,
			callback: read(document.getElementById('requestURL-callback')) ?? form.callback
		});
	};
	Command.cases.requestURL.customSave = onSave;
	return { form, save: onSave, load };
}
