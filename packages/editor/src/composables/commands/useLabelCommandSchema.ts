/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.label = new CommandSchema({
	name: 'label',
	fields: [{ key: 'name', domId: 'name', default: '', required: true, trim: true }],
	customParse({ name }: { name: string }) {
		return [
			{ color: 'flow' },
			{ text: t('command.label') + Token(': ') },
			{ color: 'label' },
			{ text: name }
		];
	}
});

export function useLabelCommandSchema() {
	return useCommandSchema('label', {
		onLoad() {
			getFocus(document.getElementById('label-name')!, 'all');
		}
	});
}
