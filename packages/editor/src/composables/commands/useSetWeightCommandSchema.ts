import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setWeight = new CommandSchema({
	name: 'setWeight',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'weight', default: 0 }
	],
	customParse({ actor, weight }: { actor: unknown; weight: unknown }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseVariableNumber(weight));
		return [
			{ color: 'actor' },
			{ text: t('command.setWeight') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetWeightCommandSchema() {
	return useCommandSchema('setWeight', {
		skipWrite: true,
		onLoad() {
			requestFocus('setWeight-actor');
		}
	});
}
