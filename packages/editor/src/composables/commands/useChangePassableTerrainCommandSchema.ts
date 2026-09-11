import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.changePassableTerrain = new CommandSchema({
	name: 'changePassableTerrain',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'passage', default: 'land' }
	],
	customParse({ actor, passage }: { actor: unknown; passage: string }) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.changePassableTerrain.' + passage));
		return [
			{ color: 'actor' },
			{ text: t('command.changePassableTerrain') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useChangePassableTerrainCommandSchema() {
	return useCommandSchema('changePassableTerrain', {
		skipWrite: true,
		onLoad() {
			requestFocus('changePassableTerrain-actor');
		}
	});
}
