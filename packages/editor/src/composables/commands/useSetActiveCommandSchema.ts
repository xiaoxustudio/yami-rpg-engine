/* oxlint-disable eslint/no-restricted-properties */
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

type SetActiveData = {
	actor: unknown;
	active: boolean;
	[k: string]: unknown;
};

Command.cases.setActive = new CommandSchema({
	name: 'setActive',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'active', default: false }
	],
	customParse({ actor, active }: SetActiveData) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.setActive.active.' + active));
		return [
			{ color: 'actor' },
			{ text: t('command.setActive') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetActiveCommandSchema() {
	return useCommandSchema('setActive', {
		skipWrite: true,
		onLoad() {
			requestFocus('setActive-actor');
		}
	});
}
