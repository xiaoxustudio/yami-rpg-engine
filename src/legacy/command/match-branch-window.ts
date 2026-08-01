import { $ } from '@/util/dom.ts';
import { clear, getFocus, on, read, write } from '@/util/element-utils';
import { Command } from './command-object.ts';
import { SwitchCondition } from './match-condition-window.ts';
function getWindow() {
	return (window as any).Window;
}

export const SwitchBranch = {
	target: null,
	commands: null,
	initialize: null,
	parse: null,
	open: null,
	save: null,
	windowClosed: null,
	confirm: null
};

SwitchBranch.initialize = function () {
	if (!$('#switch-branch')) return;
	on($('#switch-branch'), 'closed', this.windowClosed);
	on($('#switch-branch-confirm'), 'click', this.confirm);
};

SwitchBranch.parse = function (branch, listData) {
	const words = Command.words;
	for (const condition of branch.conditions) {
		words.push(SwitchCondition.parse(condition));
	}
	let string = words.join();
	if (listData) {
		string = Command.removeTextTags(string);
	}
	return string;
};

SwitchBranch.open = function (branch) {
	if (this.target.inserting) {
		SwitchCondition.target = this.target;
		SwitchCondition.open();
	} else {
		getWindow().open('switch-branch');
		write($('#switch-branch-conditions'), branch.conditions.slice());
		getFocus($('#switch-branch-conditions'));
		this.commands = branch.commands;
	}
};
SwitchBranch.save = function () {
	if (this.target.inserting) {
		const condition = SwitchCondition.save();
		if (condition !== undefined) {
			const conditions = [condition];
			const commands = [];
			return { conditions, commands };
		}
	} else {
		const element = $('#switch-branch-conditions');
		const conditions = read(element);
		if (conditions.length === 0) {
			return getFocus(element);
		}
		const commands = this.commands;
		getWindow().close('switch-branch');
		return { conditions, commands };
	}
};

SwitchBranch.windowClosed = function (event) {
	SwitchBranch.commands = null;
	clear($('#switch-branch-conditions'));
};

SwitchBranch.confirm = function (event) {
	return SwitchBranch.target.save();
};
