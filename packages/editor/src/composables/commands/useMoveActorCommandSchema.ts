/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

type MoveActorMode = 'stop' | 'keep' | 'straight' | 'navigate' | 'navigate-bypass' | 'teleport';

type MoveActorData = {
	actor: unknown;
	mode: MoveActorMode;
	angle: unknown;
	destination: unknown;
	wait: unknown;
	[k: string]: unknown;
};

Command.cases.moveActor = new CommandSchema({
	name: 'moveActor',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'mode', default: 'straight' },
		{ key: 'angle', default: 0 },
		{ key: 'destination', default: { type: 'absolute', x: 0, y: 0 } },
		{ key: 'wait', default: false }
	],
	parseMode(mode: MoveActorMode) {
		let string = t('command.moveActor.mode.' + mode);
		if (mode === 'navigate-bypass') {
			string = string.replace('(', Token('(')).replace(')', Token(')'));
		}
		return string;
	},
	customParse({ actor, mode, angle, destination, wait }: MoveActorData) {
		const words = Command.words.push(Command.parseActor!(actor)).push(this.parseMode!(mode));
		switch (mode) {
			case 'stop':
				break;
			case 'keep':
				words.push(Command.parseVariableNumber!(angle, '°'));
				break;
			case 'straight':
			case 'navigate':
			case 'navigate-bypass':
				words.push(Command.parsePosition!(destination));
				words.push(Command.parseWait!(wait));
				break;
			case 'teleport':
				words.push(Command.parsePosition!(destination));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.moveActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useMoveActorCommandSchema() {
	const { form, load, commit } = useCommandSchema('moveActor', {
		onLoad() {
			getFocus(document.getElementById('moveActor-actor')!);
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('moveActor-actor')!) ?? form.actor;
		const mode = read(document.getElementById('moveActor-mode')!) ?? form.mode;
		switch (mode) {
			case 'stop':
				commit({ actor, mode });
				break;
			case 'keep':
				commit({
					actor,
					mode,
					angle: read(document.getElementById('moveActor-angle')!) ?? form.angle
				});
				break;
			case 'straight':
			case 'navigate':
			case 'navigate-bypass':
				commit({
					actor,
					mode,
					destination:
						read(document.getElementById('moveActor-destination')!) ?? form.destination,
					wait: read(document.getElementById('moveActor-wait')!) ?? form.wait
				});
				break;
			case 'teleport':
				commit({
					actor,
					mode,
					destination:
						read(document.getElementById('moveActor-destination')!) ?? form.destination
				});
				break;
		}
	};
	Command.cases.moveActor.customSave = onSave;
	return { form, save: onSave, load };
}
