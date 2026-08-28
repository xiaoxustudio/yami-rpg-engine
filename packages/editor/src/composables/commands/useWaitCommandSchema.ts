/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.wait = new CommandSchema({
	name: 'wait',
	fields: [{ key: 'duration', domId: 'duration', default: 1 }],
	customParse({ duration }: { duration: unknown }) {
		return [
			{ color: 'wait' },
			{ text: t('command.wait') + Token(': ') },
			{ text: Command.parseVariableNumber(duration, 'ms') }
		];
	}
});

export function useWaitCommandSchema() {
	return useCommandSchema('wait', {
		onLoad() {
			getFocus(document.getElementById('wait-duration'), 'all');
		}
	});
}
