import { EventEditor } from './event-editor.ts';
import type {
	EventCommands,
	EventEditorEventShape,
	EventEditorShape,
	EventListItem
} from './event-editor.ts';
import { clear, hide, show } from '@app/utils/element-utils.ts';
import { setTreeItemClass } from '@ui-kit';
import { getElementWriter, renderDetached } from '@app/utils/dom';
import { h } from 'vue';
import { eventEditorEls } from './event-editor-initialize.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Data } from '@app/data/data-object.ts';

EventEditor.clearAllEventClasses = function (this: EventEditorShape, ...items: EventListItem[]) {
	for (const item of items) {
		setTreeItemClass(item, 'local-event', false);
		setTreeItemClass(item, 'global-event', false);
		setTreeItemClass(item, 'related-event', false);
	}
};

EventEditor.clearRelatedEventClasses = function (
	this: EventEditorShape,
	...items: EventListItem[]
) {
	for (const item of items) {
		setTreeItemClass(item, 'related-event', false);
	}
};

EventEditor.save = function (this: EventEditorShape, item: EventListItem) {
	const commands = item.commands!;
	commands.history.saveState();
	this.appendCommandsToCaches!(commands);
	const commandsClone = Object.clone(commands);
	Object.defineProperty(commandsClone, 'symbol', {
		configurable: true,
		value: commands.symbol
	});
	return {
		type: item.type,
		enabled: item.event.enabled,
		commands: commandsClone
	};
};

EventEditor.isChanged = function (this: EventEditorShape) {
	for (const item of this.data!) {
		if (item.changed) {
			return true;
		}
	}
	return false;
};

EventEditor.getItemById = function (this: EventEditorShape, id: string) {
	const items = this.data!;
	const length = items.length;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		if (item.id === id) {
			return item;
		}
	}
	return undefined;
};

EventEditor.getItemByEvent = function (this: EventEditorShape, event: EventEditorEventShape) {
	const items = this.data!;
	const length = items.length;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		if (item.event === event) {
			return item;
		}
	}
	return undefined;
};

EventEditor.openCommandList = function (this: EventEditorShape, item: EventListItem) {
	this.fetchCommandBuffer!(item);
	const fieldset = eventEditorEls.get('event-commands-fieldset');
	const typeEl = eventEditorEls.get('event-type');
	if (fieldset) show(fieldset);
	if (typeEl) show(typeEl);

	const { commands, filter } = item;

	typeEl?.loadItems?.(
		Enum.getMergedItems!(this.types?.[filter] ?? this.types?.all, filter + '-event')
	);

	typeEl?.createTooltip?.();

	const write = getElementWriter('event');
	write('commands', commands);
	write('type', item.type);

	// 窗口刚打开时布局可能未就绪（clientHeight 0），resize 会跳过渲染，延迟刷新确保指令显示
	const { commandList } = this;
	if (commandList) {
		setTimeout(() => {
			commandList.resize();
		}, 0);
	}
};

EventEditor.closeCommandList = function (this: EventEditorShape) {
	clear(this.commandList);
	const fieldset = eventEditorEls.get('event-commands-fieldset');
	const typeEl = eventEditorEls.get('event-type');
	if (fieldset) hide(fieldset);
	if (typeEl) hide(typeEl);
};

EventEditor.unpackOpenEvents = function (this: EventEditorShape) {
	const copies: EventListItem[] = [];
	const events = Editor.project!.openEvents!;
	let i = events.length;
	while (--i >= 0) {
		if (Data.events[events[i].id] === undefined) {
			events.splice(i, 1);
		}
	}
	for (const item of events) {
		if ('name' in item) {
			item.name = EventEditor.getGlobalEventName!(item.id);
			EventEditor.list.updateItemName!(item);
			copies.push(item as EventListItem);
		} else {
			copies.push(EventEditor.list.createGlobalEventItem!(item.id));
		}
	}
	this.data = copies;
};

EventEditor.packOpenEvents = function (this: EventEditorShape) {
	const copies: EventListItem[] = [];
	for (const item of this.data!) {
		if (item.class === 'global') {
			copies.push(item);
		}
	}
	Editor.project!.openEvents = copies;
};

EventEditor.resizeGutter = function (this: EventEditorShape) {
	const { outerGutter, innerGutter } = this;
	const height = outerGutter.clientHeight;
	if (height !== 0) {
		const length = Math.ceil(height / 20) + 1;
		const nodes = innerGutter.childNodes;
		let i = nodes.length;
		if (i !== length) {
			if (i < length) {
				while (i < length) {
					// P1b：离屏节点统一走 utils/dom 的 renderDetached（原先 document.createElement + addClass）
					const node = renderDetached(h('div', { class: 'box event-commands-line-number' }));
					innerGutter.appendChild(node);
					i++;
				}
			} else {
				while (--i >= length) {
					nodes[i].remove();
				}
			}
		}
	}
};

EventEditor.updateGutter = function (this: EventEditorShape) {
	const { commandList } = this;
	const { scrollTop } = commandList;
	const { outerGutter, innerGutter } = EventEditor;
	const start = Math.floor(scrollTop / 20) + 1;
	const end = commandList.elements.count + 1;
	const nodes = innerGutter.childNodes;
	const length = nodes.length;
	for (let i = 0; i < length; i++) {
		const node = nodes[i] as HTMLElement;
		const number = start + i;
		if (number < end) {
			node.textContent = number.toString();
		} else {
			node.textContent = '';
		}
	}
	const tolerance = 0.0001;
	outerGutter.scrollTop = (scrollTop + tolerance) % 20;
};

EventEditor.appendCommandsToCaches = function (this: EventEditorShape, commands: EventCommands) {
	const { caches } = this;
	if (caches.push(commands) && caches.length > 50) {
		caches.shift();
	}
};

EventEditor.fetchCommandBuffer = function (this: EventEditorShape, item: EventListItem) {
	if (item.commands) return;
	const { event, id } = item;
	const commands = event.commands;
	if (!commands.symbol) {
		Object.defineProperty(commands, 'symbol', {
			configurable: true,
			value: Symbol()
		});
	}

	const symbol = commands.symbol;
	let commandsClone = this.caches.find((target) => {
		return target.symbol === symbol;
	});

	if (!commandsClone) {
		commandsClone = Object.clone(commands);
		Object.defineProperties(commandsClone, {
			symbol: {
				configurable: true,
				value: symbol
			},
			eventId: {
				configurable: true,
				value: id
			}
		});
	}

	item.commands = commandsClone;
};

EventEditor.clearCommandBuffers = function (this: EventEditorShape) {
	const { commandList } = this;
	for (const commands of this.caches) {
		commandList.deleteCommandBuffers(commands);
		const { stack } = commands.history;
		const { length } = stack;
		for (let i = 0; i < length; i++) {
			const { commands } = stack[i];
			commandList.deleteCommandBuffers(commands);
		}
	}
};

EventEditor.getGlobalEventName = function (this: EventEditorShape, id: string) {
	return Data.manifest.guidMap[id]?.file.basename ?? '';
};
