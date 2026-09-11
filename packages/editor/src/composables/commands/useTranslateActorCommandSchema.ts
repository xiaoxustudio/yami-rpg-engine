import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.translateActor = new CommandSchema({
	name: 'translateActor',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'angle', default: { type: 'absolute', degrees: 0 } },
		{ key: 'distance', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		actor,
		angle,
		distance,
		easingId,
		duration,
		wait
	}: {
		actor: unknown;
		angle: unknown;
		distance: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseAngle!(angle))
			.push(Command.parseVariableNumber!(distance, 't'))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'actor' },
			{ text: t('command.translateActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useTranslateActorCommandSchema() {
	const { form, load, commit } = useCommandSchema('translateActor', {
		skipWrite: true,
		onLoad() {
			requestFocus('translateActor-actor');
		}
	});
	const onSave = (): void => {
		const distance = form.distance;
		if (distance === 0) {
			requestFocus('translateActor-distance', 'all');
			return;
		}
		commit({
			actor: form.actor,
			angle: form.angle,
			distance,
			easingId: form.easingId,
			duration: form.duration,
			wait: form.wait
		});
	};
	Command.cases.translateActor.customSave = onSave;
	return { form, save: onSave, load };
}
