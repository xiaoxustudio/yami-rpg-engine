/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.switchCollisionSystem = new CommandSchema({
	name: 'switchCollisionSystem',
	fields: [{ key: 'operation', default: 'enable-actor-collision' }],
	customParse({ operation }: { operation: string }) {
		return [
			{ color: 'system' },
			{ text: t('command.switchCollisionSystem') + Token(': ') },
			{ text: t('command.switchCollisionSystem.' + operation) }
		];
	}
});

export function useSwitchCollisionSystemCommandSchema() {
	return useCommandSchema('switchCollisionSystem', {
		onLoad() {
			getFocus(document.getElementById('switchCollisionSystem-operation'));
		}
	});
}
