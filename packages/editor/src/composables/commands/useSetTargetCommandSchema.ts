/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setTarget = new CommandSchema({
	name: 'setTarget',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }: { actor: unknown }) {
		return [
			{ color: 'actor' },
			{ text: t('command.setTarget') + Token(': ') },
			{ text: Command.parseActor(actor) }
		];
	}
});

export function useSetTargetCommandSchema() {
	return useCommandSchema('setTarget', {
		onLoad() {
			getFocus(document.getElementById('setTarget-actor'));
		}
	});
}
