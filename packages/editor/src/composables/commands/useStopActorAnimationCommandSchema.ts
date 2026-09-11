import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.stopActorAnimation = new CommandSchema({
	name: 'stopActorAnimation',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }: { actor: unknown }) {
		return [
			{ color: 'actor' },
			{ text: t('command.stopActorAnimation') + Token(': ') },
			{ text: Command.parseActor(actor) }
		];
	}
});

export function useStopActorAnimationCommandSchema() {
	return useCommandSchema('stopActorAnimation', {
		skipWrite: true,
		onLoad() {
			requestFocus('stopActorAnimation-actor');
		}
	});
}
