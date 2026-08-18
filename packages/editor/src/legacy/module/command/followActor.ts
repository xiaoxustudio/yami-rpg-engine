import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.followActor = new CommandSchema({
	name: 'followActor',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } },
		{ key: 'mode', default: 'circle' },
		{ key: 'minDist', default: 1 },
		{ key: 'maxDist', default: 2 },
		{ key: 'offset', default: 0 },
		{ key: 'vertDist', default: 0 },
		{ key: 'bufferDist', default: 0 },
		{ key: 'navigate', default: true },
		{ key: 'bypass', default: false },
		{ key: 'once', default: false },
		{ key: 'wait', default: false }
	],
	parseActors(actor: unknown, target: unknown) {
		const sActor = Command.parseActor!(actor);
		const dActor = Command.parseActor!(target);
		return sActor + Token(' -> ') + dActor;
	},
	customParse({
		actor,
		target,
		mode,
		minDist,
		maxDist,
		offset,
		vertDist,
		bufferDist,
		navigate,
		bypass,
		once,
		wait
	}: {
		actor: unknown;
		target: unknown;
		mode: string;
		minDist: unknown;
		maxDist: unknown;
		offset: number;
		vertDist: number;
		bufferDist: number;
		navigate: unknown;
		bypass: unknown;
		once: unknown;
		wait: unknown;
	}) {
		if (bufferDist === undefined) {
			bufferDist = 0;
		}
		const words = Command.words
			.push(this.parseActors!(actor, target))
			.push(t('command.followActor.mode.' + mode))
			.push(
				Command.parseVariableNumber!(minDist) +
					Token(' ~ ') +
					Command.parseVariableNumber!(maxDist)
			);
		switch (mode) {
			case 'circle':
				words.push(Command.setNumberColor!(offset.toString()));
				break;
			case 'rectangle':
				words.push(Command.setNumberColor!(vertDist.toString()));
				break;
		}
		words.push(Command.setNumberColor!(bufferDist.toString()));
		if (navigate) {
			words.push(t('command.followActor.navigate'));
			if (bypass) {
				words.push(t('command.followActor.bypass'));
			}
		}
		if (once) {
			words.push(t('command.followActor.once'));
			words.push(Command.parseWait!(wait));
		}
		return [
			{ color: 'actor' },
			{ text: t('command.followActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});
