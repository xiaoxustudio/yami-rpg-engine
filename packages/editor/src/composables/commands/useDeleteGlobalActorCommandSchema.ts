import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.deleteGlobalActor = new CommandSchema({
	name: 'deleteGlobalActor',
	fields: [{ key: 'actorId', default: '', required: true }],
	customParse({ actorId }: { actorId: unknown }) {
		const words = Command.words.push(Command.parseFileName(actorId));
		return [
			{ color: 'actor' },
			{ text: t('command.deleteGlobalActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useDeleteGlobalActorCommandSchema() {
	return useCommandSchema('deleteGlobalActor', {
		onLoad() {
			getFocus(document.getElementById('deleteGlobalActor-actorId')!);
		}
	});
}
