import { EventEditor } from './event-editor.ts';
import type { EventEditorShape, EventListItem } from './event-editor.ts';
import { Window } from '@app/tools/window-object.ts';
import { addClass, clear, read, removeClass, write } from '@app/utils/element-utils';
import { setTreeItemClass, treeItemOf } from '@ui-kit';
import { ctrl } from '@app/utils/event-accessors';
import { getLazyWindow } from '@app/tools/window-registry';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { parseLocalTip } from '@app/localize/dom-localizer';
import { Menu } from '@app/components/menu-list.ts';
import type { YamiMouseEvent } from '@app/types/editor-event';

const loadCluster = () => import('@app/tools/window-cluster');
const File = getLazyWindow('file', () => loadCluster().then((m) => m.File));
const Inspector = getLazyWindow('inspector', () => loadCluster().then((m) => m.Inspector));

EventEditor.windowLocalize = function (this: EventEditorShape, _event: YamiMouseEvent) {
	const types = EventEditor.types;
	const getType = (key: string) => t('eventTypes.' + key);
	const getTip = (key: string) => t('eventTips.' + key);
	for (const item of types.all) {
		const key = item.value;
		const name = getType(key);
		const tip = getTip(key);
		if (name !== '') {
			item.name = name;
		}
		if (tip !== '') {
			item.tip = parseLocalTip(tip, name);
		}
	}
	for (const selectBox of types.relatedElements) {
		selectBox.createTooltip();
		if (read(selectBox)) {
			selectBox.update();
		}
	}
};

EventEditor.windowClose = function (this: EventEditorShape, event: YamiMouseEvent) {
	this.closing = true;
	if (this.isChanged!()) {
		event.preventDefault();
		const get = (key: string) => t('confirmation.' + key);
		return Window.confirm!(
			{
				message: get('closeUnsavedEvent')
			},
			[
				{
					label: get('yes'),
					click: () => {
						for (const item of this.data!) {
							if (item.changed) {
								item.changed = false;
								const commands = item.commands!;
								if (commands.history.restoreState()) {
									this.appendCommandsToCaches!(commands);
								} else {
									this.caches.splice(this.caches.indexOf(commands), 1);
									item.commands = null;
								}
							}
						}
						Window.close!('event');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
	this.list.saveScroll!();
	this.closing = false;
}.bind(EventEditor);

EventEditor.windowClosed = function (this: EventEditorShape, _event: YamiMouseEvent) {
	this.clearAllEventClasses!(...(this.data ?? []));
	this.packOpenEvents!();
	this.data = null;
	clear(this.list);
	clear(this.commandList);
	this.clearCommandBuffers!();
	window.removeEventListener('keydown', this.windowKeydown!);
}.bind(EventEditor);

EventEditor.windowResize = function (this: EventEditorShape, _event: YamiMouseEvent) {
	const { list, commandList } = EventEditor;
	const parent = commandList.parentNode as HTMLElement;
	const outerHeight = parent.clientHeight;
	const innerHeight = Math.max(outerHeight - 20, 0);
	Object.defineProperty(commandList, 'innerHeight', {
		configurable: true,
		value: innerHeight
	});

	const { innerGutter } = EventEditor;
	const paddingBottom = innerHeight - 20;
	commandList.style.paddingBottom = `${paddingBottom + 10}px`;
	innerGutter.style.paddingBottom = `${paddingBottom}px`;

	list.resize!();
	commandList.resize();

	// 会触发BUG: 插入指令resize刷新时增加scrollTop 重置scrollTop可以避免这个现象 由于scroll是异步事件因此不会重复触发
	const st = commandList.scrollTop;
	commandList.scrollTop = 0;
	commandList.scrollTop = st;

	EventEditor.resizeGutter!();
	EventEditor.updateGutter!();
};

EventEditor.windowKeydown = function (this: EventEditorShape, event: KeyboardEvent) {
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyW':
				if (Window.getTopWindow!()?.id === 'event') {
					EventEditor.list.close!();
				}
				break;
		}
	}
	if (event.altKey) {
		switch (event.code) {
			case 'AltLeft':
				if (Window.getTopWindow!()?.id === 'event') {
					addClass(EventEditor.list, 'alt');
					addClass(EventEditor.commandList, 'alt');
					window.addEventListener('keyup', EventEditor.windowKeyup!);
					window.addEventListener('pointermove', EventEditor.windowPointermove!);
				}
				break;
		}
	}
};

EventEditor.windowKeyup = function (this: EventEditorShape, event: KeyboardEvent) {
	if (!event.altKey) {
		switch (event.code) {
			case 'AltLeft':
				removeClass(EventEditor.list, 'alt');
				removeClass(EventEditor.commandList, 'alt');
				window.removeEventListener('keyup', EventEditor.windowKeyup!);
				window.removeEventListener('pointermove', EventEditor.windowPointermove!);
				break;
		}
	}
};

EventEditor.windowPointermove = function (this: EventEditorShape, event: PointerEvent) {
	if (!event.altKey) {
		removeClass(EventEditor.list, 'alt');
		removeClass(EventEditor.commandList, 'alt');
		window.removeEventListener('keyup', EventEditor.windowKeyup!);
		window.removeEventListener('pointermove', EventEditor.windowPointermove!);
	}
};

EventEditor.listPointerdown = function (this: EventEditorShape, event: PointerEvent) {
	if (event.altKey && event.button === 0) {
		// P4b：行 → item 经行 API 取（`element.item` expando 已退役）；标签文字上的点击同样归一成行
		const item = treeItemOf<EventListItem>(event.target);
		if (item !== undefined && item.id) {
			// 阻止focus后快捷键不被禁用的情况
			event.preventDefault();
			event.stopImmediatePropagation();
			EventEditor.findRelatedEvents!(item.id);
		}
	}
};

EventEditor.listSelect = function (this: EventEditorShape, event: YamiMouseEvent) {
	const item = event.value;
	EventEditor.openCommandList!(item);
	// 步骤 4：行 class 经派生层注册（窗口外行同样生效）
	setTreeItemClass(item, 'related-event', false);
};

EventEditor.listPopup = function (this: EventEditorShape, event: YamiMouseEvent) {
	const item = event.value;
	const selected = !!item;
	const get = (key: string) => t('menuEventList.' + key);
	Menu.popup!(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('close'),
				accelerator: ctrl('W'),
				enabled: selected,
				click: () => {
					EventEditor.list.close!(item);
				}
			},
			{
				label: get('close-below'),
				enabled: selected,
				click: () => {
					EventEditor.list.closeBelow!(item);
				}
			},
			{
				label: get('close-others'),
				enabled: selected,
				click: () => {
					EventEditor.list.closeOthers!(item);
				}
			},
			{
				label: get('close-all'),
				enabled: selected,
				click: () => {
					EventEditor.list.closeAll!();
				}
			},
			{
				label: get('find-related-events'),
				accelerator: 'Alt+LB',
				enabled: selected && item.id !== '',
				click: () => {
					EventEditor.findRelatedEvents!(item.id);
				}
			}
		]
	);
};

EventEditor.typeInput = function (this: EventEditorShape, event: YamiMouseEvent) {
	const item = read(EventEditor.list);
	if (!item.changed) {
		item.changed = true;
		item.name += '*';
	}
	item.type = event.value;
	EventEditor.list.updateItemName!(item);
};

EventEditor.commandListChange = function (this: EventEditorShape, _event: YamiMouseEvent) {
	if (EventEditor.closing) return;
	const item = read(EventEditor.list);
	if (!item.changed) {
		item.changed = true;
		item.name += '*';
		EventEditor.list.updateItemName!(item);
	}
};

EventEditor.commandListUpdate = function (this: EventEditorShape, _event: YamiMouseEvent) {
	EventEditor.resizeGutter!();
	EventEditor.updateGutter!();
};

EventEditor.commandListScroll = function (this: EventEditorShape, _event: YamiMouseEvent) {
	EventEditor.updateGutter!();
};

EventEditor.confirm = function (this: EventEditorShape, _event: YamiMouseEvent) {
	this.apply!();
	Window.close!('event');
}.bind(EventEditor);

EventEditor.apply = function (this: EventEditorShape, _event: YamiMouseEvent) {
	for (const item of this.data!) {
		switch (item.class) {
			case 'global':
				if (item.changed) {
					item.changed = false;
					File.planToSave!(item.meta);
					const event = item.event;
					const save = EventEditor.save!(item);
					if (event.type !== save.type) {
						event.type = save.type;
						if (Inspector.fileEvent.target === event) {
							write(Inspector.fileEvent, { type: event.type });
						}
					}
					event.commands = save.commands;
				}
				break;
			case 'local':
				if (item.changed || item.inserting) {
					item.changed = false;
					item.inserting = false;
					if (item.callback) {
						item.callback();
					} else {
						const save = EventEditor.save!(item);
						item.event.type = save.type;
						item.event.commands = save.commands;
					}
				}
				break;
		}
	}
}.bind(EventEditor);
