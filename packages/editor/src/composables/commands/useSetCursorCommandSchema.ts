/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setCursor = new CommandSchema({
	name: 'setCursor',
	fields: [{ key: 'image', default: '' }],
	customParse({ image }: { image: unknown }) {
		return [
			{ color: 'system' },
			{ text: t('command.setCursor') + Token(': ') },
			{ text: Command.parseFileName(image) }
		];
	}
});

export function useSetCursorCommandSchema() {
	return useCommandSchema('setCursor', {
		onLoad() {
			getFocus(document.getElementById('setCursor-image'));
		}
	});
}
