import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import type { ControlApi } from '@app/composables/control-refs';

Command.cases.simulateKey = new CommandSchema({
	name: 'simulateKey',
	fields: [
		{ key: 'operation', default: 'click' },
		{ key: 'keycode', default: '' }
	],
	customParse({ operation, keycode }: { operation: string; keycode: unknown }) {
		const words = Command.words
			.push(t('command.simulateKey.' + operation))
			.push(Command.setStringColor!(keycode));
		return [
			{ color: 'system' },
			{ text: t('command.simulateKey') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export interface SimulateKeySchemaOptions {
	/**
	 * 窗口的控件表 getter（`useControlRefs` 建的那张）。
	 *
	 * 这条命令走 `useCommandSchema` 的**默认写路径**（`${name}-${field.domId ?? field.key}`），
	 * 窗口迁成模板 ref 后必须传表，否则 edit 路径会静默写不进控件。
	 */
	controls?: () => Partial<Record<string, ControlApi | null>>;
}

export function useSimulateKeyCommandSchema(options: SimulateKeySchemaOptions = {}) {
	return useCommandSchema('simulateKey', {
		controls: options.controls,
		onLoad() {
			requestFocus('simulateKey-operation');
		}
	});
}
