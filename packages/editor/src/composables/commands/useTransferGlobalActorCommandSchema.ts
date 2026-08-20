import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.transferGlobalActor = new CommandSchema({
	name: 'transferGlobalActor',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } }
	],
	customParse({ actor, position }: { actor: unknown; position: unknown }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parsePosition(position));
		return [
			{ color: 'actor' },
			{ text: t('command.transferGlobalActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useTransferGlobalActorCommandSchema() {
	return useCommandSchema('transferGlobalActor', {
		onLoad() {
			getFocus(document.getElementById('transferGlobalActor-actor'), 'all');
		}
	});
}
