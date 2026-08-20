import { Command } from '@app/legacy/command/command-object.ts';
import { SwitchBranch } from '@app/legacy/command/match-branch-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
			{ text: t('command.switch') + ' ' },
			{ color: 'normal' },
			{ text: Command.parseVariable!(variable, 'any') },
			{ break: true }
		];
		const textCase = t('command.switch.case');
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
				{ text: t('command.switch.default') },
				{ children: defaultCommands }
			);
		}
		contents.push({ color: 'flow' }, { text: t('command.switch.end') });
		return contents;
	}
});
