import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
			{ text: Local.get!('command.transition') + ' ' },
			{ color: 'restore' },
			{ text: words.join() },
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get!('command.transition.end') }
		];
	}
});
