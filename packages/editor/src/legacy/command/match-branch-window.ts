import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { clear, getFocus, on, read, write } from '@/util/element-utils';
import { Command } from './command-object.ts';
import { SwitchCondition } from './match-condition-window.ts';

export const SwitchBranch = {
	target: null as any,
	commands: null as any,
	initialize: null as any,
	parse: null as any,
	open: null as any,
	save: null as any,
	windowClosed: null as any,
	confirm: null as any
};

SwitchBranch.initialize = function (this: any) {
	if (!$('#switch-branch')) return;
	on($('#switch-branch'), 'closed', this.windowClosed);
	on($('#switch-branch-confirm'), 'click', this.confirm);
};

SwitchBranch.parse = function (this: any, branch: any, listData: any) {
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

SwitchBranch.open = function (this: any, branch: any) {
	if (this.target.inserting) {
		SwitchCondition.target = this.target;
		SwitchCondition.open!();
	} else {
		Window.open!('switch-branch');
		write($('#switch-branch-conditions'), branch.conditions.slice());
		getFocus($('#switch-branch-conditions'));
		this.commands = branch.commands;
	}
};
SwitchBranch.save = function (this: any) {
	if (this.target.inserting) {
		const condition = SwitchCondition.save!();
		if (condition !== undefined) {
			const conditions = [condition];
			const commands = [] as any[];
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

SwitchBranch.windowClosed = function (this: any, event: any) {
	SwitchBranch.commands = null;
	clear($('#switch-branch-conditions'));
};

SwitchBranch.confirm = function (this: any, event: any) {
	return SwitchBranch.target?.save?.();
};
