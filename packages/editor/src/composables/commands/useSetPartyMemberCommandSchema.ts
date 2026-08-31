/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setPartyMember = new CommandSchema({
	name: 'setPartyMember',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'actor', default: { type: 'trigger' } }
	],
	customParse({ operation, actor }: { operation: string; actor: unknown }) {
		const words = Command.words
			.push(t('command.setPartyMember.' + operation))
			.push(Command.parseActor!(actor));
		return [
			{ color: 'actor' },
			{ text: t('command.setPartyMember') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetPartyMemberCommandSchema() {
	return useCommandSchema('setPartyMember', {
		onLoad() {
			getFocus(document.getElementById('setPartyMember-operation')!);
		}
	});
}
