/* oxlint-disable eslint/no-restricted-properties */
import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';
import { removeTextTags, parseVariableTag } from '@app/composables/useCommandParse.ts';
import { GameLocal } from '@app/local/local-object.ts';

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
	form: ChoicesForm;
	target: ChoicesTarget | null;
	commands: unknown[] | null;
	initialize: (() => void) | null;
	parse: ((choice: ChoicesData) => string) | null;
	open: ((choice?: ChoicesData) => void) | null;
	save: (() => unknown) | null;
	windowClosed: ((event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
}

const form = reactive<ChoicesForm>({ content: '' });
let target: ChoicesTarget | null = null;
let commands: unknown[] | null = null;
let instance: ChoicesShape | null = null;

const parse = (choice: ChoicesData): string => {
	return removeTextTags(parseVariableTag(GameLocal.replace!(choice.content)));
};

const open = (choice: ChoicesData = { content: '', commands: [] }): void => {
	getWindowStore().open('choice');
	Object.assign(form, { content: choice.content });
	requestFocus('choice-content', 'all');
	commands = choice.commands;
};

const save = (): unknown => {
	const content = form.content.trim();
	if (content === '') {
		return requestFocus('choice-content');
	}
	getWindowStore().close('choice');
	return { content, commands };
};

const windowClosed = (_event: Event): void => {
	commands = null;
};

const confirm = (_event: Event): void => {
	target?.save?.();
};

export function useChoicesSchema(): ChoicesShape {
	if (!instance) {
		instance = {
			form,
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
