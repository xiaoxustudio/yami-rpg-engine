import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { clear, getFocus, read, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { SwitchCondition, type SwitchConditionData } from '@/command/match-condition-window.ts';

interface SwitchBranchTarget {
	save: () => SwitchConditionData;
	inserting?: boolean;
	[k: string]: unknown;
}

export interface SwitchBranchData {
	conditions: SwitchConditionData[];
	commands: unknown[];
	[k: string]: unknown;
}

export interface SwitchBranchShape {
	target: SwitchBranchTarget | null;
	commands: unknown[] | null;
	initialize: (() => void) | null;
	parse: ((branch: SwitchBranchData, listData?: boolean) => string) | null;
	open: ((branch: SwitchBranchData) => void) | null;
	save: (() => unknown) | null;
	windowClosed: ((event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
}

let target: SwitchBranchTarget | null = null;
let commands: unknown[] | null = null;
let instance: SwitchBranchShape | null = null;

const parse = (branch: SwitchBranchData, listData?: boolean): string => {
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

const open = (branch: SwitchBranchData): void => {
	if (target!.inserting) {
		SwitchCondition.target = target!;
		SwitchCondition.open!();
	} else {
		Window.open!('switch-branch');
		write($('#switch-branch-conditions'), branch.conditions.slice());
		getFocus($('#switch-branch-conditions'));
		commands = branch.commands;
	}
};

const save = (): unknown => {
	if (target!.inserting) {
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
		const savedCommands = commands;
		Window.close!('switch-branch');
		return { conditions, commands: savedCommands };
	}
};

const windowClosed = (event: Event): void => {
	commands = null;
	clear($('#switch-branch-conditions'));
};

const confirm = (event: Event): void => {
	target?.save?.();
};

export function useSwitchBranchSchema(): SwitchBranchShape {
	if (!instance) {
		instance = {
			get target() {
				return target;
			},
			set target(value) {
				target = value;
			},
			get commands() {
				return commands;
			},
			set commands(value) {
				commands = value;
			},
			initialize: () => undefined,
			parse,
			open,
			save,
			windowClosed,
			confirm
		};
	}
	return instance;
}
