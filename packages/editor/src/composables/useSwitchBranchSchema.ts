import { getWindowStore } from '@app/stores/window';
import { runWhenToolWindowReady } from '@app/tools/tool-window-host';
import { composableEls } from '@app/composables/element-registry';
import { clear, getFocus, read, write } from '@app/utils/element-utils';
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
		getWindowStore().open('switch-branch');
		const conditions = branch.conditions.slice();
		// 分支窗口是懒挂载的：首次打开时控件还不存在，写入会丢（条件列表显示为空），等挂载后再写
		runWhenToolWindowReady('switch-branch', () => {
			write(composableEls.get('switch-branch-conditions'), conditions);
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
		const element = composableEls.get('switch-branch-conditions');
		const conditions = read(element);
		if (conditions.length === 0) {
			return getFocus(element);
		}
		const savedCommands = commands;
		getWindowStore().close('switch-branch');
		return { conditions, commands: savedCommands };
	}
};

const windowClosed = (_event: Event): void => {
	commands = null;
	clear(composableEls.get('switch-branch-conditions'));
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
