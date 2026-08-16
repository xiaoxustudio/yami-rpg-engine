import { Command } from '@/command/command-object.ts';
import { IfBranch } from '@/command/conditional-branch-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.if = new CommandSchema({
	name: 'if',
	customParse({
		branches,
		elseCommands
	}: {
		branches: Array<{ commands: unknown }>;
		elseCommands: unknown;
	}) {
		const contents: Array<{
			fold?: boolean;
			color?: string;
			text?: string;
			children?: unknown;
			break?: boolean;
		}> = [{ fold: true }];
		const textIf = Local.get!('command.if');
		const textElse = Local.get!('command.if.else');
		for (let index = 0; index < branches.length; index++) {
			const branch = branches[index];
			contents.push(
				{ color: 'flow' },
				...(index === 0 ? [] : [{ text: textElse + ' ' }]),
				{ text: textIf + ' ' },
				{ color: 'normal' },
				{ text: IfBranch.parse!(branch as never) },
				{ children: branch.commands }
			);
		}
		if (elseCommands) {
			contents.push(
				{ color: 'flow' },
				{ text: Local.get!('command.if.else') },
				{ children: elseCommands }
			);
		}
		contents.push({ color: 'flow' }, { text: Local.get!('command.if.end') });
		return contents;
	}
});
