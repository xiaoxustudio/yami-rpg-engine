import { Command } from '@/command/command-object.ts';
import { SwitchBranch } from '@/command/match-branch-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.switch = new CommandSchema({
	name: 'switch',
	customParse({
		variable,
		branches,
		defaultCommands
	}: {
		variable: unknown;
		branches: Array<{ commands: unknown }>;
		defaultCommands: unknown;
	}) {
		const contents: Array<{
			fold?: boolean;
			color?: string;
			text?: string;
			children?: unknown;
			break?: boolean;
		}> = [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get!('command.switch') + ' ' },
			{ color: 'normal' },
			{ text: Command.parseVariable!(variable, 'any') },
			{ break: true }
		];
		const textCase = Local.get!('command.switch.case');
		for (const branch of branches) {
			contents.push(
				{ color: 'flow' },
				{ text: textCase + ' ' },
				{ color: 'normal' },
				{ text: SwitchBranch.parse!(branch as never) },
				{ children: branch.commands }
			);
		}
		if (defaultCommands) {
			contents.push(
				{ color: 'flow' },
				{ text: Local.get!('command.switch.default') },
				{ children: defaultCommands }
			);
		}
		contents.push({ color: 'flow' }, { text: Local.get!('command.switch.end') });
		return contents;
	}
});
