import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.wait = new CommandSchema({
	name: 'wait',
	fields: [{ key: 'duration', domId: 'duration', default: 1 }],
	customParse({ duration }: { duration: unknown }) {
		return [
			{ color: 'wait' },
			{ text: t('command.wait') + Token(': ') },
			{ text: Command.parseVariableNumber(duration, 'ms') }
		];
	}
});

export function useWaitCommandSchema() {
	return useCommandSchema('wait', {
		skipWrite: true,
		onLoad() {
			requestFocus('wait-duration', 'all');
		}
	});
}
