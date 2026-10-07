import { read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Window } from '@app/tools/window-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getCommandFormsStore } from '@app/stores/command-forms';
import type { RequestKeyValueForm } from '@app/stores/command-forms';

export type RequestKeyValue = RequestKeyValueForm;

export const requestKeyValueForm: RequestKeyValueForm = {
	get key() {
		return getCommandFormsStore().requestKeyValueForm.key;
	},
	set key(value: string | { key: string }) {
		getCommandFormsStore().requestKeyValueForm.key = value;
	},
	get value() {
		return getCommandFormsStore().requestKeyValueForm.value;
	},
	set value(value: string | { key: string }) {
		getCommandFormsStore().requestKeyValueForm.value = value;
	}
};

export const RequestkeyValueBind = {
	target: null as (string & { save?: () => unknown }) | null,
	type: null as string | null,
	initialize() {
		this.target = null;
		this.type = 'request-header';
	},
	parse(i: RequestKeyValue) {
		return `${typeof i.key === 'string' ? i.key : i.key.key} = ${typeof i.value === 'string' ? i.value : i.value.key}`;
	},
	open(item: RequestKeyValue | null) {
		Window.open!('request-keyValue');
		requestKeyValueForm.key = item?.key ?? '';
		requestKeyValueForm.value = item?.value ?? '';
		requestFocus('request-keyValue-key');
	},
	save() {
		const data = { key: requestKeyValueForm.key, value: requestKeyValueForm.value };
		const headers = read(this.target as string);
		if (headers.some((item: RequestKeyValue) => item.key === data.key)) {
			headers.splice(
				headers.findIndex((item: RequestKeyValue) => item.key === data.key),
				1,
				data
			);
		}
		if (!data.key) {
			return requestFocus('request-keyValue-key');
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
		method,
		headers,
		data,
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
	const { form, load, commit } = useCommandSchema('requestURL', {
		skipWrite: true,
		onLoad() {
			requestFocus('requestURL-url');
		}
	});
	const onSave = (): void => {
		const url = form.url;
		if (!url || VariableGetter.isNone!(url as { key: string })) {
			requestFocus('requestURL-url');
			return;
		}
		commit({
			url,
			method: form.method,
			headers: form.headers,
			data: form.data,
			callback: form.callback
		});
	};
	Command.cases.requestURL.customSave = onSave;
	return { form, save: onSave, load };
}
