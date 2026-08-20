import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.transition = new CommandSchema({
	name: 'transition',
	customParse({
		variable,
		start,
		end,
		easingId,
		duration,
		commands
	}: {
		variable: unknown;
		start: unknown;
		end: unknown;
		easingId: unknown;
		duration: unknown;
		commands: unknown;
	}) {
		const varName = Command.parseVariable!(variable, 'number', true);
		const from = Command.parseVariableNumber!(start);
		const to = Command.parseVariableNumber!(end);
		const easing = Command.parseEasing!(easingId, duration);
		const expression = varName + Token(' = ') + from + Token(' -> ') + to;
		const words = Command.words.push(expression).push(easing);
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: t('command.transition') + ' ' },
			{ color: 'restore' },
			{ text: words.join() },
			{ children: commands },
			{ color: 'flow' },
			{ text: t('command.transition.end') }
		];
	}
});
