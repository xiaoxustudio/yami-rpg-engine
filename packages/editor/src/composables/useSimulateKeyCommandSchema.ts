import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.simulateKey = new CommandSchema({
	name: 'simulateKey',
	fields: [
		{ key: 'operation', default: 'click' },
		{ key: 'keycode', default: '' }
	],
	customParse({ operation, keycode }: { operation: string; keycode: unknown }) {
		const words = Command.words
			.push(t('command.simulateKey.' + operation))
			.push(Command.setStringColor!(keycode));
		return [
			{ color: 'system' },
			{ text: t('command.simulateKey') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSimulateKeyCommandSchema() {
	return useCommandSchema('simulateKey', {
		onLoad() {
			requestFocus('simulateKey-operation');
		}
	});
}
