import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
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
			getFocus(document.getElementById('simulateKey-operation'));
		}
	});
}
