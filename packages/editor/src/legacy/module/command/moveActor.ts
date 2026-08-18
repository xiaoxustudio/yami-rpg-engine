import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

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
