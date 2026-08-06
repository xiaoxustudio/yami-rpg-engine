import { $ } from '@/util/dom.ts';
import { getFocus, on, read, write } from '@/util/element-utils.ts';
import { Command } from './command-object.ts';
import { GameLocal } from '@/local/local-object.ts';
function getWindow() {
	return (window as any).Window;
}

export const Choices = {
	target: null as any,
	commands: null as any,
	initialize: null as any,
	parse: null as any,
	open: null as any,
	save: null as any,
	windowClosed: null as any,
	confirm: null as any
};

Choices.initialize = function (this: any) {
	const choiceEl = $('#choice');
	if (!choiceEl) return;
	on(choiceEl, 'closed', this.windowClosed);
	on($('#choice-confirm'), 'click', this.confirm);
};

Choices.parse = function (this: any, choice: any) {
	return Command.removeTextTags!(Command.parseVariableTag!(GameLocal.replace!(choice.content)));
};

Choices.open = function (this: any, choice = { content: '', commands: [] }) {
	getWindow().open('choice');
	write($('#choice-content'), choice.content);
	getFocus($('#choice-content'), 'all');
	this.commands = choice.commands;
};

Choices.save = function (this: any) {
	const commands = this.commands;
	const content = read($('#choice-content')).trim();
	if (content === '') {
		return getFocus($('#choice-content'));
	}
	getWindow().close('choice');
	return { content, commands };
};

Choices.windowClosed = function (this: any, event: any) {
	Choices.commands = null;
};

Choices.confirm = function (this: any, event: any) {
	return Choices.target.save();
};
