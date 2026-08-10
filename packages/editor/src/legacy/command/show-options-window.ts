import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, on, read, write } from '@/util/element-utils.ts';
import { Command } from './command-object.ts';
import { GameLocal } from '@/local/local-object.ts';

interface ChoicesTarget {
	save: () => any;
	[k: string]: unknown;
}

interface ChoicesData {
	content: string;
	commands: unknown[];
	[k: string]: unknown;
}

interface ChoicesShape {
	target: ChoicesTarget | null;
	commands: unknown[] | null;
	initialize: (() => void) | null;
	parse: ((choice: ChoicesData) => string) | null;
	open: ((choice?: ChoicesData) => void) | null;
	save: (() => unknown) | null;
	windowClosed: ((event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
}

export const Choices: ChoicesShape = {
	target: null,
	commands: null,
	initialize: null,
	parse: null,
	open: null,
	save: null,
	windowClosed: null,
	confirm: null
};

Choices.initialize = function (this: typeof Choices): void {
	const choiceEl = $('#choice');
	if (!choiceEl) return;
	on(choiceEl, 'closed', this.windowClosed!);
	on($('#choice-confirm'), 'click', this.confirm!);
};

Choices.parse = function (this: typeof Choices, choice: ChoicesData): string {
	return Command.removeTextTags!(Command.parseVariableTag!(GameLocal.replace!(choice.content)));
};

Choices.open = function (
	this: typeof Choices,
	choice: ChoicesData = { content: '', commands: [] }
): void {
	Window.open!('choice');
	write($('#choice-content'), choice.content);
	getFocus($('#choice-content'), 'all');
	this.commands = choice.commands;
};

Choices.save = function (this: typeof Choices): unknown {
	const commands = this.commands;
	const content = read($('#choice-content')).trim();
	if (content === '') {
		return getFocus($('#choice-content'));
	}
	Window.close!('choice');
	return { content, commands };
};

Choices.windowClosed = function (this: typeof Choices, event: Event): void {
	Choices.commands = null;
};

Choices.confirm = function (this: typeof Choices, event: Event): void {
	return Choices.target?.save?.();
};
