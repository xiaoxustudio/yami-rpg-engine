import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

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
		onLoad() {
			getFocus(document.getElementById('setState-state'));
		}
	});
}
