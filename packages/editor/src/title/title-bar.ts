import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { windowShellEls } from '@app/tools/window-object.ts';
import { titleEls } from '@app/title/element-registry';
import { uiEls } from '@app/engine/ui/element-registry';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import { Window } from '@app/tools/window-object.ts';
import { $ } from '@app/utils/dom';
import { addClass, hasClass, hide, on, removeClass, show } from '@app/utils/element-utils';
import { Path } from '@app/utils/config';
import { ctrl } from '@app/utils/event-accessors';
import { Scene } from '@app/scene/scene-window.ts';
import { getUIStore } from '@app/stores/ui';
import { Animation } from '@app/animation/animation-window.ts';
import { AudioManager } from '@app/audio/audio-manager.ts';
import { Menu } from '@app/components/menu-list.ts';
import { elementDataOf, treeRowCount, treeRowItemAt } from '@ui-kit';
import { Data } from '@app/data/data-object.ts';
import { Directory } from '@app/file/directory-object.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { File } from '@app/file/file-system-core.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Editor } from '@app/services/project/editor.ts';
import type { EditorConfigShape, EditorProjectShape } from '@app/stores/editor';
import { getTitleStore } from '@app/stores/title';
import { getWindowStore } from '@app/stores/window';
import { ApkBuilder } from '@app/module/apkbuilder.ts';
import { WebServer } from '@app/services/ipc/webserver.ts';
import { Particle } from '@app/particle/particle-window.ts';
import { DynamicShape } from '@app/types/shapes.ts';
import { getYamiI18n } from '@app/i18n';
import { Deployment } from './deploy-project-window.ts';
import { NewProject } from './new-project-window.ts';
import type { YamiElement } from '@app/types/element-api';
import type { YamiEvent, YamiMouseEvent } from '@app/types/editor-event';
import { remove } from '@app/utils/array';
import { registryElement } from '@app/utils/element-registry';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

// oxlint-disable-next-line no-explicit-any
type TitleMethod = ((...args: any[]) => any) | null;

interface TitleMeta {
	guid?: string;
	path?: string;
}

interface TitleTab {
	type: string;
	meta: TitleMeta;
	[k: string]: unknown;
}

export interface TitleTabItem extends TitleTab {
	icon?: string;
	name?: string;
	tab?: { text: HTMLElement };
	item?: TitleTabItem;
}

interface TitleTargetShape extends HTMLElement {
	element?: HTMLElement;
	active?: boolean;
}

interface TitleTargetData {
	active: boolean;
}
const targetData = (el: unknown): TitleTargetData => elementDataOf<TitleTargetData>(el);

interface TitleTabBarShape extends HTMLElement {
	data: TitleTabItem[];
	dirItem?: TitleTabItem;
	childNodes: NodeListOf<ChildNode & { item?: unknown }>;
	find(meta: TitleMeta): TitleTabItem | undefined;
	insert(item: TitleTabItem): void;
	select(item: unknown): void;
	update(): void;
	read(): TitleTabItem | null;
	close(item: TitleTabItem | null): void;
	closeByProperty(property: string, value: unknown): void;
	parseIcon(type: string): string | undefined;
	parseName(meta: TitleMeta): string;
	parseTabName(item: TitleTabItem): string;
	on(event: string, callback: TitleMethod): void;
}

interface TitleShape extends DynamicShape {
	target: TitleTargetShape;
	tabBar: TitleTabBarShape;
	initialize: (() => void) | null;
	newProject: TitleMethod;
	openProject: TitleMethod;
	closeProject: TitleMethod;
	deployment: TitleMethod;
	addRecentTab: TitleMethod;
	getClosedTabMeta: TitleMethod;
	openTab: TitleMethod;
	reopenClosedTab: TitleMethod;
	askWhetherToSave: TitleMethod;
	updateTitleName: TitleMethod;
	updateBodyClass: TitleMethod;
	updateAppRegion: TitleMethod;
	switchTheme: TitleMethod;
	dispatchThemechangeEvent: TitleMethod;
	playGame: TitleMethod;
	saveToConfig: TitleMethod;
	loadFromConfig: TitleMethod;
	saveToProject: TitleMethod;
	loadFromProject: TitleMethod;
	windowBeforeClose: TitleMethod;
	windowMaximize: TitleMethod;
	windowUnmaximize: TitleMethod;
	windowEnterFullScreen: TitleMethod;
	windowLeaveFullScreen: TitleMethod;
	windowDrop: TitleMethod;
	windowDirchange: TitleMethod;
	windowLocalize: TitleMethod;
	pointerenter: TitleMethod;
	pointermove: TitleMethod;
	tabBarPointerdown: TitleMethod;
	tabBarSelect: TitleMethod;
	tabBarClosed: TitleMethod;
	tabBarPopup: TitleMethod;
	playClick: TitleMethod;
	minimizeClick: TitleMethod;
	maximizeClick: TitleMethod;
	closeClick: TitleMethod;
}

export const Title = {
	initialize: null,
	newProject: null,
	openProject: null,
	closeProject: null,
	deployment: null,
	addRecentTab: null,
	getClosedTabMeta: null,
	openTab: null,
	reopenClosedTab: null,
	askWhetherToSave: null,
	updateTitleName: null,
	updateBodyClass: null,
	updateAppRegion: null,
	switchTheme: null,
	dispatchThemechangeEvent: null,
	playGame: null,
	saveToConfig: null,
	loadFromConfig: null,
	saveToProject: null,
	loadFromProject: null,
	windowBeforeClose: null,
	windowMaximize: null,
	windowUnmaximize: null,
	windowEnterFullScreen: null,
	windowLeaveFullScreen: null,
	windowDrop: null,
	windowDirchange: null,
	windowLocalize: null,
	pointerenter: null,
	pointermove: null,
	tabBarPointerdown: null,
	tabBarSelect: null,
	tabBarClosed: null,
	tabBarPopup: null,
	playClick: null,
	minimizeClick: null,
	maximizeClick: null,
	closeClick: null
} satisfies Partial<TitleShape> as TitleShape;

Title.initialize = function (this: TitleShape) {
	this.target = windowShellEls.get('title') as YamiElement;
	this.tabBar = registryElement<TitleTabBarShape>(titleEls, 'title-tabBar')!;
	if (this.tabBar) this.tabBar.data = [];
	void YamiIpc.invoke.updateMaxMinIcon().then((mode: string) => {
		switch (mode) {
			case 'maximize':
				this.windowMaximize!();
				break;
			case 'unmaximize':
				this.windowUnmaximize!();
				break;
			case 'enter-full-screen':
				this.windowEnterFullScreen!();
				break;
		}
	});

	this.target.element = titleEls.get('title-app-region') as HTMLElement;

	this.pointerenter!();

	this.tabBar.parseIcon = function (type: string) {
		switch (type) {
			case 'scene':
				return '\uf0ac';
			case 'ui':
				return '\uf2d2';
			case 'animation':
				return '\uf110';
			case 'particle':
				return '\uf2dc';
		}
	};

	this.tabBar.parseName = function (meta: TitleMeta) {
		return File.parseMetaName!(meta);
	};

	window.addEventListener('drop', this.windowDrop!);
	window.addEventListener('dirchange', this.windowDirchange!);
	window.addEventListener('localize', this.windowLocalize!);
	on(this.tabBar, 'pointerdown', this.tabBarPointerdown!);

	YamiIpc.events.on(CHANNELS.send.beforeCloseWindow, this.windowBeforeClose!);
	YamiIpc.events.on(CHANNELS.send.maximize, this.windowMaximize!);
	YamiIpc.events.on(CHANNELS.send.unmaximize, this.windowUnmaximize!);
	YamiIpc.events.on(CHANNELS.send.enterFullScreen, this.windowEnterFullScreen!);
	YamiIpc.events.on(CHANNELS.send.leaveFullScreen, this.windowLeaveFullScreen!);
	NewProject.initialize!();
	Deployment.initialize!();
};

Title.newProject = function (this: TitleShape) {
	this.askWhetherToSave!(() => {
		NewProject.open!();
	});
};

Title.openProject = function (this: TitleShape) {
	this.askWhetherToSave!(() => {
		const dialogs = Editor.config!.dialogs!;
		const location = Path.normalize!(dialogs.open!);
		File.showOpenDialog!({
			defaultPath: location,
			filters: [
				{
					name: 'Project',
					extensions: ['yamirpg']
				}
			]
		}).then(({ filePaths }: { filePaths: string[] }) => {
			if (filePaths.length === 1) {
				Editor.open!(filePaths[0]);
			}
		});
	});
};

Title.closeProject = function (this: TitleShape) {
	this.askWhetherToSave!(() => {
		Editor.close!();
		WebServer.stop!();
		ApkBuilder.stopBuild!();
		ApkBuilder.clearLog!();
		Layout.manager.switch('home');
	});
};

Title.deployment = function (this: TitleShape) {
	this.askWhetherToSave!(() => {
		Deployment.open!();
	});
};

Title.addRecentTab = function (this: TitleShape, guid: string) {
	const tabs = Editor.project!.recentTabs!;
	if (remove(tabs, guid)) {
		tabs.unshift(guid);
	} else {
		tabs.unshift(guid);
		while (tabs.length > 10) {
			tabs.pop();
		}
	}
};

Title.getClosedTabMeta = function (this: TitleShape) {
	const recentTabs = Editor.project!.recentTabs!;
	outer: for (const guid of recentTabs) {
		for (const item of this.tabBar?.data ?? []) {
			if (item.meta.guid === guid) {
				continue outer;
			}
		}
		return Data.manifest.guidMap[guid];
	}
	return undefined;
};

Title.openTab = function (this: TitleShape, file: FileItem) {
	const tabBar = this.tabBar as TitleTabBarShape | null;
	if (!tabBar) return;
	const { meta: rawMeta, type } = file;
	const meta = rawMeta as TitleMeta;
	let context = tabBar.find(meta);
	if (context === undefined) {
		const icon = tabBar.parseIcon(type);
		const name = tabBar.parseName(meta);
		tabBar.insert((context = { icon, name, meta, type }));
	}
	tabBar.select(context!);
};

Title.reopenClosedTab = function (this: TitleShape, meta: TitleMeta) {
	meta = meta ?? this.getClosedTabMeta!();
	if (meta) {
		const file = Directory.getFile!(meta.path);
		if (file instanceof FileItem) {
			this.openTab!(file);
		}
	}
};

Title.askWhetherToSave = function (this: TitleShape, callback: () => void) {
	if (Data.manifest?.changes.length > 0) {
		const get = (key: string) => t('confirmation.' + key);
		Window.confirm!(
			{
				message: get('closeUnsavedProject')
			},
			[
				{
					label: get('yes'),
					click: () => {
						File.save!();
						callback();
					}
				},
				{
					label: get('no'),
					click: () => {
						callback();
					}
				},
				{
					label: get('cancel')
				}
			]
		);
	} else {
		callback();
	}
};

Title.updateTitleName = (function IIFE() {
	const title = $('title')[0];
	return function (this: TitleShape) {
		let text = 'Yami RPG Editor';
		if (Editor.state === 'open') {
			text = Data.config.window.title + ' - ' + text;
		}
		title.textContent = text;
	};
})();

Title.updateBodyClass = function (this: TitleShape) {
	const { maximized, fullscreen } = getTitleStore();
	if (maximized || fullscreen) {
		addClass(document.body, 'maximized');
		removeClass(document.body, 'border');
	} else {
		removeClass(document.body, 'maximized');
		addClass(document.body, 'border');
	}
};

Title.updateAppRegion = function (this: TitleShape) {
	const { target } = this;
	show(target.element);
	setTimeout(() => hide(target.element));
};

Title.switchTheme = function (this: TitleShape, scheme: 'light' | 'dark') {
	switch (scheme) {
		case 'light':
			if (removeClass(document.documentElement, 'dark')) {
				this.dispatchThemechangeEvent!('light');
			}
			break;
		case 'dark':
			if (addClass(document.documentElement, 'dark')) {
				this.dispatchThemechangeEvent!('dark');
			}
			break;
	}
};

Title.dispatchThemechangeEvent = (function IIFE() {
	const themechange = new Event('themechange') as YamiEvent;
	return function (this: TitleShape, theme: 'light' | 'dark') {
		getTitleStore().theme = theme;
		themechange.value = theme;
		window.dispatchEvent(themechange);
	};
})();

Title.playGame = async function (this: TitleShape) {
	const element = titleEls.get('title-play') as YamiElement;
	if (Editor.state === 'open' && !getTitleStore().playing) {
		getTitleStore().setPlaying(true);
		addClass(element, 'selected');

		const { activeElement } = document;
		(activeElement as HTMLElement | null)?.blur();
		(activeElement as HTMLElement | null)?.focus();

		AudioManager.player!.stop();

		await File.save!(false);

		YamiIpc.send.createPlayerWindow(File.root);

		YamiIpc.events.once(CHANNELS.send.playerWindowClosed, () => {
			removeClass(element, 'selected');
			getTitleStore().setPlaying(false);
		});
	}
};

Title.saveToConfig = function (this: TitleShape, config: EditorConfigShape) {
	config.theme = getTitleStore().theme ?? undefined;
};

Title.loadFromConfig = function (this: TitleShape, config: EditorConfigShape) {
	let { theme } = config;
	if (theme !== 'light' && theme !== 'dark') {
		theme = hasClass(document.documentElement, 'dark') ? 'dark' : 'light';
	}
	switch (theme) {
		case 'light':
			removeClass(document.documentElement, 'dark');
			break;
		case 'dark':
			addClass(document.documentElement, 'dark');
			break;
	}
	this.dispatchThemechangeEvent!(theme);
};

Title.saveToProject = function (this: TitleShape, project: EditorProjectShape) {
	const items = this.tabBar?.data;
	if (!items) return;
	const length = items.length;
	const tabs = Array.from<string>({ length: length });
	for (let i = 0; i < length; i++) {
		tabs[i] = items[i].meta.guid ?? '';
	}
	project.openTabs = tabs;

	const tab = this.tabBar.read();
	project.activeTab = tab?.meta.guid ?? '';
};

Title.loadFromProject = function (this: TitleShape, project: EditorProjectShape) {
	const openTabs = project.openTabs!;
	const { activeTab } = project;

	const dirItem = {
		icon: '\uf07c',
		name: t('common.directory'),
		meta: { guid: '' },
		type: 'directory'
	};
	const items: TitleTabItem[] = [dirItem];
	const tabBar = this.tabBar;
	if (!tabBar) return;
	tabBar.dirItem = dirItem;
	const map = Data.manifest.guidMap;
	for (const guid of openTabs) {
		const meta = map[guid];
		if (!meta) continue;
		let type;
		switch (Path.extname!(meta.path).toLowerCase()) {
			case '.scene':
				type = 'scene';
				break;
			case '.ui':
				type = 'ui';
				break;
			case '.anim':
				type = 'animation';
				break;
			case '.particle':
				type = 'particle';
				break;
			default:
				continue;
		}
		const icon = tabBar.parseIcon(type);
		const name = tabBar.parseName(meta);
		items.push({ icon, name, meta, type });
	}
	tabBar.data = items;
	tabBar.update();

	if (activeTab) {
		const count = treeRowCount(tabBar);
		for (let i = 0; i < count; i++) {
			const context = treeRowItemAt<TitleTabItem>(tabBar, i);
			if (context?.meta.guid === activeTab) {
				return tabBar.select(context);
			}
		}
		if (count !== 0) {
			const context = treeRowItemAt<TitleTabItem>(tabBar, 0);
			if (context) return tabBar.select(context);
		}
	}
	Layout.manager.switch('directory');
};

Title.windowBeforeClose = function (this: TitleShape, _event: YamiEvent) {
	if (getWindowStore().stack.length === 0) {
		YamiIpc.send.preventCloseWindow();
		Title.askWhetherToSave!(() => {
			Editor.quit!();
		});
	}
};

Title.windowMaximize = function (this: TitleShape, _event: YamiEvent) {
	getTitleStore().maximized = true;
	this.updateBodyClass!();
}.bind(Title);

Title.windowUnmaximize = function (this: TitleShape, _event: YamiEvent) {
	getTitleStore().maximized = false;
	this.updateBodyClass!();
}.bind(Title);

Title.windowEnterFullScreen = function (this: TitleShape, _event: YamiEvent) {
	getTitleStore().fullscreen = true;
	this.updateBodyClass!();
}.bind(Title);

Title.windowLeaveFullScreen = function (this: TitleShape, _event: YamiEvent) {
	getTitleStore().fullscreen = false;
	this.updateBodyClass!();
}.bind(Title);

Title.windowDrop = function (this: TitleShape, event: DragEvent) {
	if (getWindowStore().stack.length === 0) {
		const { files } = event.dataTransfer!;
		for (const file of files) {
			if (/\.yamirpg$/i.test(file.name)) {
				this.askWhetherToSave!(() => {
					Editor.open!((file as { path?: string }).path);
				});
			}
		}
	}
}.bind(Title);

Title.windowDirchange = function (this: TitleShape, _event: YamiEvent) {
	const { tabBar } = Title;
	if (!tabBar?.data) return;
	for (const item of tabBar.data) {
		if (item === tabBar.dirItem) continue;
		const name = tabBar.parseName(item.meta);
		if (item.name !== name) {
			item.name = name;
			if (item.tab) {
				item.tab.text.textContent = tabBar.parseTabName(item);
			}
		}
	}
};

Title.windowLocalize = function (this: TitleShape, _event: YamiEvent) {
	const text = Title.tabBar.dirItem?.tab?.text;
	if (text instanceof HTMLElement) {
		text.textContent = t('common.directory');
	}
};

Title.pointerenter = function (this: TitleShape, _event: YamiEvent) {
	const { target } = this;
	if (!target) return;
	const data = targetData(target);
	if (!data.active) {
		data.active = true;
		(target.style as CSSStyleDeclaration & { WebkitAppRegion: string }).WebkitAppRegion =
			'drag';
		this.updateAppRegion!();
		window.addEventListener('pointermove', this.pointermove!);
	}
}.bind(Title);

Title.pointermove = function (this: TitleShape, event: PointerEvent) {
	const { target } = this;
	if (!target) return;
	const data = targetData(target);
	if (data.active) {
		let element: Node | null = event.target as Node | null;
		while (element) {
			if (element === target) {
				return;
			} else {
				element = element.parentNode;
			}
		}
		if (!element) {
			data.active = false;
			(target.style as CSSStyleDeclaration & { WebkitAppRegion: string }).WebkitAppRegion =
				'no-drag';
			this.updateAppRegion!();
			window.removeEventListener('pointermove', this.pointermove!);
		}
	}
}.bind(Title);

Title.tabBarPointerdown = function (this: TitleShape, _event: YamiEvent) {
	switch (this.read!()?.type) {
		case 'scene':
			Layout.readyToFocus(Scene.screen);
			break;
		case 'ui':
			Layout.readyToFocus(uiEls.get('ui-screen') as never);
			break;
		case 'animation':
			Layout.readyToFocus(Animation.screen);
			break;
		case 'particle':
			Layout.readyToFocus(Particle.screen);
	}
};

Title.tabBarSelect = function (this: TitleShape, event: YamiEvent) {
	if (Layout.resizing) {
		Layout.pointerup();
	}
	const context = event.value;
	switch (context.type) {
		case 'directory':
			Layout.manager.switch('directory');
			break;
		case 'scene':
			Layout.manager.switch('scene');
			Scene.open!(context);
			Scene.screen.focus();
			break;
		case 'ui':
			Layout.manager.switch('ui');
			getUIStore().open(context);
			uiEls.get('ui-screen')?.focus();
			break;
		case 'animation':
			Layout.manager.switch('animation');
			Animation.open!(context);
			Animation.screen.focus();
			break;
		case 'particle':
			Layout.manager.switch('particle');
			Particle.open!(context);
			Particle.screen.focus();
			break;
	}
};

Title.tabBarClosed = function (this: TitleShape, event: YamiEvent & { closedItems: TitleTab[] }) {
	const { closedItems, lastValue } = event;
	for (const context of closedItems) {
		switch (context.type) {
			case 'scene':
				Scene.destroy!(context as never);
				break;
			case 'ui':
				getUIStore().destroy(context as never);
				break;
			case 'animation':
				Animation.destroy!(context);
				break;
			case 'particle':
				// oxlint-disable-next-line no-explicit-any
				Particle.destroy!(context as any);
				break;
		}
		if (context.meta.guid) {
			Title.addRecentTab!(context.meta.guid);
		}
	}
	if (closedItems.includes(lastValue)) {
		const items = this.data;
		const index = Math.min(this.selectionIndex, items.length - 1);
		const item = items[index];
		if (item instanceof Object) {
			this.select!(item);
		} else {
			Layout.manager.switch('directory');
		}
	}
};

Title.tabBarPopup = function (this: TitleShape, event: YamiMouseEvent) {
	const item = event.value;
	if (!item) return;
	const items = this.data;
	const last = items[items.length - 1];
	const get = (key: string) => t('menuTab.' + key);
	Menu.popup!(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('close'),
				accelerator: ctrl('W'),
				enabled: item.type !== 'directory',
				click: () => {
					this.close!(item);
				}
			},
			{
				label: get('closeOtherTabs'),
				enabled: items.length > 1,
				click: () => {
					this.closeOtherTabs!(item);
				}
			},
			{
				label: get('closeTabsToTheRight'),
				enabled: item !== last,
				click: () => {
					this.closeTabsToTheRight!(item);
				}
			}
		]
	);
};

Title.playClick = function (this: TitleShape, _event: YamiMouseEvent) {
	Title.playGame!();
};

Title.minimizeClick = function (this: TitleShape, _event: YamiMouseEvent) {
	YamiIpc.send.minimizeWindow();
};

Title.maximizeClick = function (this: TitleShape, _event: YamiMouseEvent) {
	YamiIpc.send.maximizeWindow();
};

Title.closeClick = function (this: TitleShape, _event: YamiMouseEvent) {
	Title.windowBeforeClose!();
};

const titleStateKeys = ['theme', 'maximized', 'fullscreen'] as const;

for (const key of titleStateKeys) {
	Object.defineProperty(Title, key, {
		get: () => getTitleStore()[key],
		set: (value: unknown) => {
			// oxlint-disable-next-line no-explicit-any
			(getTitleStore() as Record<(typeof titleStateKeys)[number], any>)[key] = value;
		},
		configurable: true
	});
}
