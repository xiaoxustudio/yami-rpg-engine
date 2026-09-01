/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

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
			// oxlint-disable-next-line no-base-to-string
			head.push({ text: ' , ' }, { text: String(code) });
		}
		if (reason) {
			head.push({ text: ' , ' }, { text: reason });
		}
		return head;
	}
});

export function useWebSocketCloseCommandSchema() {
	const { form, load, commit } = useCommandSchema('webSocketClose', {
		skipWrite: true,
		onLoad() {
			requestFocus('webSocketClose-id');
		}
	});
	const onSave = (): void => {
		const id = form.id;
		if (!id || VariableGetter.isNone!(id as { key: string })) {
			requestFocus('webSocketClose-id');
			return;
		}
		const code = form.code;
		commit({
			id,
			code: code === '' ? '' : Number(code),
			reason: form.reason
		});
	};
	Command.cases.webSocketClose.customSave = onSave;
	return { form, save: onSave, load };
}
