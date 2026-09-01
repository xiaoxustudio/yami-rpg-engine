/* oxlint-disable eslint/no-restricted-properties */
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.nestElement = new CommandSchema({
	name: 'nestElement',
	fields: [
		{ key: 'parent', domId: 'parent', default: { type: 'trigger' } },
		{ key: 'child', domId: 'child', default: { type: 'latest' } }
	],
	customParse({ parent, child }: { parent: unknown; child: unknown }) {
		const pElement = Command.parseElement(parent);
		const cElement = Command.parseElement(child);
		return [
			{ color: 'element' },
			{ text: t('command.nestElement') + Token(': ') },
			{ text: pElement + Token(' -> ') + cElement }
		];
	}
});

export function useNestElementCommandSchema() {
	return useCommandSchema('nestElement', {
		skipWrite: true,
		onLoad() {
			requestFocus('nestElement-parent');
		}
	});
}
