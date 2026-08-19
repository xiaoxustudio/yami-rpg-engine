import { Window } from '@app/legacy/tools/window-object.ts';
import { getFocus } from '@app/utils/element-utils.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import { GameLocal } from '@app/legacy/local/local-object.ts';

export interface ChoicesForm {
	content: string;
}

interface ChoicesTarget {
	save: () => unknown;
	[k: string]: unknown;
}

export interface ChoicesData {
	content: string;
	commands: unknown[];
	[k: string]: unknown;
}

export interface ChoicesShape {
	target: ChoicesTarget | null;
	commands: unknown[] | null;
	initialize: (() => void) | null;
	parse: ((choice: ChoicesData) => string) | null;
	open: ((choice?: ChoicesData) => void) | null;
	save: (() => unknown) | null;
	windowClosed: ((event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
}

let target: ChoicesTarget | null = null;
let commands: unknown[] | null = null;
let instance: ChoicesShape | null = null;

const parse = (choice: ChoicesData): string => {
	return Command.removeTextTags!(Command.parseVariableTag!(GameLocal.replace!(choice.content)));
};

const open = (choice: ChoicesData = { content: '', commands: [] }): void => {
	Window.open!('choice');
	const setForm = (
		document.getElementById('choice') as
			| (HTMLElement & { setForm?: (data: Partial<ChoicesForm>) => void })
			| null
	)?.setForm;
	setForm?.({ content: choice.content });
	getFocus(document.getElementById('choice-content'), 'all');
	commands = choice.commands;
};

const save = (): unknown => {
	const getForm = (
		document.getElementById('choice') as (HTMLElement & { getForm?: () => ChoicesForm }) | null
	)?.getForm;
	const content = (getForm?.()?.content ?? '').trim();
	if (content === '') {
		return getFocus(document.getElementById('choice-content'));
	}
	Window.close!('choice');
	return { content, commands };
};

const windowClosed = (event: Event): void => {
	commands = null;
};

const confirm = (event: Event): void => {
	target?.save?.();
};

export function useChoicesSchema(): ChoicesShape {
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
