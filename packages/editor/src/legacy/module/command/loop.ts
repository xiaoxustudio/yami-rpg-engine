import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { IfBranch } from '@/command/conditional-branch-window.ts';
import { IfCondition } from '@/command/conditional-condition-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.loop = new CommandSchema({
	name: 'loop',
	onInitialize() {
		$('#loop-conditions').bind(IfCondition);
		$('#loop-mode').loadItems([
			{ name: 'Meet All', value: 'all' },
			{ name: 'Meet Any', value: 'any' }
		]);
		$('#loop').on('closed', () => {
			this.commands = null;
			clear($('#loop-conditions'));
		});
	},
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
	},
	customLoad({
		mode = 'all',
		conditions = [],
		commands = []
	}: {
		mode: string;
		conditions: unknown[];
		commands: unknown;
	}) {
		const write = getElementWriter('loop');
		write('mode', mode);
		write('conditions', conditions.slice());
		this.commands = commands;
		getFocus($('#loop-conditions'));
	},
	customSave() {
		const read = getElementReader('loop');
		const mode = read('mode');
		const conditions = read('conditions');
		Command.save!({ mode, conditions, commands: this.commands });
	}
});
