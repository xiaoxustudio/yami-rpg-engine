/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.waitForVideo = new CommandSchema({
	name: 'waitForVideo',
	fields: [{ key: 'element', domId: 'element', default: { type: 'trigger' } }],
	customParse({ element }: { element: unknown }) {
		return [
			{ color: 'element' },
			{ text: t('command.waitForVideo') + Token(': ') },
			{ text: Command.parseElement(element) }
		];
	}
});

export function useWaitForVideoCommandSchema() {
	return useCommandSchema('waitForVideo', {
		onLoad() {
			getFocus(document.getElementById('waitForVideo-element'));
		}
	});
}
