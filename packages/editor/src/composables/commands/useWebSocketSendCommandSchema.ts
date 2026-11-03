import { Command } from '@app/commands/command-object.ts';
import type { ControlApi } from '@app/composables/control-refs';
import { getWebSocketSendBridge } from '@app/composables/web-socket-send-bridge';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

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

/**
 * `controls` 由窗口交出（`useControlRefs` 建的表）：默认写路径按 `${name}-${field}` 去注册表取
 * 元素，窗口迁成模板 ref 后取不到 —— 不传就会在 edit 路径静默写不进控件。
 */
export function useWebSocketSendCommandSchema(
	controls?: () => Partial<Record<string, ControlApi | null>>
) {
	const { form, load, commit } = useCommandSchema('webSocketSend', {
		controls,
		onLoad() {
			requestFocus('webSocketSend-id');
		}
	});
	const onSave = (): void => {
		const id = (getWebSocketSendBridge()?.getId() ?? form.id) as { key: string };
		if (!id || VariableGetter.isNone!(id)) {
			getWebSocketSendBridge()?.focusId();
			return;
		}
		const data = (getWebSocketSendBridge()?.getData() ?? form.data) as { key: string };
		if (!data || VariableGetter.isNone!(data)) {
			getWebSocketSendBridge()?.focusData();
			return;
		}
		commit({ id, data });
	};
	Command.cases.webSocketSend.customSave = onSave;
	return { form, save: onSave, load };
}
