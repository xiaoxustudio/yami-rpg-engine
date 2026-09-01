/* oxlint-disable eslint/no-restricted-properties */
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.controlDialog = new CommandSchema({
	name: 'controlDialog',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'operation', default: 'pause' }
	],
	customParse({ element, operation }: { element: unknown; operation: string }) {
		const words = Command.words
			.push(Command.parseElement!(element))
			.push(t('command.controlDialog.' + operation));
		return [
			{ color: 'element' },
			{ text: t('command.controlDialog') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useControlDialogCommandSchema() {
	return useCommandSchema('controlDialog', {
		skipWrite: true,
		onLoad() {
			requestFocus('controlDialog-element');
		}
	});
}
