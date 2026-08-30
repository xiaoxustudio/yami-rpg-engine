/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setResolution = new CommandSchema({
	name: 'setResolution',
	fields: [
		{ key: 'width', default: 1920 },
		{ key: 'height', default: 1080 },
		{ key: 'sceneScale', default: 1 },
		{ key: 'uiScale', default: 1 }
	],
	customParse({
		width,
		height,
		sceneScale,
		uiScale
	}: {
		width: unknown;
		height: unknown;
		sceneScale: unknown;
		uiScale: unknown;
	}) {
		const words = Command.words
			.push(
				Command.parseVariableNumber(width) +
					Token(' x ') +
					Command.parseVariableNumber(height)
			)
			.push(Command.parseVariableNumber(sceneScale))
			.push(Command.parseVariableNumber(uiScale));
		return [
			{ color: 'system' },
			{ text: t('command.setResolution') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetResolutionCommandSchema() {
	return useCommandSchema('setResolution', {
		onLoad() {
			getFocus(document.getElementById('setResolution-width'), 'all');
		}
	});
}
