import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { EventEditor } from '@/command/event-editor.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Enum } from '@/enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';
import { getFocus, hide, read, show, write } from '@/util/element-utils';

Command.cases.registerEvent = new CommandSchema({
	name: 'registerEvent',
	commands: [],
	priorityEnabled: false,
	onInitialize() {
		$('#registerEvent-confirm').on('click', () => this.save!());
		$('#registerEvent-target').loadItems([
			{ name: 'Global', value: 'global' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Element', value: 'element' }
		]);
		$('#registerEvent-target')
			.enableHiddenMode()
			.relate([
				{ case: 'actor', targets: [$('#registerEvent-actor')] },
				{ case: 'element', targets: [$('#registerEvent-element')] }
			]);
		$('#registerEvent-operation').loadItems([
			{ name: 'Register', value: 'register' },
			{ name: 'Unregister', value: 'unregister' },
			{ name: 'Reset', value: 'reset' }
		]);
	},
	targetWrite(event: any) {
		const type = event.value;
		const elEventType = $('#registerEvent-type');
		const registerType = 'register_' + type;
		const eventTypes = Enum.getMergedItems!(EventEditor.types[registerType], type + '-event');
		this.switchTypeAndTagInput!();
		elEventType.loadItems(eventTypes);
		elEventType.createTooltip();
		write(elEventType, eventTypes[0].value);
	},
	operationWrite() {
		this.switchTypeAndTagInput!();
		this.switchPriority!();
		this.switchNamespace!();
	},
	typeWrite() {
		this.switchPriority!();
	},
	switchTypeAndTagInput(event: any) {
		const showElement = (input: any) => {
			show(input.previousElementSibling);
			show(input);
		};
		const hideElement = (input: any) => {
			hide(input.previousElementSibling);
			hide(input);
		};
		const typeInput = $('#registerEvent-type');
		const tagInput = $('#registerEvent-tag');
		const target = read($('#registerEvent-target'));
		const operation = read($('#registerEvent-operation'));
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
	},
	switchPriority() {
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
		const target = read($('#registerEvent-target'));
		const operation = read($('#registerEvent-operation'));
		const type = read($('#registerEvent-type'));
		const priority = $('#registerEvent-priority');
		if (target === 'global' && operation === 'register' && type in priorityTypes) {
			show(priority.previousElementSibling);
			show(priority);
			this.priorityEnabled = true;
		} else {
			hide(priority.previousElementSibling);
			hide(priority);
			this.priorityEnabled = false;
		}
	},
	switchNamespace() {
		const namespace = $('#registerEvent-namespace');
		const operation = read($('#registerEvent-operation'));
		if (operation === 'register') {
			show(namespace.previousElementSibling);
			show(namespace);
		} else {
			hide(namespace.previousElementSibling);
			hide(namespace);
		}
	},
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
	}: any) {
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
						words.push(
							Local.get!('command.registerEvent.reset.global-event') + tagName
						);
						break;
					}
					case 'reset':
						words.push(Local.get!('command.registerEvent.reset.global-events'));
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
								Local.get!('command.registerEvent.reset.events')
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
								Local.get!('command.registerEvent.reset.events')
						);
						break;
				}
				break;
		}
		if (operation === 'register' && namespace) {
			words.push(Local.get!('command.registerEvent.namespace'));
		}

		const contents: any[] = [
			{ color: 'flow' },
			{
				text: Local.get!('command.registerEvent.alias.' + operation) + Token(': ')
			},
			{ text: words.join() }
		];
		if (commands) {
			contents.unshift({ fold: true });
			contents.push(
				{ children: commands },
				{ color: 'flow' },
				{ text: Local.get!('command.registerEvent.end') }
			);
		}
		return contents;
	},
	customLoad({
		target = 'global',
		actor = { type: 'trigger' },
		element = { type: 'trigger' },
		operation = 'register',
		type = 'autorun',
		priority = false,
		namespace = false,
		tag = '',
		commands = []
	}) {
		const write = getElementWriter('registerEvent');
		write('target', target);
		write('actor', actor);
		write('element', element);
		write('operation', operation);
		write('type', type);
		write('priority', priority);
		write('namespace', namespace);
		write('tag', tag);
		this.commands = commands;
		this.switchNamespace!();
		getFocus($('#registerEvent-target'));
	},
	customSave() {
		const read = getElementReader('registerEvent');
		const target = read('target');
		const operation = read('operation');
		const type = read('type');
		const commands = this.commands;
		const namespace = read('namespace');
		switch (target) {
			case 'global':
				switch (operation) {
					case 'register': {
						let tag = read('tag');
						if (typeof tag === 'string') {
							tag = tag.trim();
						}
						const priority = this.priorityEnabled ? read('priority') : false;
						Command.save!({
							target,
							operation,
							type,
							priority,
							namespace,
							tag,
							commands
						});
						break;
					}
					case 'unregister': {
						let tag = read('tag');
						if (typeof tag === 'string' && (tag = tag.trim()) === '') {
							return getFocus($('#registerEvent-tag'));
						}
						Command.save!({ target, operation, tag });
						break;
					}
					case 'reset':
						Command.save!({ target, operation });
						break;
				}
				break;
			case 'actor': {
				const actor = read('actor');
				switch (operation) {
					case 'register':
						Command.save!({
							target,
							actor,
							operation,
							type,
							namespace,
							commands
						});
						break;
					case 'unregister':
						Command.save!({ target, actor, operation, type });
						break;
					case 'reset':
						Command.save!({ target, actor, operation });
						break;
				}
				break;
			}
			case 'element': {
				const element = read('element');
				switch (operation) {
					case 'register':
						Command.save!({
							target,
							element,
							operation,
							type,
							namespace,
							commands
						});
						break;
					case 'unregister':
						Command.save!({ target, element, operation, type });
						break;
					case 'reset':
						Command.save!({ target, element, operation });
						break;
				}
				break;
			}
		}
	}
});
