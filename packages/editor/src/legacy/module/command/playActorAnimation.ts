import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.playActorAnimation = new CommandSchema({
	name: 'playActorAnimation',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'motion', default: '', required: true },
		{ key: 'speed', default: 1 },
		{ key: 'wait', default: false }
	],
	parseSpeed(speed: number) {
		if (speed === 1) return '';
		return Command.parseVariableNumber!(speed);
	},
	customParse({
		actor,
		motion,
		speed,
		wait
	}: {
		actor: unknown;
		motion: unknown;
		speed: number;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseEnumString!(motion))
			.push(this.parseSpeed!(speed))
			.push(Command.parseWait!(wait));
		return [
			{ color: 'actor' },
			{ text: t('command.playActorAnimation') + Token(': ') },
			{ text: words.join() }
		];
	}
});
