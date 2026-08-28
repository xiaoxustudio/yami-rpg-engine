/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setPlayerActor = new CommandSchema({
	name: 'setPlayerActor',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }: { actor: unknown }) {
		return [
			{ color: 'actor' },
			{ text: t('command.setPlayerActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		];
	}
});

export function useSetPlayerActorCommandSchema() {
	return useCommandSchema('setPlayerActor', {
		onLoad() {
			getFocus(document.getElementById('setPlayerActor-actor'));
		}
	});
}
