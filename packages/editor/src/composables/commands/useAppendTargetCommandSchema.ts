/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

type AppendTargetData = {
	actor: unknown;
	target: unknown;
	[k: string]: unknown;
};

Command.cases.appendTarget = new CommandSchema({
	name: 'appendTarget',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } }
	],
	customParse({ actor, target }: AppendTargetData) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target));
		return [
			{ color: 'actor' },
			{ text: t('command.appendTarget') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useAppendTargetCommandSchema() {
	return useCommandSchema('appendTarget', {
		onLoad() {
			getFocus(document.getElementById('appendTarget-actor'));
		}
	});
}
