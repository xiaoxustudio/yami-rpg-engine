import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import type { ControlApi } from '@app/composables/control-refs';

Command.cases.setVolume = new CommandSchema({
	name: 'setVolume',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'volume', default: 1 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		type,
		volume,
		easingId,
		duration,
		wait
	}: {
		type: unknown;
		volume: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseAudioType!(type))
			.push(Command.parseVariableNumber!(volume))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'audio' },
			{ text: t('command.setVolume') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export interface SetVolumeSchemaOptions {
	/**
	 * 窗口的控件表 getter（`useControlRefs` 建的那张）。
	 *
	 * 这条命令走 `useCommandSchema` 的**默认写路径**（`${name}-${field.domId ?? field.key}`），
	 * 没有这张表就只能按 id 从注册表取裸元素；窗口迁成模板 ref 后那条路会静默写不进控件。
	 */
	controls?: () => Partial<Record<string, ControlApi | null>>;
}

export function useSetVolumeCommandSchema(options: SetVolumeSchemaOptions = {}) {
	return useCommandSchema('setVolume', {
		controls: options.controls,
		onLoad() {
			requestFocus('setVolume-type');
		}
	});
}
