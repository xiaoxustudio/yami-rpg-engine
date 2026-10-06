import { Command } from '@app/commands/command-object.ts';
import { composableEls } from '@app/composables/element-registry';
import { commit } from '@app/composables/useCommandSchema';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { hide, show } from '@app/utils/element-utils';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getCommandSchemaFormsStore } from '@app/stores/command-schema-forms';
import type { YamiElement } from '@app/types/element-api';

export type RegisterEventData = {
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

// 表单真源在 `stores/command-schema-forms.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ `Object.assign(form, …)`、`const data = form` 与模板 v-model 都不用改。
const form: RegisterEventData = {
	get target(): RegisterEventData['target'] {
		return getCommandSchemaFormsStore().registerEventData.target;
	},
	set target(value: RegisterEventData['target']) {
		getCommandSchemaFormsStore().registerEventData.target = value;
	},
	get actor(): RegisterEventData['actor'] {
		return getCommandSchemaFormsStore().registerEventData.actor;
	},
	set actor(value: RegisterEventData['actor']) {
		getCommandSchemaFormsStore().registerEventData.actor = value;
	},
	get element(): RegisterEventData['element'] {
		return getCommandSchemaFormsStore().registerEventData.element;
	},
	set element(value: RegisterEventData['element']) {
		getCommandSchemaFormsStore().registerEventData.element = value;
	},
	get operation(): RegisterEventData['operation'] {
		return getCommandSchemaFormsStore().registerEventData.operation;
	},
	set operation(value: RegisterEventData['operation']) {
		getCommandSchemaFormsStore().registerEventData.operation = value;
	},
	get type(): RegisterEventData['type'] {
		return getCommandSchemaFormsStore().registerEventData.type;
	},
	set type(value: RegisterEventData['type']) {
		getCommandSchemaFormsStore().registerEventData.type = value;
	},
	get priority(): RegisterEventData['priority'] {
		return getCommandSchemaFormsStore().registerEventData.priority;
	},
	set priority(value: RegisterEventData['priority']) {
		getCommandSchemaFormsStore().registerEventData.priority = value;
	},
	get tag(): RegisterEventData['tag'] {
		return getCommandSchemaFormsStore().registerEventData.tag;
	},
	set tag(value: RegisterEventData['tag']) {
		getCommandSchemaFormsStore().registerEventData.tag = value;
	},
	get namespace(): RegisterEventData['namespace'] {
		return getCommandSchemaFormsStore().registerEventData.namespace;
	},
	set namespace(value: RegisterEventData['namespace']) {
		getCommandSchemaFormsStore().registerEventData.namespace = value;
	}
};

const switchTypeAndTagInput = (): void => {
	const showElement = (input: HTMLElement) => {
		show(input.previousElementSibling);
		show(input);
	};
	const hideElement = (input: HTMLElement) => {
		hide(input.previousElementSibling);
		hide(input);
	};
	const typeInput = composableEls.get('registerEvent-type') as YamiElement;
	const tagInput = composableEls.get('registerEvent-tag') as YamiElement;
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
	const priority = composableEls.get('registerEvent-priority') as YamiElement;
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
	const namespace = composableEls.get('registerEvent-namespace') as YamiElement;
	const operation = form.operation;
	if (operation === 'register') {
		show(namespace.previousElementSibling);
		show(namespace);
	} else {
		hide(namespace.previousElementSibling);
		hide(namespace);
	}
};

const createEventTypeItems = (target: string): Array<{ name: string; value: string }> | null => {
	const source = EventEditor.types?.['register_' + target] ?? EventEditor.types?.all;
	if (!source) {
		return null;
	}
	const items = Enum.getMergedItems!(source, target + '-event') as Array<{
		name: string;
		value: string;
	}>;
	return items.length > 0 ? items : null;
};

// 依据 target 加载 Type 下拉选项；用户主动切换 target 时强制回到该组首个事件类型
const syncEventTypes = (target: string): void => {
	const elEventType = composableEls.get('registerEvent-type');
	if (!elEventType) {
		return;
	}
	const eventTypes = createEventTypeItems(target);
	if (!eventTypes) {
		return;
	}
	// 窗口挂载早期元素可能尚未挂载控件 API，需保持可选调用
	elEventType.loadItems?.(eventTypes);
	elEventType.createTooltip?.();
};

const targetWrite = (event: { value: string }): void => {
	const type = event.value;
	const eventTypes = createEventTypeItems(type);
	if (!eventTypes) {
		return;
	}
	switchTypeAndTagInput();
	syncEventTypes(type);
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
	// 打开/编辑窗口时按已载入的 target/operation/type 同步联动：
	// Type 下拉必须先加载选项，否则选项为空（默认显示红色无效 autorun、无法展开下拉）
	switchTypeAndTagInput();
	syncEventTypes(form.target);
	switchPriority();
	switchNamespace();
	requestFocus('registerEvent-target');
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
						return requestFocus('registerEvent-tag');
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
