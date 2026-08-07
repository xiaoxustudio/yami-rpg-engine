import { $, getElementWriter } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { write } from '@/util/element-utils';
import { ctrl } from '@/util/event-accessors.ts';
import { Command } from './command-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Editor } from '@/main/editor.ts';
import { Data } from '@/data/data-object.ts';
import { Enum } from '@/enum/enum-window.ts';
import { TreeList } from '@/components/tree-list.ts';
import { Local } from '@/tools/localization.ts';
import { Menu } from '@/components/menu-list.ts';
import { Inspector } from '@/inspector/inspector.ts';
import {
	addClass,
	removeClass,
	on,
	show,
	hide,
	clear,
	read,
	getFocus
} from '@/util/element-utils.ts';

interface EventEditorList {
	unselect(): void;
	addNodeTo(item: any, parent: any): void;
	initialize(): void;
	expandToSelection(focus?: any): void;
	deleteNode(data: any): void;
	lastScrollTop: number;
	selectIndex: ((index: number) => void) | null;
	close: ((item?: any) => void) | null;
	closeMultiple: ((items: any[], callback?: () => void) => void) | null;
	closeBelow: ((item: any) => void) | null;
	closeOthers: ((item: any) => void) | null;
	closeAll: (() => void) | null;
	saveScroll: (() => void) | null;
	restoreScroll: (() => void) | null;
	defineProperties: ((item: any) => any) | null;
	createLocalEventItem:
		| ((inserting: any, filter: any, name: any, event: any, callback: any) => any)
		| null;
	createGlobalEventItem: ((guid: string) => any) | null;
	createIcon: ((item: any) => HTMLElement) | null;
	updateItemClass: ((item: any) => void) | null;
	createInitText: ((item: any) => void) | null;
	updateInitText: ((item: any) => void) | null;
	updateItemName: ((item: any) => void) | null;
	closeButtonClick: ((event: Event) => void) | null;
	removable: boolean;
	foldable: boolean;
	creators: any[];
	updaters: any[];
	bind(getter: () => any): void;
	on(type: string, listener: (event: any) => void, options?: any): void;
	off(type: string, listener: (event: any) => void, options?: any): void;
	resize(): void;
	update(): void;
	hide(): HTMLElement | void;
	show(): HTMLElement | void;
	hasClass(name: string): boolean;
	addClass(name: string): void;
	removeClass(name: string): void;
	getFocus(): void;
	read(): any;
	select(item: any): void;
	scrollToSelection(mode?: string): void;
	deleteNodeParameters(data: any): void;
	scrollToHome(): void;
	scrollToEnd(): void;
	style: CSSStyleDeclaration;
	textContent: string;
	parentNode: Node & { item?: any };
	contains(node: Node | null): boolean;
	item: any;
	class: string;
	filter: string;
	type: string;
	name: string;
	meta?: any;
	event?: any;
	callback?: any;
	inserting?: boolean;
	changed?: boolean;
	// 运行时挂载的列表项集合
	elements: any[] & { count: number };
	active: number | null;
	varList?: any[];
	commandList?: any;
}

type EventEditorMethod = ((...args: any[]) => any) | null;

interface EventEditorShape {
	state: string | null;
	target: Record<string, any> | null;
	planToSave: ((meta?: any) => void) | null;
	open: ((id: string) => void) | null;
	close: ((id?: string) => void) | null;

	list: HTMLElement & EventEditorList;
	commandList: HTMLElement & { [k: string]: any; innerHeight?: number };
	outerGutter: HTMLElement;
	innerGutter: HTMLElement;
	closing: boolean;
	data: any[] | null;
	caches: any[];
	types: any;
	initialize: (() => void) | null;
	openLocalEvent: EventEditorMethod;
	openGlobalEvent: EventEditorMethod;
	openRelatedEvents: EventEditorMethod;
	findRelatedEvents: EventEditorMethod;
	getAllLocalEvents: EventEditorMethod;
	clearAllEventClasses: EventEditorMethod;
	clearRelatedEventClasses: EventEditorMethod;
	save: EventEditorMethod;
	isChanged: EventEditorMethod;
	getItemById: EventEditorMethod;
	getItemByEvent: EventEditorMethod;
	openCommandList: EventEditorMethod;
	closeCommandList: EventEditorMethod;
	unpackOpenEvents: EventEditorMethod;
	packOpenEvents: EventEditorMethod;
	resizeGutter: EventEditorMethod;
	updateGutter: EventEditorMethod;
	appendCommandsToCaches: EventEditorMethod;
	fetchCommandBuffer: EventEditorMethod;
	clearCommandBuffers: EventEditorMethod;
	getGlobalEventName: EventEditorMethod;
	windowLocalize: EventEditorMethod;
	windowClose: EventEditorMethod;
	windowClosed: EventEditorMethod;
	windowResize: EventEditorMethod;
	windowKeydown: EventEditorMethod;
	windowKeyup: EventEditorMethod;
	windowPointermove: EventEditorMethod;
	listPointerdown: EventEditorMethod;
	listSelect: EventEditorMethod;
	listPopup: EventEditorMethod;
	typeInput: EventEditorMethod;
	commandListChange: EventEditorMethod;
	commandListUpdate: EventEditorMethod;
	commandListScroll: EventEditorMethod;
	confirm: EventEditorMethod;
	apply: EventEditorMethod;
}

export const EventEditor: EventEditorShape = {
	list: null as any,
	commandList: null as any,
	outerGutter: null as any,
	innerGutter: null as any,
	closing: false,
	data: null as any,
	caches: [],
	types: null as any,
	initialize: null as any,
	openLocalEvent: null as any,
	openGlobalEvent: null as any,
	openRelatedEvents: null as any,
	findRelatedEvents: null as any,
	getAllLocalEvents: null as any,
	clearAllEventClasses: null as any,
	clearRelatedEventClasses: null as any,
	save: null as any,
	isChanged: null as any,
	getItemById: null as any,
	getItemByEvent: null as any,
	openCommandList: null as any,
	closeCommandList: null as any,
	unpackOpenEvents: null as any,
	packOpenEvents: null as any,
	resizeGutter: null as any,
	updateGutter: null as any,
	appendCommandsToCaches: null as any,
	fetchCommandBuffer: null as any,
	clearCommandBuffers: null as any,
	getGlobalEventName: null as any,
	windowLocalize: null as any,
	windowClose: null as any,
	windowClosed: null as any,
	windowResize: null as any,
	windowKeydown: null as any,
	windowKeyup: null as any,
	windowPointermove: null as any,
	listPointerdown: null as any,
	listSelect: null as any,
	listPopup: null as any,
	typeInput: null as any,
	commandListChange: null as any,
	commandListUpdate: null as any,
	commandListScroll: null as any,
	confirm: null as any,
	apply: null as any,
	state: null as string | null,
	target: null as Record<string, any> | null,
	planToSave: null as ((meta: any) => void) | null,
	open: null as ((id: string) => void) | null,
	close: null as ((id?: string) => void) | null
};

function ensureDomBound() {
	if (EventEditor.list) return;
	const list = $('#event-open-list');
	if (!list) return;
	EventEditor.list = list as unknown as HTMLElement & EventEditorList;
	EventEditor.commandList = $('#event-commands');
	EventEditor.outerGutter = $('#event-commands-gutter-outer');
	EventEditor.innerGutter = $('#event-commands-gutter-inner');
	EventEditor.list.lastScrollTop = 0;
	EventEditor.list.selectIndex = null as unknown as (...args: unknown[]) => any;
	EventEditor.list.close = null;
	EventEditor.list.closeMultiple = null;
	EventEditor.list.closeBelow = null;
	EventEditor.list.closeOthers = null;
	EventEditor.list.closeAll = null;
	EventEditor.list.saveScroll = null as unknown as (...args: unknown[]) => any;
	EventEditor.list.restoreScroll = null as unknown as (...args: unknown[]) => any;
	EventEditor.list.defineProperties = null;
	EventEditor.list.createLocalEventItem = null;
	EventEditor.list.createGlobalEventItem = null;
	EventEditor.list.createIcon = null as unknown as (...args: unknown[]) => any;
	EventEditor.list.updateItemClass = null as unknown as (...args: unknown[]) => any;
	EventEditor.list.createIcon = null as unknown as (...args: unknown[]) => any;
	EventEditor.list.createInitText = null as unknown as (...args: unknown[]) => any;
	EventEditor.list.updateInitText = null as unknown as (...args: unknown[]) => any;
	EventEditor.list.updateItemName = null as unknown as (...args: unknown[]) => any;
	EventEditor.list.closeButtonClick = null;
	bindListMethods();
}

function bindListMethods() {
	const list = EventEditor.list!;
	list.selectIndex = function (index: number) {
		const elements = this.elements;
		const last = elements.count - 1;
		const element = elements[Math.min(index, last)];
		if (element instanceof HTMLElement) {
			this.select!(element.item);
		}
	};

	list.close = function (this: any, item?: any) {
		if (item === undefined) {
			item = read(this);
		}
		if (item) {
			const close = () => {
				const index = this.data!.indexOf(item);
				EventEditor.clearAllEventClasses!(item);
				this.deleteNode!(item);
				EventEditor.closeCommandList!();
				this.selectIndex!(index);
			};
			if (item.changed) {
				const get = Local.createGetter!('confirmation');
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

	list.closeMultiple = function (this: any, items: any[], callback?: () => void) {
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
				const get = Local.createGetter!('confirmation');
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

	list.closeBelow = function (this: any, item: any) {
		const index = this.data!.indexOf(item);
		this.closeMultiple!(this.data.slice(index + 1));
	};

	list.closeOthers = function (this: any, item: any) {
		const items = this.data.slice();
		items.splice(items.indexOf(item), 1);
		this.closeMultiple!(items);
	};

	list.closeAll = function (this: any) {
		const callback = () => EventEditor.closeCommandList!();
		this.closeMultiple!(this.data.slice(), callback);
	};

	list.saveScroll = function (this: any) {
		this.lastScrollTop = this.scrollTop;
	};

	list.restoreScroll = function (this: any) {
		this.scrollTop = this.lastScrollTop;
	};

	list.defineProperties = function (this: any, item: any) {
		return Object.defineProperties(item, {
			name: { writable: true, value: '' },
			class: { writable: true, value: '' },
			type: { writable: true, value: '' },
			commands: { writable: true, value: null as any },
			filter: { writable: true, value: '' },
			meta: { writable: true, value: null as any },
			event: { writable: true, value: null as any },
			callback: { writable: true, value: null as any },
			changed: { writable: true, value: false },
			inserting: { writable: true, value: false }
		});
	};

	list.createLocalEventItem = function (
		this: any,
		inserting: any,
		filter: any,
		name: any,
		event: any,
		callback: any
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

	list.createGlobalEventItem = function (this: any, guid: string) {
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

	list.updateItemClass = function (this: any, item: any) {
		const { element } = item;
		addClass(element, 'event-open-item');
		if (item.filter === 'global') {
			addClass(element, 'global-event');
		} else {
			addClass(element, 'local-event');
		}
	};

	list.createIcon = function (this: any) {
		const closeButton = document.createElement('div');
		closeButton.textContent = '×';
		addClass(closeButton, 'event-close-button');
		addClass(closeButton, 'text');
		on(closeButton, 'click', EventEditor.list.closeButtonClick!);
		return closeButton;
	};

	list.createInitText = function (this: any, item: any) {
		const { element } = item;
		const initText = document.createElement('div');
		addClass(initText, 'event-init-text');
		addClass(initText, 'text');
		element.appendChild(initText);
		element.initText = initText;
		element.attrValue = '';
	};

	list.updateInitText = function (this: any, item: any) {
		const { element } = item;
		if (element.initText !== undefined) {
			let typeName = '';
			if (item.type !== 'common') {
				typeName =
					' : ' +
					Command.removeTextTags!(
						Command.parseEventType!(item.filter + '-event', item.type)
					);
			}
			if (element.attrValue !== typeName) {
				element.attrValue = typeName;
				element.initText.textContent = typeName;
			}
		}
	};

	list.updateItemName = function (this: any, item: any) {
		TreeList.prototype.updateItemName.call(this, item);
		this.updateInitText!(item);
	};

	list.closeButtonClick = function (this: any, event: any) {
		EventEditor.list.close!((event.target as any).parentNode.item);
	};
}

EventEditor.initialize = function (this: any) {
	ensureDomBound();
	const { list } = this;
	if (!list || (this as any)._initialized) return;
	(this as any)._initialized = true;
	list.removable = true;
	list.foldable = false;
	list.bind!(() => this.data);
	list.updaters?.push(list.updateItemClass);
	list.creators?.push(list.createInitText);
	list.creators?.push(list.updateInitText);

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

	const INNER_HEIGHT = 600;
	Object.defineProperty(this.commandList, 'innerHeight', {
		configurable: true,
		value: INNER_HEIGHT
	});

	const PADDING_BOTTOM = INNER_HEIGHT - 20;
	this.commandList.style.paddingBottom = `${PADDING_BOTTOM + 10}px`;
	this.innerGutter.style.paddingBottom = `${PADDING_BOTTOM}px`;

	window.addEventListener('localize', this.windowLocalize!);
	on($('#event'), 'close', this.windowClose!);
	on($('#event'), 'closed', this.windowClosed!);
	on($('#event'), 'resize', this.windowResize!);
	on(this.list, 'pointerdown', this.listPointerdown!, { capture: true });
	on(this.list, 'select', this.listSelect!);
	on(this.list, 'popup', this.listPopup!);
	on($('#event-type'), 'input', this.typeInput!);
	on($('#event-commands'), 'change', this.commandListChange!);
	on(this.commandList, 'update', this.commandListUpdate!);
	on(this.commandList, 'scroll', this.commandListScroll!);
	on($('#event-confirm'), 'click', this.confirm!);
	on($('#event-apply'), 'click', this.apply!);
};

EventEditor.openLocalEvent = function (
	this: any,
	inserting: any,
	filter: any,
	name: any,
	event: any,
	callback: any
) {
	this.initialize!();
	this.unpackOpenEvents!();
	Window.open!('event');
	window.addEventListener('keydown', this.windowKeydown!);

	const list = this.list;
	const item = list.createLocalEventItem!(inserting, filter, name, event, callback);
	list.addNodeTo!(item, null);
	list.update!();
	list.select!(item);
	list.restoreScroll!();
	list.scrollToSelection!('middle');

	getFocus(list);
	return item;
};

EventEditor.openGlobalEvent = function (this: any, guid: any) {
	this.initialize!();
	if (!Window.isWindowOpen!('event')) {
		this.unpackOpenEvents!();
		Window.open!('event');
		window.addEventListener('keydown', this.windowKeydown!);
	} else if (read(this.list)?.id === guid) {
		return;
	}

	const list = this.list;
	const item = this.getItemById!(guid);
	if (item) {
		list.initialize!();
		list.select!(item);
		list.expandToSelection!(false);
		list.update!();
		list.restoreScroll!();
		// select 事件可能因选中状态相同不触发（重开场景），显式写入保证指令列表渲染
		this.openCommandList!(item);
	} else {
		const item = list.createGlobalEventItem!(guid);
		list.addNodeTo!(item, null);
		list.update!();
		list.select!(item);
		list.restoreScroll!();
		this.openCommandList!(item);
	}
	list.scrollToSelection!('middle');

	getFocus(list);
};

EventEditor.openRelatedEvents = function (this: any, contexts: any) {
	const list = this.list;
	const items = [] as any[];
	this.clearRelatedEventClasses!(...(this.data ?? []));
	for (const context of contexts) {
		let item;
		if (context.filter === 'global') {
			const { id } = context;
			item = this.getItemById!(id);
			if (!item) {
				item = list.createGlobalEventItem!(id);
				TreeList.createParents!([item], null);
				this.data!.push(item);
			}
		} else {
			const { filter, name, event } = context;
			item = this.getItemByEvent!(event);
			if (!item) {
				item = list.createLocalEventItem!(false, filter, name, event, null);
				TreeList.createParents!([item], null);
				this.data!.push(item);
			}
		}
		items.push(item);
	}
	if (items.length !== 0) {
		list.update!();
		let index = Infinity;
		for (const item of items) {
			addClass(item.element, 'related-event');
			index = Math.min(index, this.data!.indexOf(item));
		}
		list.unselect!();
		list.selectIndex!(index);
		list.scrollToSelection!('middle');
	}
};

EventEditor.findRelatedEvents = function (this: any, eventId: any) {
	const guidMap = Data.manifest.guidMap;
	const references = [] as any[];
	const find = (event: any) => {
		for (const command of event.commands) {
			switch (command.id) {
				case 'callEvent':
				case '!callEvent':
					if (command.params.type === 'global' && command.params.eventId === eventId) {
						return true;
					}
					break;
			}
		}
		return false;
	};
	for (const [id, event] of Object.entries<any>(Data.events)) {
		if (find(event)) {
			references.push({
				filter: 'global',
				id: id
			});
		}
	}
	for (const [id, actor] of Object.entries<any>(Data.actors)) {
		for (const event of actor.events) {
			if (find(event)) {
				references.push({
					filter: 'actor',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const [id, skill] of Object.entries<any>(Data.skills)) {
		for (const event of skill.events) {
			if (find(event)) {
				references.push({
					filter: 'skill',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const [id, trigger] of Object.entries<any>(Data.triggers)) {
		for (const event of trigger.events) {
			if (find(event)) {
				references.push({
					filter: 'trigger',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const [id, item] of Object.entries<any>(Data.items)) {
		for (const event of item.events) {
			if (find(event)) {
				references.push({
					filter: 'item',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const [id, equipment] of Object.entries<any>(Data.equipments)) {
		for (const event of equipment.events) {
			if (find(event)) {
				references.push({
					filter: 'equipment',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const [id, state] of Object.entries<any>(Data.states)) {
		for (const event of state.events) {
			if (find(event)) {
				references.push({
					filter: 'state',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const preset of Object.values<any>(Data.scenePresets)) {
		for (const event of preset.data.events) {
			if (find(event)) {
				const rootName = guidMap[preset.sceneId]?.file.basename;
				references.push({
					filter: preset.data.class,
					name: `${rootName}.${preset.data.name}`,
					event: event
				});
			}
		}
	}
	for (const preset of Object.values<any>(Data.uiPresets)) {
		for (const event of preset.data.events) {
			if (find(event)) {
				const rootName = guidMap[preset.uiId]?.file.basename;
				references.push({
					filter: 'element',
					name: `${rootName}.${preset.data.name}`,
					event: event
				});
			}
		}
	}
	this.openRelatedEvents!(references);
};

EventEditor.getAllLocalEvents = function (this: any) {
	const listMap = {} as Record<string, any>;
	for (const [id, actor] of Object.entries<any>(Data.actors)) {
		if (actor.events.length !== 0) {
			listMap[id] = actor.events;
		}
	}
	for (const [id, skill] of Object.entries<any>(Data.skills)) {
		if (skill.events.length !== 0) {
			listMap[id] = skill.events;
		}
	}
	for (const [id, trigger] of Object.entries<any>(Data.triggers)) {
		if (trigger.events.length !== 0) {
			listMap[id] = trigger.events;
		}
	}
	for (const [id, item] of Object.entries<any>(Data.items)) {
		if (item.events.length !== 0) {
			listMap[id] = item.events;
		}
	}
	for (const [id, equipment] of Object.entries<any>(Data.equipments)) {
		if (equipment.events.length !== 0) {
			listMap[id] = equipment.events;
		}
	}
	for (const [id, state] of Object.entries<any>(Data.states)) {
		if (state.events.length !== 0) {
			listMap[id] = state.events;
		}
	}
	for (const [id, scene] of Object.entries<any>(Data.scenes)) {
		if (scene.events.length !== 0) {
			listMap[id] = scene.events.slice();
		}
	}
	for (const { sceneId, data } of Object.values<any>(Data.scenePresets)) {
		if (data.events.length !== 0) {
			(listMap[sceneId] ??= []).push(...data.events);
		}
	}
	for (const { uiId, data } of Object.values<any>(Data.uiPresets)) {
		if (data.events.length !== 0) {
			(listMap[uiId] ??= []).push(...data.events);
		}
	}
	return listMap;
};

EventEditor.clearAllEventClasses = function (this: any, ...items: any) {
	for (const item of items) {
		removeClass(item.element, 'local-event');
		removeClass(item.element, 'global-event');
		removeClass(item.element, 'related-event');
	}
};

EventEditor.clearRelatedEventClasses = function (this: any, ...items: any) {
	for (const item of items) {
		removeClass(item.element, 'related-event');
	}
};

EventEditor.save = function (this: any, item: any) {
	const commands = item.commands;
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

EventEditor.isChanged = function (this: any) {
	for (const item of this.data!) {
		if (item.changed) {
			return true;
		}
	}
	return false;
};

EventEditor.getItemById = function (this: any, id: any) {
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

EventEditor.getItemByEvent = function (this: any, event: any) {
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

EventEditor.openCommandList = function (this: any, item: any) {
	this.fetchCommandBuffer!(item);
	show($('#event-commands-fieldset'));
	show($('#event-type'));

	const { commands, filter } = item;

	$('#event-type').loadItems(Enum.getMergedItems!(this.types[filter], filter + '-event'));

	$('#event-type').createTooltip();

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

EventEditor.closeCommandList = function (this: any) {
	clear(this.commandList);
	hide($('#event-commands-fieldset'));
	hide($('#event-type'));
};

EventEditor.unpackOpenEvents = function (this: any) {
	const copies = [] as any[];
	const events = (Editor.project as any).openEvents;
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
			copies.push(item);
		} else {
			copies.push(EventEditor.list.createGlobalEventItem!(item.id));
		}
	}
	this.data = copies;
};

EventEditor.packOpenEvents = function (this: any) {
	const copies = [] as any[];
	for (const item of this.data!) {
		if (item.class === 'global') {
			copies.push(item);
		}
	}
	(Editor.project as any).openEvents = copies;
};

EventEditor.resizeGutter = function (this: any) {
	const { outerGutter, innerGutter } = this;
	const height = outerGutter.clientHeight;
	if (height !== 0) {
		const length = Math.ceil(height / 20) + 1;
		const nodes = innerGutter.childNodes;
		let i = nodes.length;
		if (i !== length) {
			if (i < length) {
				while (i < length) {
					const node = document.createElement('div') as any;
					addClass(node, 'box');
					addClass(node, 'event-commands-line-number');
					node.number = -1;
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

EventEditor.updateGutter = function (this: any, force: any) {
	const { commandList } = this;
	const { scrollTop } = commandList;
	const { outerGutter, innerGutter } = EventEditor;
	const start = Math.floor(scrollTop / 20) + 1;
	const end = (commandList.elements as any).count + 1;
	if (innerGutter.start !== start || force) {
		innerGutter.start = start;
		const nodes = innerGutter.childNodes;
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			const node = nodes[i] as any;
			const number = start + i;
			if (number < end) {
				if (node.number !== number) {
					node.number = number;
					node.textContent = number.toString();
				}
			} else {
				if (node.number !== -1) {
					node.number = -1;
					node.textContent = '';
				} else {
					break;
				}
			}
		}
	}
	const tolerance = 0.0001;
	outerGutter.scrollTop = (scrollTop + tolerance) % 20;
};

EventEditor.appendCommandsToCaches = function (this: any, commands: any) {
	const { caches } = this;
	if (caches.push(commands) && caches.length > 50) {
		caches.shift();
	}
};

EventEditor.fetchCommandBuffer = function (this: any, item: any) {
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
	let commandsClone = this.caches.find((target: any) => {
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

EventEditor.clearCommandBuffers = function (this: any) {
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

EventEditor.getGlobalEventName = function (this: any, id: any) {
	return Data.manifest.guidMap[id]?.file.basename ?? '';
};

EventEditor.windowLocalize = function (this: any, event: any) {
	const types = EventEditor.types;
	const getType = Local.createGetter!('eventTypes');
	const getTip = Local.createGetter!('eventTips');
	for (const item of types.all) {
		const key = item.value;
		const name = getType(key);
		const tip = getTip(key);
		if (name !== '') {
			item.name = name;
		}
		if (tip !== '') {
			item.tip = Local.parseTip!(tip, name);
		}
	}
	for (const selectBox of types.relatedElements) {
		selectBox.createTooltip();
		if (read(selectBox)) {
			selectBox.update();
		}
	}
};

EventEditor.windowClose = function (this: any, event: any) {
	this.closing = true;
	if (this.isChanged!()) {
		event.preventDefault();
		const get = Local.createGetter!('confirmation');
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
								const commands = item.commands;
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

EventEditor.windowClosed = function (this: any, event: any) {
	this.clearAllEventClasses!(...(this.data ?? []));
	this.packOpenEvents!();
	this.data = null;
	clear(this.list);
	clear(this.commandList);
	this.clearCommandBuffers!();
	window.removeEventListener('keydown', this.windowKeydown!);
}.bind(EventEditor);

EventEditor.windowResize = function (this: any, event: any) {
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
	EventEditor.updateGutter!(true);
};

EventEditor.windowKeydown = function (this: any, event: any) {
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

EventEditor.windowKeyup = function (this: any, event: any) {
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

EventEditor.windowPointermove = function (this: any, event: any) {
	if (!event.altKey) {
		removeClass(EventEditor.list, 'alt');
		removeClass(EventEditor.commandList, 'alt');
		window.removeEventListener('keyup', EventEditor.windowKeyup!);
		window.removeEventListener('pointermove', EventEditor.windowPointermove!);
	}
};

EventEditor.listPointerdown = function (this: any, event: any) {
	if (event.altKey && event.button === 0) {
		const element = event.target;
		if (element.tagName === 'NODE-ITEM') {
			const item = element.item;
			if (item.id) {
				// 阻止focus后快捷键不被禁用的情况
				event.preventDefault();
				event.stopImmediatePropagation();
				EventEditor.findRelatedEvents!(item.id);
			}
		}
	}
};

EventEditor.listSelect = function (this: any, event: any) {
	const item = event.value;
	EventEditor.openCommandList!(item);
	if (item.element instanceof HTMLElement) {
		removeClass(item.element, 'related-event');
	}
};

EventEditor.listPopup = function (this: any, event: any) {
	const item = event.value;
	const selected = !!item;
	const get = Local.createGetter!('menuEventList');
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

EventEditor.typeInput = function (this: any, event: any) {
	const item = read(EventEditor.list);
	if (!item.changed) {
		item.changed = true;
		item.name += '*';
	}
	item.type = event.value;
	EventEditor.list.updateItemName!(item);
};

EventEditor.commandListChange = function (this: any, event: any) {
	if (EventEditor.closing) return;
	const item = read(EventEditor.list);
	if (!item.changed) {
		item.changed = true;
		item.name += '*';
		EventEditor.list.updateItemName!(item);
	}
};

EventEditor.commandListUpdate = function (this: any, event: any) {
	EventEditor.resizeGutter!();
	EventEditor.updateGutter!(true);
};

EventEditor.commandListScroll = function (this: any, event: any) {
	EventEditor.updateGutter!(false);
};

EventEditor.confirm = function (this: any, event: any) {
	this.apply!();
	Window.close!('event');
}.bind(EventEditor);

EventEditor.apply = function (this: any, event: any) {
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
