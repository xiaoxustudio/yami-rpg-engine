/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.moveCamera = new CommandSchema({
	name: 'moveCamera',
	fields: [
		{ key: 'mode', default: 'position' },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		mode,
		position,
		actor,
		easingId,
		duration,
		wait
	}: {
		mode: string;
		position: unknown;
		actor: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words.push(t('command.moveCamera.' + mode));
		switch (mode) {
			case 'position':
				words.push(Command.parsePosition!(position));
				break;
			case 'actor':
				words.push(Command.parseActor!(actor));
				break;
		}
		words.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: t('command.moveCamera') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useMoveCameraCommandSchema() {
	const { form, load, commit } = useCommandSchema('moveCamera', {
		onLoad() {
			getFocus(document.getElementById('moveCamera-mode')!);
		}
	});
	const onSave = (): void => {
		const mode = read(document.getElementById('moveCamera-mode')!) ?? form.mode;
		const easingId = read(document.getElementById('moveCamera-easingId')!) ?? form.easingId;
		const duration = read(document.getElementById('moveCamera-duration')!) ?? form.duration;
		const wait = read(document.getElementById('moveCamera-wait')!) ?? form.wait;
		switch (mode) {
			case 'position':
				commit({
					mode,
					position:
						read(document.getElementById('moveCamera-position')!) ?? form.position,
					easingId,
					duration,
					wait
				});
				break;
			case 'actor':
				commit({
					mode,
					actor: read(document.getElementById('moveCamera-actor')!) ?? form.actor,
					easingId,
					duration,
					wait
				});
				break;
		}
	};
	Command.cases.moveCamera.customSave = onSave;
	return { form, save: onSave, load };
}
