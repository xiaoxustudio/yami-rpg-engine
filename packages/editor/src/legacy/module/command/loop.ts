import { Command } from '@/command/command-object.ts';
import { IfBranch } from '@/command/conditional-branch-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
				{ text: Local.get!('command.loop.while') },
				{ color: 'restore' },
				{ text: ' ' + condition }
			);
		} else {
			contents.push({ text: Local.get!('command.loop') });
		}
		contents.push(
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get!('command.loop.end') }
		);
		return contents;
	}
});
