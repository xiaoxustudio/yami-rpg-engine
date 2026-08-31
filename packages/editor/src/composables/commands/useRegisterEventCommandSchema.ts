/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { getFocus, hide, show } from '@app/utils/element-utils';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { reactive } from 'vue';

type RegisterEventData = {
	target: string;
	actor?: { type: string; [k: string]: unknown };
	element?: { type: string; [k: string]: unknown };
	operation: string;
	type: string;
	priority?: boolean;
	tag?: string;
	commands?: unknown[];
	namespace?: boolean;
};

Command.cases.registerEvent = new CommandSchema({
	name: 'registerEvent',
	customParse({
		target,
		actor,
		element,
		operation,
		type,
		priority,
		tag,
		commands,
		namespace
	}: RegisterEventData) {
		const words = Command.words;
		switch (target) {
			case 'global':
				switch (operation) {
					case 'register': {
						const priorityFlag = priority ? Command.setOperatorColor!('*') : '';
						const tagName = tag
							? Token('(') + Command.parseVariableString!(tag) + Token(')')
							: '';
						words.push(
							Command.parseEventType!(target + '-event', type) +
								priorityFlag +
								tagName
						);
						break;
					}
					case 'unregister': {
						const tagName = Token('(') + Command.parseVariableString!(tag) + Token(')');
						words.push(t('command.registerEvent.reset.global-event') + tagName);
						break;
					}
					case 'reset':
						words.push(t('command.registerEvent.reset.global-events'));
						break;
				}
				break;
			case 'actor':
				switch (operation) {
					case 'register':
					case 'unregister':
						words.push(Command.parseActor!(actor));
						words.push(Command.parseEventType!(target + '-event', type));
						break;
					case 'reset':
						words.push(
							Command.parseActor!(actor) +
								Token(' -> ') +
								t('command.registerEvent.reset.events')
						);
						break;
				}
				break;
			case 'element':
				switch (operation) {
					case 'register':
					case 'unregister':
						words.push(Command.parseElement!(element));
						words.push(Command.parseEventType!(target + '-event', type));
						break;
					case 'reset':
						words.push(
							Command.parseElement!(element) +
								Token(' -> ') +
								t('command.registerEvent.reset.events')
						);
						break;
				}
				break;
		}
		if (operation === 'register' && namespace) {
			words.push(t('command.registerEvent.namespace'));
		}

		const contents: Array<{
			fold?: boolean;
			color?: string;
			text?: string;
			children?: unknown;
			break?: boolean;
		}> = [
			{ color: 'flow' },
			{
				text: t('command.registerEvent.alias.' + operation) + Token(': ')
			},
			{ text: words.join() }
		];
		if (commands) {
			contents.unshift({ fold: true });
			contents.push(
				{ children: commands },
				{ color: 'flow' },
				{ text: t('command.registerEvent.end') }
			);
		}
		return contents;
	}
});

let commands: unknown[] | null = null;
let priorityEnabled = false;

const form = reactive<RegisterEventData>({
	target: 'global',
	actor: { type: 'trigger' },
	element: { type: 'trigger' },
	operation: 'register',
	type: 'autorun',
	priority: false,
	tag: '',
	namespace: false
});

const switchTypeAndTagInput = (): void => {
	const showElement = (input: HTMLElement) => {
		show(input.previousElementSibling);
		show(input);
	};
	const hideElement = (input: HTMLElement) => {
		hide(input.previousElementSibling);
		hide(input);
	};
	const typeInput = document.getElementById('registerEvent-type')!;
	const tagInput = document.getElementById('registerEvent-tag')!;
	const target = form.target;
	const operation = form.operation;
	switch (target) {
		case 'global':
			switch (operation) {
				case 'register':
					showElement(typeInput);
					showElement(tagInput);
					break;
				case 'unregister':
					hideElement(typeInput);
					showElement(tagInput);
					break;
				case 'reset':
					hideElement(typeInput);
					hideElement(tagInput);
					break;
			}
			break;
		case 'actor':
		case 'element':
			switch (operation) {
				case 'register':
				case 'unregister':
					showElement(typeInput);
					hideElement(tagInput);
					break;
				case 'reset':
					hideElement(typeInput);
					hideElement(tagInput);
					break;
			}
			break;
	}
};

const switchPriority = (): void => {
	const priorityTypes = {
		input: true,
		keydown: true,
		keyup: true,
		mousedown: true,
		mouseup: true,
		mousemove: true,
		doubleclick: true,
		wheel: true,
		touchstart: true,
		touchmove: true,
		touchend: true,
		gamepadbuttonpress: true,
		gamepadbuttonrelease: true,
		gamepadleftstickchange: true,
		gamepadrightstickchange: true
	};
	const target = form.target;
	const operation = form.operation;
	const type = form.type;
	const priority = document.getElementById('registerEvent-priority')!;
	if (target === 'global' && operation === 'register' && type in priorityTypes) {
		show(priority.previousElementSibling);
		show(priority);
		priorityEnabled = true;
	} else {
		hide(priority.previousElementSibling);
		hide(priority);
		priorityEnabled = false;
	}
};

const switchNamespace = (): void => {
	const namespace = document.getElementById('registerEvent-namespace')!;
	const operation = form.operation;
	if (operation === 'register') {
		show(namespace.previousElementSibling);
		show(namespace);
	} else {
		hide(namespace.previousElementSibling);
		hide(namespace);
	}
};

const targetWrite = (event: { value: string }): void => {
	const type = event.value;
	const elEventType = document.getElementById('registerEvent-type')!;
	const registerType = 'register_' + type;
	const source = EventEditor.types?.[registerType] ?? EventEditor.types?.all;
	if (!source) {
		return;
	}
	const eventTypes = Enum.getMergedItems!(source, type + '-event');
	switchTypeAndTagInput();
	elEventType?.loadItems?.(eventTypes);
	elEventType?.createTooltip?.();
	form.type = eventTypes[0].value;
};

const operationWrite = (): void => {
	switchTypeAndTagInput();
	switchPriority();
	switchNamespace();
};

const typeWrite = (): void => {
	switchPriority();
};

const load = ({
	target = 'global',
	actor = { type: 'trigger' },
	element = { type: 'trigger' },
	operation = 'register',
	type = 'autorun',
	priority = false,
	namespace = false,
	tag = '',
	commands: children = []
}: {
	target?: string;
	actor?: unknown;
	element?: unknown;
	operation?: string;
	type?: string;
	priority?: boolean;
	namespace?: boolean;
	tag?: string;
	commands?: unknown;
} = {}): void => {
	Object.assign(form, {
		target,
		actor: actor as RegisterEventData['actor'],
		element: element as RegisterEventData['element'],
		operation,
		type,
		priority,
		namespace,
		tag
	});
	commands = children as unknown[];
	switchNamespace();
	getFocus(document.getElementById('registerEvent-target'));
};

const save = (): unknown => {
	const target = form.target;
	const operation = form.operation;
	const type = form.type;
	const children = commands;
	const namespace = form.namespace;
	switch (target) {
		case 'global':
			switch (operation) {
				case 'register': {
					let tag = form.tag;
					if (typeof tag === 'string') {
						tag = tag.trim();
					}
					const priority = priorityEnabled ? form.priority : false;
					commit({
						target,
						operation,
						type,
						priority,
						namespace,
						tag,
						commands: children
					});
					break;
				}
				case 'unregister': {
					let tag = form.tag;
					if (typeof tag === 'string' && (tag = tag.trim()) === '') {
						return getFocus(document.getElementById('registerEvent-tag'));
					}
					commit({ target, operation, tag });
					break;
				}
				case 'reset':
					commit({ target, operation });
					break;
			}
			break;
		case 'actor': {
			const actor = form.actor;
			switch (operation) {
				case 'register':
					commit({
						target,
						actor,
						operation,
						type,
						namespace,
						commands: children
					});
					break;
				case 'unregister':
					commit({ target, actor, operation, type });
					break;
				case 'reset':
					commit({ target, actor, operation });
					break;
			}
			break;
		}
		case 'element': {
			const element = form.element;
			switch (operation) {
				case 'register':
					commit({
						target,
						element,
						operation,
						type,
						namespace,
						commands: children
					});
					break;
				case 'unregister':
					commit({ target, element, operation, type });
					break;
				case 'reset':
					commit({ target, element, operation });
					break;
			}
			break;
		}
	}
};

const schema = Command.cases.registerEvent;
schema.targetWrite = targetWrite;
schema.operationWrite = operationWrite;
schema.typeWrite = typeWrite;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useRegisterEventCommandSchema() {
	return { form, load, save, targetWrite, operationWrite, typeWrite };
}
