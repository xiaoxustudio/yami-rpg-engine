/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setCooldown = new CommandSchema({
	name: 'setCooldown',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set' },
		{
			key: 'key',
			default: () => Enum.getDefStringId!('cooldown-key'),
			required: true
		},
		{ key: 'cooldown', default: 0 }
	],
	customParse({
		actor,
		operation,
		key,
		cooldown
	}: {
		actor: unknown;
		operation: string;
		key: unknown;
		cooldown: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.setCooldown.' + operation))
			.push(Command.parseVariableEnum!('cooldown-key', key))
			.push(Command.parseVariableNumber!(cooldown, 'ms'));
		return [
			{ color: 'inventory' },
			{ text: t('command.setCooldown') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetCooldownCommandSchema() {
	return useCommandSchema('setCooldown', {
		skipWrite: true,
		onLoad() {
			const el = document.getElementById('setCooldown-key')!;
			el.loadItems(Enum.getStringItems!('cooldown-key'));
			requestFocus('setCooldown-actor');
		}
	});
}
