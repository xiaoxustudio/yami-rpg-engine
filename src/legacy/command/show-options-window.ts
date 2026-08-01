import { $ } from '@/util/dom.ts';
import { getFocus, on, read, write } from '@/util/element-utils.ts';
import { Command } from './command-object.ts';
import { GameLocal } from '@/local/local-object.ts';
function getWindow() {
	return (window as any).Window;
}

export const Choices = {
	target: null,
	commands: null,
	initialize: null,
	parse: null,
	open: null,
	save: null,
	windowClosed: null,
	confirm: null
};

Choices.initialize = function () {
	const choiceEl = $('#choice');
	if (!choiceEl) return;
	on(choiceEl, 'closed', this.windowClosed);
	on($('#choice-confirm'), 'click', this.confirm);
};

Choices.parse = function (choice) {
	return Command.removeTextTags(Command.parseVariableTag(GameLocal.replace(choice.content)));
};

Choices.open = function (choice = { content: '', commands: [] }) {
	getWindow().open('choice');
	write($('#choice-content'), choice.content);
	getFocus($('#choice-content'), 'all');
	this.commands = choice.commands;
};

Choices.save = function () {
	const commands = this.commands;
	const content = read($('#choice-content')).trim();
	if (content === '') {
		return getFocus($('#choice-content'));
	}
	getWindow().close('choice');
	return { content, commands };
};

Choices.windowClosed = function (event) {
	Choices.commands = null;
};

Choices.confirm = function (event) {
	return Choices.target.save();
};
