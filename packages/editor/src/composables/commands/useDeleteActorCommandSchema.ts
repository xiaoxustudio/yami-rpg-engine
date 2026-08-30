/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

Command.cases.deleteActor = new CommandSchema({
	name: 'deleteActor',
	fields: [{ key: 'actor', domId: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }: { actor: unknown }) {
		return [
			{ color: 'actor' },
			{ text: t('command.deleteActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		];
	}
});

export function useDeleteActorCommandSchema() {
	return useCommandSchema('deleteActor', {
		onLoad() {
			getFocus(document.getElementById('deleteActor-actor')!);
		}
	});
}
