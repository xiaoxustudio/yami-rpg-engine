import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { clear, getFocus, on, read, write } from '@/util/element-utils.ts';
import { Command } from './command-object.ts';
import { IfCondition, type IfConditionData } from './conditional-condition-window.ts';

interface IfBranchTarget {
	save: () => any;
	inserting?: boolean;
	[k: string]: unknown;
}

interface IfBranchData {
	mode: string;
	conditions: IfConditionData[];
	commands?: unknown[];
	[k: string]: unknown;
}

interface IfBranchShape {
	target: IfBranchTarget | null;
	commands: unknown[] | null;
	initialize: (() => void) | null;
	parse: ((branch: IfBranchData, listData?: boolean) => string) | null;
	open: ((branch: IfBranchData) => void) | null;
	save: (() => unknown) | null;
	windowClosed: ((event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
}

export const IfBranch: IfBranchShape = {
	target: null,
	commands: null,
	initialize: null,
	parse: null,
	open: null,
	save: null,
	windowClosed: null,
	confirm: null
};

IfBranch.initialize = function (this: typeof IfBranch): void {
	if (!$('#if-branch-mode')) return;
	$('#if-branch-mode').loadItems([
		{ name: 'Meet All', value: 'all' },
		{ name: 'Meet Any', value: 'any' }
	]);

	on($('#if-branch'), 'closed', this.windowClosed!);
	on($('#if-branch-confirm'), 'click', this.confirm!);
};

IfBranch.parse = function (
	this: typeof IfBranch,
	branch: IfBranchData,
	listData?: boolean
): string {
	const words = Command.words;
	let joint;
	switch (branch.mode) {
		case 'all':
			joint = Command.setOperatorColor!(' && ');
			break;
		case 'any':
			joint = Command.setOperatorColor!(' || ');
			break;
	}
	for (const condition of branch.conditions) {
		words.push(IfCondition.parse!(condition));
	}
	let string = words.join(joint);
	if (listData) {
		string = Command.removeTextTags!(string);
	}
	return string;
};

IfBranch.open = function (this: typeof IfBranch, branch: IfBranchData): void {
	if (this.target!.inserting) {
		IfCondition.target = this.target!;
		IfCondition.open!();
	} else {
		Window.open!('if-branch');
		write($('#if-branch-mode'), branch.mode);
		write($('#if-branch-conditions'), branch.conditions.slice());
		getFocus($('#if-branch-conditions'));
		this.commands = branch.commands!;
	}
};

IfBranch.save = function (this: typeof IfBranch): unknown {
	if (this.target!.inserting) {
		const condition = IfCondition.save!();
		if (condition !== undefined) {
			const mode = 'all';
			const conditions = [condition];
			const commands: unknown[] = [];
			return { mode, conditions, commands };
		}
	} else {
		const mode = read($('#if-branch-mode'));
		const element = $('#if-branch-conditions');
		const conditions = read(element);
		if (conditions.length === 0) {
			return getFocus(element);
		}
		const commands = this.commands;
		Window.close!('if-branch');
		return { mode, conditions, commands };
	}
};

IfBranch.windowClosed = function (this: typeof IfBranch, event: Event): void {
	IfBranch.commands = null;
	clear($('#if-branch-conditions'));
};

IfBranch.confirm = function (this: typeof IfBranch, event: Event): void {
	return IfBranch.target?.save?.();
};
