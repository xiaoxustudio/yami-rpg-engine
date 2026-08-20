import { Command } from '@app/legacy/command/command-object.ts';
import { IfBranch } from '@app/legacy/command/conditional-branch-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.loop = new CommandSchema({
	name: 'loop',
	fields: [
		{ key: 'mode', default: 'all' },
		{ key: 'conditions', default: [] }
	],
	customParse({
		mode,
		conditions,
		commands
	}: {
		mode: string;
		conditions: Array<{ type: string }>;
		commands: unknown;
	}) {
		const contents: Array<{
			fold?: boolean;
			color?: string;
			text?: string;
			children?: unknown;
			break?: boolean;
		}> = [{ fold: true }, { color: 'flow' }];
		if (conditions.length !== 0) {
			const condition = IfBranch.parse!({ mode, conditions });
			contents.push(
				{ text: t('command.loop.while') },
				{ color: 'restore' },
				{ text: ' ' + condition }
			);
		} else {
			contents.push({ text: t('command.loop') });
		}
		contents.push({ children: commands }, { color: 'flow' }, { text: t('command.loop.end') });
		return contents;
	}
});
