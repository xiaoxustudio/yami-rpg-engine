import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.webSocketClose = new CommandSchema({
	name: 'webSocketClose',
	fields: [
		{ key: 'id', default: '' },
		{ key: 'code', default: '' },
		{ key: 'reason', default: '' }
	],
	customParse({ id = '', code = '', reason = '' }) {
		const head = [
			{ color: 'network' },
			{ text: t('command.webSocketClose') },
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: id }
		];
		if (code !== '' && code !== null && code !== undefined) {
			head.push({ text: ' , ' }, { text: String(code) });
		}
		if (reason) {
			head.push({ text: ' , ' }, { text: reason });
		}
		return head;
	}
});

export function useWebSocketCloseCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('webSocketClose', {
		onLoad() {
			getFocus(document.getElementById('webSocketClose-id'));
		}
	});
	const onSave = (): void => {
		const elId = document.getElementById('webSocketClose-id');
		const id = read(elId) ?? form.id;
		if (!id || VariableGetter.isNone!(id)) {
			getFocus(elId);
			return;
		}
		const code = read(document.getElementById('webSocketClose-code')) ?? form.code;
		commit({
			id,
			code: code === '' ? '' : Number(code),
			reason: read(document.getElementById('webSocketClose-reason')) ?? form.reason
		});
	};
	Command.cases.webSocketClose.customSave = onSave;
	return { form, save: onSave, load };
}
