import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { clear, getFocus, on, read, write } from '@/util/element-utils';
import { Command } from './command-object.ts';
import { SwitchCondition, type SwitchConditionData } from './match-condition-window.ts';

interface SwitchBranchTarget {
	save: () => any;
	inserting?: boolean;
	[k: string]: unknown;
}

interface SwitchBranchData {
	conditions: SwitchConditionData[];
	commands: unknown[];
	[k: string]: unknown;
}

interface SwitchBranchShape {
	target: SwitchBranchTarget | null;
	commands: unknown[] | null;
	initialize: (() => void) | null;
	parse: ((branch: SwitchBranchData, listData?: boolean) => string) | null;
	open: ((branch: SwitchBranchData) => void) | null;
	save: (() => unknown) | null;
	windowClosed: ((event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
}

export const SwitchBranch: SwitchBranchShape = {
	target: null,
	commands: null,
	initialize: null,
	parse: null,
	open: null,
	save: null,
	windowClosed: null,
	confirm: null
};

SwitchBranch.initialize = function (this: typeof SwitchBranch): void {
	if (!$('#switch-branch')) return;
	on($('#switch-branch'), 'closed', this.windowClosed!);
	on($('#switch-branch-confirm'), 'click', this.confirm!);
};

SwitchBranch.parse = function (
	this: typeof SwitchBranch,
	branch: SwitchBranchData,
	listData?: boolean
): string {
	const words = Command.words;
	for (const condition of branch.conditions) {
		words.push(SwitchCondition.parse!(condition));
	}
	let string = words.join();
	if (listData) {
		string = Command.removeTextTags!(string);
	}
	return string;
};

SwitchBranch.open = function (this: typeof SwitchBranch, branch: SwitchBranchData): void {
	if (this.target!.inserting) {
		SwitchCondition.target = this.target!;
		SwitchCondition.open!();
	} else {
		Window.open!('switch-branch');
		write($('#switch-branch-conditions'), branch.conditions.slice());
		getFocus($('#switch-branch-conditions'));
		this.commands = branch.commands;
	}
};
SwitchBranch.save = function (this: typeof SwitchBranch): unknown {
	if (this.target!.inserting) {
		const condition = SwitchCondition.save!();
		if (condition !== undefined) {
			const conditions = [condition];
			const commands: unknown[] = [];
			return { conditions, commands };
		}
	} else {
		const element = $('#switch-branch-conditions');
		const conditions = read(element);
		if (conditions.length === 0) {
			return getFocus(element);
		}
		const commands = this.commands;
		Window.close!('switch-branch');
		return { conditions, commands };
	}
};

SwitchBranch.windowClosed = function (this: typeof SwitchBranch, event: Event): void {
	SwitchBranch.commands = null;
	clear($('#switch-branch-conditions'));
};

SwitchBranch.confirm = function (this: typeof SwitchBranch, event: Event): void {
	return SwitchBranch.target?.save?.();
};
