import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.removeTarget = new CommandSchema({
	name: 'removeTarget',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } }
	],
	customParse({ actor, target }: { actor: unknown; target: unknown }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target));
		return [
			{ color: 'actor' },
			{ text: t('command.removeTarget') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useRemoveTargetCommandSchema() {
	return useCommandSchema('removeTarget', {
		skipWrite: true,
		onLoad() {
			requestFocus('removeTarget-actor');
		}
	});
}
