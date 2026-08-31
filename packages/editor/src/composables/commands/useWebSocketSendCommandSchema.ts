/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus, read } from '@app/utils/element-utils';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.webSocketSend = new CommandSchema({
	name: 'webSocketSend',
	fields: [
		{ key: 'id', default: '' },
		{ key: 'data', default: '' }
	],
	customParse({ id = '', data = '' }) {
		return [
			{ color: 'network' },
			{ text: t('command.webSocketSend') },
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: id },
			{ text: ' , ' },
			{
				text:
					typeof data === 'string'
						? data.length > 20
							? data.substring(0, 20) + '...'
							: data
						: Command.parseVariable!(data, 'any')
			}
		];
	}
});

export function useWebSocketSendCommandSchema() {
	const { form, load, commit } = useCommandSchema('webSocketSend', {
		onLoad() {
			getFocus(document.getElementById('webSocketSend-id'));
		}
	});
	const onSave = (): void => {
		const elId = document.getElementById('webSocketSend-id');
		const id = read(elId) ?? form.id;
		if (!id || VariableGetter.isNone!(id)) {
			getFocus(elId);
			return;
		}
		const elData = document.getElementById('webSocketSend-data');
		const data = read(elData) ?? form.data;
		if (!data || VariableGetter.isNone!(data)) {
			getFocus(elData);
			return;
		}
		commit({ id, data });
	};
	Command.cases.webSocketSend.customSave = onSave;
	return { form, save: onSave, load };
}
