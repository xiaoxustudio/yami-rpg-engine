import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { clear, getFocus, on, read, write } from '@/util/element-utils.ts';
import { Command } from './command-object.ts';
import { IfCondition } from './conditional-condition-window.ts';

export const IfBranch = {
	target: null as any,
	commands: null as any,
	initialize: null as any,
	parse: null as any,
	open: null as any,
	save: null as any,
	windowClosed: null as any,
	confirm: null as any
};

IfBranch.initialize = function (this: any) {
	if (!$('#if-branch-mode')) return;
	$('#if-branch-mode').loadItems([
		{ name: 'Meet All', value: 'all' },
		{ name: 'Meet Any', value: 'any' }
	]);

	on($('#if-branch'), 'closed', this.windowClosed);
	on($('#if-branch-confirm'), 'click', this.confirm);
};

IfBranch.parse = function (this: any, branch: any, listData: any) {
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

IfBranch.open = function (this: any, branch: any) {
	if (this.target.inserting) {
		IfCondition.target = this.target;
		IfCondition.open!();
	} else {
		Window.open!('if-branch');
		write($('#if-branch-mode'), branch.mode);
		write($('#if-branch-conditions'), branch.conditions.slice());
		getFocus($('#if-branch-conditions'));
		this.commands = branch.commands;
	}
};

IfBranch.save = function (this: any) {
	if (this.target.inserting) {
		const condition = IfCondition.save!();
		if (condition !== undefined) {
			const mode = 'all';
			const conditions = [condition];
			const commands = [] as any[];
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

IfBranch.windowClosed = function (this: any, event: any) {
	IfBranch.commands = null;
	clear($('#if-branch-conditions'));
};

IfBranch.confirm = function (this: any, event: any) {
	return IfBranch.target?.save?.();
};
