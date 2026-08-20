import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setWeight = new CommandSchema({
	name: 'setWeight',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'weight', default: 0 }
	],
	customParse({ actor, weight }: { actor: unknown; weight: unknown }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseVariableNumber(weight));
		return [
			{ color: 'actor' },
			{ text: t('command.setWeight') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetWeightCommandSchema() {
	return useCommandSchema('setWeight', {
		onLoad() {
			getFocus(document.getElementById('setWeight-actor'));
		}
	});
}
