import { getWindowStore } from '@app/stores/window';
import { getIfBranch } from '@app/composables/tool-window-bridges';
import { getFocus } from '@app/utils/element-utils.ts';
import { requestFocus } from '@app/directives/focus';
import { setOperatorColor } from '@app/composables/useCommandColor.ts';
import { removeTextTags } from '@app/composables/useCommandParse.ts';
import { commandState } from '@app/composables/useCommandState.ts';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';
import type { IfConditionData } from '@app/composables/useIfConditionSchema';

const IfCondition = useIfConditionSchema();

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
	const words = commandState.words;
	let joint;
	switch (branch.mode) {
		case 'all':
			joint = setOperatorColor(' && ');
			break;
		case 'any':
			joint = setOperatorColor(' || ');
			break;
	}
	for (const condition of branch.conditions) {
		words.push(IfCondition.parse!(condition));
	}
	let string = words.join(joint);
	if (listData) {
		string = removeTextTags(string);
	}
	return string;
};

const open = (branch: IfBranchData): void => {
	if (target!.inserting) {
		IfCondition.target = target!;
		IfCondition.open!();
	} else {
		const mode = branch.mode;
		const conditions = branch.conditions.slice();
		// 分支窗口是懒挂载的：控件可用后再写（首次打开也不会丢条件列表）
		getWindowStore().openWith('if-branch', () => {
			getIfBranch()?.setMode(mode);
			getIfBranch()?.setConditions(conditions);
		});
		requestFocus('if-branch-conditions');
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
		const mode = getIfBranch()?.getMode();
		const conditions = getIfBranch()?.getConditions() ?? [];
		if (conditions.length === 0) {
			// 没有条件时不关闭窗口，交给焦点指令提示
			return getFocus(null);
		}
		const savedCommands = commands;
		getWindowStore().close('if-branch');
		return { mode, conditions, commands: savedCommands };
	}
};

const windowClosed = (_event: Event): void => {
	commands = null;
	getIfBranch()?.clearConditions();
};

const confirm = (_event: Event): void => {
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
