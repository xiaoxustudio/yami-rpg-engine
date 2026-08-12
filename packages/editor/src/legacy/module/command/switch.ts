import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { SwitchBranch } from '@/command/match-branch-window.ts';
import { SwitchCondition } from '@/command/match-condition-window.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.switch = new CommandSchema({
	name: 'switch',
	defaultCommands: null,
	onInitialize() {
		const confirmEl = $('#switch-confirm');
		if (!confirmEl) return;
		confirmEl.addEventListener('click', () => this.save!());
		$('#switch-branches')?.bind(SwitchBranch);
		$('#switch-branch-conditions')?.bind(SwitchCondition);
		$('#switch')?.addEventListener('closed', () => {
			this.defaultCommands = null;
			clear($('#switch-branches'));
		});
	},
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
	},
	customLoad({
		variable = { type: 'local', key: '' },
		branches = [],
		defaultCommands = null
	}: {
		variable: unknown;
		branches: unknown[];
		defaultCommands: unknown;
	}) {
		const write = getElementWriter('switch');
		write('variable', variable);
		write('branches', branches.slice());
		write('default', !!defaultCommands);
		this.defaultCommands = defaultCommands;
		getFocus($('#switch-variable'));
	},
	customSave() {
		const read = getElementReader('switch');
		const variable = read('variable');
		if (VariableGetter.isNone!(variable)) {
			return getFocus($('#switch-variable'));
		}
		const branches = read('branches');
		if (branches.length === 0) {
			return getFocus($('#switch-branches'));
		}
		switch (read('default')) {
			case true: {
				const defaultCommands = this.defaultCommands ?? [];
				Command.save!({ variable, branches, defaultCommands });
				break;
			}
			case false:
				Command.save!({ variable, branches });
				break;
		}
	}
});
