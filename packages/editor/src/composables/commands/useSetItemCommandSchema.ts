/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setItem = new CommandSchema({
	name: 'setItem',
	fields: [
		{ key: 'item', default: { type: 'trigger' } },
		{ key: 'operation', default: 'increase' },
		{ key: 'quantity', default: 1 }
	],
	customParse({
		item,
		operation,
		quantity
	}: {
		item: unknown;
		operation: string;
		quantity: unknown;
	}) {
		const words = Command.words
			.push(Command.parseItem!(item))
			.push(t('command.setItem.' + operation));
		switch (operation) {
			case 'increase':
			case 'decrease':
				words.push(Command.parseVariableNumber!(quantity));
				break;
		}
		return [
			{ color: 'inventory' },
			{ text: t('command.setItem') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetItemCommandSchema() {
	return useCommandSchema('setItem', {
		onLoad() {
			getFocus(document.getElementById('setItem-item'));
		}
	});
}
