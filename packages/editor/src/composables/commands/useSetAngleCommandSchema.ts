/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setAngle = new CommandSchema({
	name: 'setAngle',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'angle', default: { type: 'absolute', degrees: 0 } },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		actor,
		angle,
		easingId,
		duration,
		wait
	}: {
		actor: unknown;
		angle: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseAngle!(angle))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'actor' },
			{ text: t('command.setAngle') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetAngleCommandSchema() {
	return useCommandSchema('setAngle', {
		skipWrite: true,
		onLoad() {
			requestFocus('setAngle-actor');
		}
	});
}
