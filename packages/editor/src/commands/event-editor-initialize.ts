import { EventEditor } from './event-editor.ts';
import type {
	EventCommandListShape,
	EventEditorEventShape,
	EventEditorList,
	EventEditorShape,
	EventListItem
} from './event-editor.ts';
import { getListConfig, treeRowCount, treeRowItemAt } from '@ui-kit';
import { createElementRegistry, registryElement } from '@app/utils/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { on, read } from '@app/utils/element-utils.ts';
import { getElementData } from '@app/utils/element-data';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { TreeList } from '@app/components/tree-list.ts';
import { Data } from '@app/data/data-object.ts';
import { getEventEditorStore } from '@app/stores/event-editor';
import type { YamiElement } from '@app/types/element-api';

/** P5b 批次 2：事件编辑器窗口的元素注册表——由 `Event.vue` 在模板里登记 */
export const eventEditorEls = createElementRegistry();

function ensureDomBound() {
	if (EventEditor.list) return;
	const list = eventEditorEls.get('event-open-list');
	if (!list) return;
	EventEditor.list = list as unknown as HTMLElement & EventEditorList;
	EventEditor.commandList = registryElement<EventCommandListShape>(
		eventEditorEls,
		'event-commands'
	)!;
	// 注册表在挂载后才填充，未挂载时为 undefined；沿用原先 `$()` 的非空断言语义
	EventEditor.outerGutter = eventEditorEls.get('event-commands-gutter-outer') as YamiElement;
	EventEditor.innerGutter = eventEditorEls.get('event-commands-gutter-inner') as YamiElement;
	// P4b：滚动位置改用显式元素数据（原先写的是原型访问器 `lastScrollTop`）
	getElementData(EventEditor.list as unknown as HTMLElement).lastScrollTop = 0;
	EventEditor.list.close = null;
	EventEditor.list.closeMultiple = null;
	EventEditor.list.closeBelow = null;
	EventEditor.list.closeOthers = null;
	EventEditor.list.closeAll = null;
	EventEditor.list.defineProperties = null;
	EventEditor.list.createLocalEventItem = null;
	EventEditor.list.createGlobalEventItem = null;
	bindListMethods();
}

function bindListMethods() {
	const list = EventEditor.list!;
	list.selectIndex = function (this: HTMLElement & EventEditorList, index: number) {
		// 步骤 5b：行元素簿记（`elements` shim）已随模板渲染删除 ⇒ 按**行号**取 item
		// （窗口外的行同样取得到，与旧实现"取不到就什么都不做"的边界一致）
		const count = treeRowCount(this);
		const last = count - 1;
		if (index < 0 || last < 0) return;
		const item = treeRowItemAt<EventListItem>(this, Math.min(index, last));
		if (item !== undefined) {
			this.select!(item);
		}
	};

	list.close = function (this: HTMLElement & EventEditorList, item?: EventListItem) {
		if (item === undefined) {
			item = read(this);
		}
		if (item) {
			const close = () => {
				const index = this.data!.indexOf(item);
				EventEditor.clearAllEventClasses!(item!);
				this.deleteNode!(item!);
				EventEditor.closeCommandList!();
				this.selectIndex!(index);
			};
			if (item.changed) {
				const get = (key: string) => t('confirmation.' + key);
				return Window.confirm!(
					{
						message: get('closeUnsavedEvent')
					},
					[
						{
							label: get('yes'),
							click: close
						},
						{
							label: get('no')
						}
					]
				);
			}
			close();
		}
	};

	list.closeMultiple = function (
		this: HTMLElement & EventEditorList,
		items: EventListItem[],
		callback?: () => void
	) {
		if (items.length === 0) return;
		const closeMultiple = () => {
			for (const item of items) {
				EventEditor.clearAllEventClasses!(item);
				this.deleteNode!(item);
			}
			callback?.();
		};
		for (const item of items) {
			if (item.changed) {
				const get = (key: string) => t('confirmation.' + key);
				return Window.confirm!(
					{
						message: get('closeUnsavedEvent')
					},
					[
						{
							label: get('yes'),
							click: closeMultiple
						},
						{
							label: get('no')
						}
					]
				);
			}
		}
		closeMultiple();
	};

	list.closeBelow = function (this: HTMLElement & EventEditorList, item: EventListItem) {
		const index = this.data!.indexOf(item);
		this.closeMultiple!(this.data.slice(index + 1));
	};

	list.closeOthers = function (this: HTMLElement & EventEditorList, item: EventListItem) {
		const items = this.data.slice();
		items.splice(items.indexOf(item), 1);
		this.closeMultiple!(items);
	};

	list.closeAll = function (this: HTMLElement & EventEditorList) {
		const callback = () => EventEditor.closeCommandList!();
		this.closeMultiple!(this.data.slice(), callback);
	};

	list.saveScroll = function (this: HTMLElement & EventEditorList) {
		// P4b：改用显式元素数据（原先读写原型访问器 `lastScrollTop`）
		getElementData(this).lastScrollTop = this.scrollTop;
	};

	list.restoreScroll = function (this: HTMLElement & EventEditorList) {
		this.scrollTop = Number(getElementData(this).lastScrollTop ?? 0);
	};

	list.defineProperties = function (
		this: HTMLElement & EventEditorList,
		item: { id: string }
	): EventListItem {
		return Object.defineProperties(item, {
			name: { writable: true, value: '' },
			class: { writable: true, value: '' },
			type: { writable: true, value: '' },
			commands: { writable: true, value: null },
			filter: { writable: true, value: '' },
			meta: { writable: true, value: null },
			event: { writable: true, value: null },
			callback: { writable: true, value: null },
			changed: { writable: true, value: false },
			inserting: { writable: true, value: false }
		}) as EventListItem;
	};

	list.createLocalEventItem = function (
		this: HTMLElement & EventEditorList,
		inserting: boolean,
		filter: string,
		name: string,
		event: EventEditorEventShape,
		callback: (() => void) | null
	) {
		const item = EventEditor.list.defineProperties!({ id: '' });
		item.name = name;
		item.class = 'local';
		item.filter = filter;
		item.type = event.type;
		item.event = event;
		item.callback = callback;
		item.inserting = inserting;
		item.changed = false;
		return item;
	};

	list.createGlobalEventItem = function (this: HTMLElement & EventEditorList, guid: string) {
		const item = EventEditor.list.defineProperties!({ id: guid });
		const event = Data.events[guid];
		item.name = EventEditor.getGlobalEventName!(guid);
		item.class = 'global';
		item.filter = 'global';
		item.type = event.type;
		item.meta = Data.manifest.guidMap[guid];
		item.event = Data.events[guid];
		item.callback = null;
		item.changed = false;
		return item;
	};

	list.updateItemName = function (this: HTMLElement & EventEditorList, item: EventListItem) {
		TreeList.prototype.updateItemName.call(this, item);
		this.update();
	} as ((item: unknown) => unknown) & ((item: EventListItem) => void);
}

EventEditor.initialize = function (this: EventEditorShape) {
	getEventEditorStore().syncState();
	ensureDomBound();
	const { list } = this;
	if (!list || this._initialized) return;
	this._initialized = true;
	getListConfig(list).removable = true;
	getListConfig(list).foldable = false;
	list.bind!(() => this.data);

	const types = {
		common: { name: 'Common', value: 'common', tip: '' },
		create: { name: 'Create', value: 'create', tip: '' },
		autorun: { name: 'Autorun', value: 'autorun', tip: '' },
		collision: { name: 'Collision', value: 'collision', tip: '' },
		hittrigger: { name: 'Hit Trigger', value: 'hittrigger', tip: '' },
		hitactor: { name: 'Hit Actor', value: 'hitactor', tip: '' },
		destroy: { name: 'Destroy', value: 'destroy', tip: '' },
		playerenter: { name: 'Player Enter', value: 'playerenter', tip: '' },
		playerleave: { name: 'Player Leave', value: 'playerleave', tip: '' },
		actorenter: { name: 'Actor Enter', value: 'actorenter', tip: '' },
		actorleave: { name: 'Actor Leave', value: 'actorleave', tip: '' },
		skillcast: { name: 'Cast Skill', value: 'skillcast', tip: '' },
		skilladd: { name: 'Add Skill', value: 'skilladd', tip: '' },
		skillremove: { name: 'Remove Skill', value: 'skillremove', tip: '' },
		stateadd: { name: 'Add State', value: 'stateadd', tip: '' },
		stateremove: { name: 'Remove State', value: 'stateremove', tip: '' },
		equipmentadd: { name: 'Add Equipment', value: 'equipmentadd', tip: '' },
		equipmentremove: {
			name: 'Remove Equipment',
			value: 'equipmentremove',
			tip: ''
		},
		equipmentgain: {
			name: 'Gain Equipment',
			value: 'equipmentgain',
			tip: ''
		},
		itemuse: { name: 'Use Item', value: 'itemuse', tip: '' },
		itemgain: { name: 'Gain Item', value: 'itemgain', tip: '' },
		moneygain: { name: 'Gain Money', value: 'moneygain', tip: '' },
		startup: { name: 'Startup', value: 'startup', tip: '' },
		createscene: { name: 'Create Scene', value: 'createscene', tip: '' },
		loadscene: { name: 'Load Scene', value: 'loadscene', tip: '' },
		loadsave: { name: 'Load Save', value: 'loadsave', tip: '' },
		showtext: { name: 'Show Text', value: 'showtext', tip: '' },
		showchoices: { name: 'Show Choices', value: 'showchoices', tip: '' },
		keydown: { name: 'Key Down', value: 'keydown', tip: '' },
		keyup: { name: 'Key Up', value: 'keyup', tip: '' },
		mousedown: { name: 'Mouse Down', value: 'mousedown', tip: '' },
		mousedownLB: { name: 'Mouse Down LB', value: 'mousedownLB', tip: '' },
		mousedownRB: { name: 'Mouse Down RB', value: 'mousedownRB', tip: '' },
		mouseup: { name: 'Mouse Up', value: 'mouseup', tip: '' },
		mouseupLB: { name: 'Mouse Up LB', value: 'mouseupLB', tip: '' },
		mouseupRB: { name: 'Mouse Up RB', value: 'mouseupRB', tip: '' },
		mousemove: { name: 'Mouse Move', value: 'mousemove', tip: '' },
		mouseenter: { name: 'Mouse Enter', value: 'mouseenter', tip: '' },
		mouseleave: { name: 'Mouse Leave', value: 'mouseleave', tip: '' },
		click: { name: 'Click', value: 'click', tip: '' },
		doubleclick: { name: 'Double Click', value: 'doubleclick', tip: '' },
		wheel: { name: 'Wheel', value: 'wheel', tip: '' },
		touchstart: { name: 'Touch Start', value: 'touchstart', tip: '' },
		touchmove: { name: 'Touch Move', value: 'touchmove', tip: '' },
		touchend: { name: 'Touch End', value: 'touchend', tip: '' },
		select: { name: 'Select Button', value: 'select', tip: '' },
		deselect: { name: 'Deselect Button', value: 'deselect', tip: '' },
		input: { name: 'Input', value: 'input', tip: '' },
		focus: { name: 'Focus', value: 'focus', tip: '' },
		blur: { name: 'Blur', value: 'blur', tip: '' },
		end: { name: 'Play Ended', value: 'ended', tip: '' },
		gamepadbuttonpress: {
			name: 'Gamepad Press',
			value: 'gamepadbuttonpress',
			tip: ''
		},
		gamepadbuttonrelease: {
			name: 'Gamepad Release',
			value: 'gamepadbuttonrelease',
			tip: ''
		},
		gamepadleftstickchange: {
			name: 'Left Stick Change',
			value: 'gamepadleftstickchange',
			tip: ''
		},
		gamepadrightstickchange: {
			name: 'Right Stick Change',
			value: 'gamepadrightstickchange',
			tip: ''
		},
		preload: { name: 'Preload', value: 'preload', tip: '' }
	};
	this.types = {
		// oxlint-disable-next-line no-explicit-any
		all: Object.values<any>(types),
		global: [
			types.common,
			types.autorun,
			types.keydown,
			types.keyup,
			types.mousedown,
			types.mouseup,
			types.mousemove,
			types.doubleclick,
			types.wheel,
			types.touchstart,
			types.touchmove,
			types.touchend,
			types.gamepadbuttonpress,
			types.gamepadbuttonrelease,
			types.gamepadleftstickchange,
			types.gamepadrightstickchange,
			types.equipmentgain,
			types.itemgain,
			types.moneygain,
			types.startup,
			types.createscene,
			types.loadscene,
			types.loadsave,
			types.showtext,
			types.showchoices,
			types.preload
		],
		scene: [types.create, types.autorun, types.destroy],
		actor: [
			types.create,
			types.autorun,
			types.collision,
			types.hittrigger,
			types.destroy,
			types.mousedownLB,
			types.mousedownRB,
			types.mousedown,
			types.mouseupLB,
			types.mouseupRB,
			types.mouseup,
			types.mousemove,
			types.mouseenter,
			types.mouseleave,
			types.click,
			types.doubleclick
		],
		skill: [types.skillcast, types.skilladd, types.skillremove],
		state: [types.stateadd, types.stateremove, types.autorun],
		equipment: [types.create, types.equipmentadd, types.equipmentremove],
		trigger: [types.autorun, types.hitactor, types.destroy],
		item: [types.itemuse],
		region: [
			types.autorun,
			types.playerenter,
			types.playerleave,
			types.actorenter,
			types.actorleave,
			types.destroy
		],
		light: [types.autorun, types.destroy],
		animation: [types.autorun, types.destroy],
		particle: [types.autorun, types.destroy],
		parallax: [types.autorun, types.destroy],
		tilemap: [types.autorun, types.destroy],
		element: [
			types.create,
			types.autorun,
			types.mousedownLB,
			types.mousedownRB,
			types.mousedown,
			types.mouseupLB,
			types.mouseupRB,
			types.mouseup,
			types.mousemove,
			types.mouseenter,
			types.mouseleave,
			types.click,
			types.doubleclick,
			types.wheel,
			types.touchstart,
			types.touchmove,
			types.touchend,
			types.keydown,
			types.keyup,
			types.select,
			types.deselect,
			types.focus,
			types.blur,
			types.input,
			types.end,
			types.destroy,
			types.gamepadbuttonpress,
			types.gamepadbuttonrelease,
			types.gamepadleftstickchange,
			types.gamepadrightstickchange
		],
		register_global: [
			types.autorun,
			types.keydown,
			types.keyup,
			types.mousedown,
			types.mouseup,
			types.mousemove,
			types.doubleclick,
			types.wheel,
			types.touchstart,
			types.touchmove,
			types.touchend,
			types.gamepadbuttonpress,
			types.gamepadbuttonrelease,
			types.gamepadleftstickchange,
			types.gamepadrightstickchange,
			types.equipmentgain,
			types.itemgain,
			types.moneygain,
			types.createscene,
			types.loadscene,
			types.loadsave,
			types.showtext,
			types.showchoices
		],
		register_actor: [
			types.autorun,
			types.collision,
			types.hittrigger,
			types.mousedownLB,
			types.mousedownRB,
			types.mousedown,
			types.mouseupLB,
			types.mouseupRB,
			types.mouseup,
			types.mousemove,
			types.mouseenter,
			types.mouseleave,
			types.click,
			types.doubleclick
		],
		register_element: [
			types.autorun,
			types.mousedownLB,
			types.mousedownRB,
			types.mousedown,
			types.mouseupLB,
			types.mouseupRB,
			types.mouseup,
			types.mousemove,
			types.mouseenter,
			types.mouseleave,
			types.click,
			types.doubleclick,
			types.wheel,
			types.touchstart,
			types.touchmove,
			types.touchend,
			types.keydown,
			types.keyup,
			types.select,
			types.deselect,
			types.focus,
			types.blur,
			types.end,
			types.destroy,
			types.gamepadbuttonpress,
			types.gamepadbuttonrelease,
			types.gamepadleftstickchange,
			types.gamepadrightstickchange
		],
		relatedElements: []
	};

	this.windowLocalize!(new Event('localize'));

	if (!this.commandList || !this.innerGutter) return;
	const INNER_HEIGHT = 600;
	Object.defineProperty(this.commandList, 'innerHeight', {
		configurable: true,
		value: INNER_HEIGHT
	});

	const PADDING_BOTTOM = INNER_HEIGHT - 20;
	this.commandList.style.paddingBottom = `${PADDING_BOTTOM + 10}px`;
	this.innerGutter.style.paddingBottom = `${PADDING_BOTTOM}px`;

	window.addEventListener('localize', this.windowLocalize!);
	const frame = eventEditorEls.get('event');
	if (frame) {
		on(frame, 'close', this.windowClose!);
		on(frame, 'closed', this.windowClosed!);
		on(frame, 'resize', this.windowResize!);
	}
	on(this.list, 'pointerdown', this.listPointerdown!, { capture: true });
	on(this.list, 'select', this.listSelect!);
	on(this.list, 'popup', this.listPopup!);
	const typeEl = eventEditorEls.get('event-type');
	if (typeEl) on(typeEl, 'input', this.typeInput!);
	const commandListEl = eventEditorEls.get('event-commands');
	if (commandListEl) on(commandListEl, 'change', this.commandListChange!);
	on(this.commandList, 'update', this.commandListUpdate!);
	on(this.commandList, 'scroll', this.commandListScroll!);
	// confirm 由 SFC 的 @confirm 驱动（`event-confirm` 按钮由 WindowFrame 生成，注册表取不到）
};
