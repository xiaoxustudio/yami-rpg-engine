import '@app/legacy/module/command/registerEvent.ts';
import { getElementReader, getElementWriter } from '@app/utils/dom';
import { Command } from '@app/legacy/command/command-object.ts';
import { EventEditor } from '@app/legacy/command/event-editor.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { getFocus, hide, read, show, write } from '@app/utils/element-utils';

let commands: unknown[] | null = null;
let priorityEnabled = false;

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
	const target = read(document.getElementById('registerEvent-target'));
	const operation = read(document.getElementById('registerEvent-operation'));
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
	const target = read(document.getElementById('registerEvent-target'));
	const operation = read(document.getElementById('registerEvent-operation'));
	const type = read(document.getElementById('registerEvent-type'));
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
	const operation = read(document.getElementById('registerEvent-operation'));
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
	const eventTypes = Enum.getMergedItems!(
		EventEditor.types?.[registerType] ?? EventEditor.types?.all,
		type + '-event'
	);
	switchTypeAndTagInput();
	elEventType.loadItems(eventTypes);
	elEventType.createTooltip();
	write(elEventType, eventTypes[0].value);
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
	const write = getElementWriter('registerEvent');
	write('target', target);
	write('actor', actor);
	write('element', element);
	write('operation', operation);
	write('type', type);
	write('priority', priority);
	write('namespace', namespace);
	write('tag', tag);
	commands = children as unknown[];
	switchNamespace();
	getFocus(document.getElementById('registerEvent-target'));
};

const save = (): unknown => {
	const read = getElementReader('registerEvent');
	const target = read('target');
	const operation = read('operation');
	const type = read('type');
	const children = commands;
	const namespace = read('namespace');
	switch (target) {
		case 'global':
			switch (operation) {
				case 'register': {
					let tag = read('tag');
					if (typeof tag === 'string') {
						tag = tag.trim();
					}
					const priority = priorityEnabled ? read('priority') : false;
					Command.save?.({
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
					let tag = read('tag');
					if (typeof tag === 'string' && (tag = tag.trim()) === '') {
						return getFocus(document.getElementById('registerEvent-tag'));
					}
					Command.save?.({ target, operation, tag });
					break;
				}
				case 'reset':
					Command.save?.({ target, operation });
					break;
			}
			break;
		case 'actor': {
			const actor = read('actor');
			switch (operation) {
				case 'register':
					Command.save?.({
						target,
						actor,
						operation,
						type,
						namespace,
						commands: children
					});
					break;
				case 'unregister':
					Command.save?.({ target, actor, operation, type });
					break;
				case 'reset':
					Command.save?.({ target, actor, operation });
					break;
			}
			break;
		}
		case 'element': {
			const element = read('element');
			switch (operation) {
				case 'register':
					Command.save?.({
						target,
						element,
						operation,
						type,
						namespace,
						commands: children
					});
					break;
				case 'unregister':
					Command.save?.({ target, element, operation, type });
					break;
				case 'reset':
					Command.save?.({ target, element, operation });
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
	return { load, save, targetWrite, operationWrite, typeWrite };
}
