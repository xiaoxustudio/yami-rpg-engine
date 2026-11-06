import { getWindowStore } from '@app/stores/window';
import { getSwitchBranch } from '@app/composables/tool-window-bridges';
import { getFocus } from '@app/utils/element-utils';
import { requestFocus } from '@app/directives/focus';
import { removeTextTags } from '@app/composables/useCommandParse.ts';
import { commandState } from '@app/composables/useCommandState.ts';
import { useSwitchConditionSchema } from '@app/composables/useSwitchConditionSchema';
import type { SwitchConditionData } from '@app/composables/useSwitchConditionSchema';

const SwitchCondition = useSwitchConditionSchema();

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
	const words = commandState.words;
	for (const condition of branch.conditions) {
		words.push(SwitchCondition.parse!(condition));
	}
	let string = words.join();
	if (listData) {
		string = removeTextTags(string);
	}
	return string;
};

const open = (branch: SwitchBranchData): void => {
	if (target!.inserting) {
		SwitchCondition.target = target!;
		SwitchCondition.open!();
	} else {
		const conditions = branch.conditions.slice();
		// 分支窗口是懒挂载的：控件可用后再写（首次打开也不会丢条件列表）
		getWindowStore().openWith('switch-branch', () => {
			getSwitchBranch()?.setConditions(conditions);
		});
		requestFocus('switch-branch-conditions');
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
		const conditions = getSwitchBranch()?.getConditions() ?? [];
		if (conditions.length === 0) {
			// 没有条件时不关闭窗口，交给焦点指令提示
			return getFocus(null);
		}
		const savedCommands = commands;
		getWindowStore().close('switch-branch');
		return { conditions, commands: savedCommands };
	}
};

const windowClosed = (_event: Event): void => {
	commands = null;
	getSwitchBranch()?.clearConditions();
};

const confirm = (_event: Event): void => {
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
