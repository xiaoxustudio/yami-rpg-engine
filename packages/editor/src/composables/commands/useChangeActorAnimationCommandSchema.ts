/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.changeActorAnimation = new CommandSchema({
	name: 'changeActorAnimation',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true }
	],
	customParse({ actor, animationId }: { actor: unknown; animationId: unknown }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId));
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorAnimation') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useChangeActorAnimationCommandSchema() {
	return useCommandSchema('changeActorAnimation', {
		onLoad() {
			getFocus(document.getElementById('changeActorAnimation-actor'));
		}
	});
}
