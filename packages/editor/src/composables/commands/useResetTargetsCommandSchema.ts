import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.resetTargets = new CommandSchema({
	name: 'resetTargets',
	fields: [{ key: 'actor', domId: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }: { actor: unknown }) {
		return [
			{ color: 'actor' },
			{ text: t('command.resetTargets') + Token(': ') },
			{ text: Command.parseActor(actor) }
		];
	}
});

export function useResetTargetsCommandSchema() {
	return useCommandSchema('resetTargets', {
		onLoad() {
			getFocus(document.getElementById('resetTargets-actor'));
		}
	});
}
