/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setState = new CommandSchema({
	name: 'setState',
	fields: [
		{ key: 'state', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set-time' },
		{ key: 'time', default: 0 }
	],
	parseOperation(operation: string) {
		return t('command.setState.' + operation);
	},
	customParse({ state, operation, time }: { state: unknown; operation: string; time: unknown }) {
		const words = Command.words
			.push(Command.parseState!(state))
			.push(this.parseOperation!(operation))
			.push(Command.parseVariableNumber!(time, 'ms'));
		return [
			{ color: 'object' },
			{ text: t('command.setState') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetStateCommandSchema() {
	return useCommandSchema('setState', {
		skipWrite: true,
		onLoad() {
			requestFocus('setState-state');
		}
	});
}
