/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

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
		onLoad() {
			getFocus(document.getElementById('translateActor-actor'));
		}
	});
	const onSave = (): void => {
		const distance = read(document.getElementById('translateActor-distance')) ?? form.distance;
		if (distance === 0) {
			getFocus(document.getElementById('translateActor-distance'), 'all');
			return;
		}
		commit({
			actor: read(document.getElementById('translateActor-actor')) ?? form.actor,
			angle: read(document.getElementById('translateActor-angle')) ?? form.angle,
			distance,
			easingId: read(document.getElementById('translateActor-easingId')) ?? form.easingId,
			duration: read(document.getElementById('translateActor-duration')) ?? form.duration,
			wait: read(document.getElementById('translateActor-wait')) ?? form.wait
		});
	};
	Command.cases.translateActor.customSave = onSave;
	return { form, save: onSave, load };
}
