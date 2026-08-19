import { Window } from '@app/legacy/tools/window-object.ts';
import { clear, getFocus, read, write } from '@app/utils/element-utils.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import {
	IfCondition,
	type IfConditionData
} from '@app/legacy/command/conditional-condition-window.ts';

interface IfBranchTarget {
	save: () => unknown;
	inserting?: boolean;
	[k: string]: unknown;
}

export interface IfBranchData {
	mode: string;
	conditions: IfConditionData[];
	commands?: unknown[];
	[k: string]: unknown;
}

export interface IfBranchShape {
	target: IfBranchTarget | null;
	commands: unknown[] | null;
	initialize: (() => void) | null;
	parse: ((branch: IfBranchData, listData?: boolean) => string) | null;
	open: ((branch: IfBranchData) => void) | null;
	save: (() => unknown) | null;
	windowClosed: ((event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
}

let target: IfBranchTarget | null = null;
let commands: unknown[] | null = null;
let instance: IfBranchShape | null = null;

const parse = (branch: IfBranchData, listData?: boolean): string => {
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

const open = (branch: IfBranchData): void => {
	if (target!.inserting) {
		IfCondition.target = target!;
		IfCondition.open!();
	} else {
		Window.open!('if-branch');
		write(document.getElementById('if-branch-mode'), branch.mode);
		write(document.getElementById('if-branch-conditions'), branch.conditions.slice());
		getFocus(document.getElementById('if-branch-conditions'));
		commands = branch.commands!;
	}
};

const save = (): unknown => {
	if (target!.inserting) {
		const condition = IfCondition.save!();
		if (condition !== undefined) {
			const mode = 'all';
			const conditions = [condition];
			const commands: unknown[] = [];
			return { mode, conditions, commands };
		}
	} else {
		const mode = read(document.getElementById('if-branch-mode'));
		const element = document.getElementById('if-branch-conditions');
		const conditions = read(element);
		if (conditions.length === 0) {
			return getFocus(element);
		}
		const savedCommands = commands;
		Window.close!('if-branch');
		return { mode, conditions, commands: savedCommands };
	}
};

const windowClosed = (event: Event): void => {
	commands = null;
	clear(document.getElementById('if-branch-conditions'));
};

const confirm = (event: Event): void => {
	target?.save?.();
};

export function useIfBranchSchema(): IfBranchShape {
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
