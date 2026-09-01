/* oxlint-disable eslint/no-restricted-properties */
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.createObject = new CommandSchema({
	name: 'createObject',
	fields: [
		{ key: 'presetId', default: '', required: true },
		{
			key: 'position',
			default: { type: 'actor', actor: { type: 'trigger' } }
		}
	],
	customParse({ presetId, position }: { presetId: unknown; position: unknown }) {
		const words = Command.words
			.push(Command.parsePresetObject(presetId))
			.push(Command.parsePosition(position));
		return [
			{ color: 'object' },
			{ text: t('command.createObject') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useCreateObjectCommandSchema() {
	return useCommandSchema('createObject', {
		skipWrite: true,
		onLoad() {
			requestFocus('createObject-presetId');
		}
	});
}
