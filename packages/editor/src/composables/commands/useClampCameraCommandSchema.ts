/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.clampCamera = new CommandSchema({
	name: 'clampCamera',
	fields: [
		{ key: 'left', default: 0 },
		{ key: 'top', default: 0 },
		{ key: 'right', default: 0 },
		{ key: 'bottom', default: 0 }
	],
	customParse({
		left,
		top,
		right,
		bottom
	}: {
		left: unknown;
		top: unknown;
		right: unknown;
		bottom: unknown;
	}) {
		const words = Command.words
			.push(t('command.clampCamera.left') + Token(' = ') + Command.parseVariableNumber(left))
			.push(t('command.clampCamera.top') + Token(' = ') + Command.parseVariableNumber(top))
			.push(
				t('command.clampCamera.right') + Token(' = ') + Command.parseVariableNumber(right)
			)
			.push(
				t('command.clampCamera.bottom') + Token(' = ') + Command.parseVariableNumber(bottom)
			);
		return [
			{ color: 'scene' },
			{ text: t('command.clampCamera') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useClampCameraCommandSchema() {
	return useCommandSchema('clampCamera', {
		onLoad() {
			getFocus(document.getElementById('clampCamera-left')!, 'all');
		}
	});
}
