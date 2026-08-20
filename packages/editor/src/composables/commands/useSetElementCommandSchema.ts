import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setElement = new CommandSchema({
	name: 'setElement',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'operation', default: 'hide' }
	],
	customParse({ element, operation }: { element: unknown; operation: string }) {
		const words = Command.words
			.push(Command.parseElement!(element))
			.push(t('command.setElement.' + operation));
		return [
			{ color: 'element' },
			{ text: t('command.setElement.alias') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetElementCommandSchema() {
	return useCommandSchema('setElement', {
		onLoad() {
			getFocus(document.getElementById('setElement-element'));
		}
	});
}
