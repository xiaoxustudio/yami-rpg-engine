import { macRedoKey } from '@app/utils/event-accessors';
import { createDetachedElement } from '@app/utils/dom';
import { titleEls } from '@app/title/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { registerWindowKeydown } from '@app/tools/window-keydown-registry';
import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { SettingConfig } from '@app/services/project/setting-config';
import type { MenuItem } from '@ui-kit';
import { treeRowCount, treeRowItemAt } from '@ui-kit';
import {
	addClass,
	disable,
	enable,
	hasClass,
	rect,
	removeClass,
	setTooltip
} from '@app/utils/element-utils';
import { h, reactive, render, watch } from 'vue';
import { Path } from '@app/utils/config';
import { Animation } from '@app/animation/animation-window.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { CustomCommand } from '@app/commands/custom-command-window.ts';
import { Menu } from '@app/components/menu-list.ts';
import { Data } from '@app/data/data-object.ts';
import { Project } from '@app/data/project-settings-window.ts';
import { Team } from '@app/data/team-window.ts';
import { Easing } from '@app/data/transition-window.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { FS, FSP } from '@app/services/file-system/fs-bridge.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { ExportLanguage } from '@app/local/export-language-window.ts';
import { ImportLanguage } from '@app/local/import-language-window.ts';
import { Localization } from '@app/local/local-window.ts';
import { UpdateLog } from '@app/log/update-log-window.ts';
import { Editor } from '@app/services/project/editor.ts';
import { ApkBuilder } from '@app/module/apkbuilder.ts';
import { Resources } from '@app/module/resource.ts';

import { WebServer } from '@app/services/ipc/webserver.ts';
import { Palette } from '@app/palette/palette.ts';
import { Particle } from '@app/particle/particle-window.ts';
import { PluginManager } from '@app/plugin/plugin.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { Title } from './title-bar.ts';
import type { TitleTabItem } from './title-bar.ts';
import { Color } from '@app/tools/color-picker-window.ts';
import { showInExplorerCommand } from '@app/utils/platform';
import { getYamiI18n, loadI18n } from '@app/i18n';
import { loadLanguageList, resolveLocalesDir } from '@app/i18n/loader';
import { getLocalStore } from '@app/stores/local';
import { UndoManager } from '@app/tools/undo-manager.ts';

import { Zoom } from '@app/composables/useZoomWindow';
import { getUIStore } from '@app/stores/ui';
import { ctrl } from '@app/utils/event-accessors';
import { Variable } from '@app/variable/variable.ts';
import { GlobalClipboard } from '@app/utils/clipboard';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

// oxlint-disable-next-line no-explicit-any
type MenubarMethod = ((...args: any[]) => any) | null;

interface MenubarShape {
	popup: ((...args: unknown[]) => void) | null;

	initialize: (() => void) | null;
	toggleFullScreen: MenubarMethod;
	popupFileMenu: MenubarMethod;
	popupEditMenu: MenubarMethod;
	popupViewMenu: MenubarMethod;
	popupWindowMenu: MenubarMethod;
	popupHelpMenu: MenubarMethod;
	popupOpenYamiMenu: MenubarMethod;
	createRecentItems: MenubarMethod;
	createLanguageItems: MenubarMethod;
	createColorIcon: MenubarMethod;
	revealSaveDirectory: MenubarMethod;
	sanitizeFolderName: MenubarMethod;
	keydown: MenubarMethod;
	pointerdown: MenubarMethod;
	pointerup: MenubarMethod;
	pointerover: MenubarMethod;
	hrefClick: MenubarMethod;
	state: string;
}

type RecentTabMeta = { guid?: string; path: string };

export interface ExportApkForm {
	apkName: string;
	apkIcon: string;
	apkPackageName: string;
	apkVersionName: string;
	apkVersionCode: string;
}

export const exportApkForm = reactive<ExportApkForm>({
	apkName: '',
	apkIcon: '',
	apkPackageName: '',
	apkVersionName: '',
	apkVersionCode: '1'
});

let stopExportApkFormWatch: (() => void) | null = null;

export const Menubar: MenubarShape = {
	initialize: null,
	state: 'closed',
	toggleFullScreen: null,
	popupFileMenu: null,
	popupEditMenu: null,
	popupViewMenu: null,
	popupWindowMenu: null,
	popupHelpMenu: null,
	popupOpenYamiMenu: null,
	createRecentItems: null,
	createLanguageItems: null,
	createColorIcon: null,
	revealSaveDirectory: null,
	sanitizeFolderName: null,
	keydown: null,
	pointerdown: null,
	pointerup: null,
	pointerover: null,
	hrefClick: null,
	popup: null as ((...args: unknown[]) => void) | null
};

Menubar.initialize = function (this: typeof Menubar) {
	window.addEventListener('keydown', this.keydown!);
};

Menubar.toggleFullScreen = function (this: typeof Menubar) {
	YamiIpc.send.toggleFullScreen();
};

Menubar.popupFileMenu = function (this: typeof Menubar, target: HTMLElement) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const bounds = rect(target);
		const open = Editor.state === 'open';
		const get = (key: string) => t('menuFile.' + key);
		Menu.popup!(
			{
				x: bounds.left,
				y: bounds.bottom,
				close: () => {
					removeClass(target, 'selected');
				}
			},
			[
				{
					label: get('newProject'),
					accelerator: ctrl('N'),
					click: () => {
						Title.newProject!();
					}
				},
				{
					label: get('openProject'),
					accelerator: ctrl('O'),
					click: () => {
						Title.openProject!();
					}
				},
				{
					label: get('revealProject'),
					enabled: open,
					click: () => {
						File.openPath!(Path.dirname!(Editor.config!.project!));
					}
				},
				{
					label: get('revealSaveDirectory'),
					enabled: open,
					click: () => {
						Menubar.revealSaveDirectory!();
					}
				},
				{
					label: get('openRecent'),
					enabled: open,
					submenu: this.createRecentItems!()
				},
				{
					label: get('exportLanguage'),
					enabled: open && Data.config.localization.languages.length !== 0,
					click: () => {
						ExportLanguage.open!();
					}
				},
				{
					label: get('importLanguage'),
					enabled: open && Data.config.localization.languages.length !== 0,
					click: () => {
						ImportLanguage.open!();
					}
				},
				{
					label: get('saveProject'),
					accelerator: ctrl('S'),
					enabled: open,
					click: () => {
						File.save!();
					}
				},
				{
					label: get('closeProject'),
					enabled: open,
					click: () => {
						Title.closeProject!();
					}
				},
				{
					label: get('deployment'),
					enabled: open,
					click: () => {
						Title.deployment!();
					}
				},
				{
					type: 'separator'
				},
				{
					label: get('exit'),
					click: () => {
						Title.closeClick!();
					}
				}
			]
		);
	}
};

Menubar.popupEditMenu = function (this: typeof Menubar, target: HTMLElement) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const bounds = rect(target);
		const get = (key: string) => t('menuEdit.' + key);
		const items = {
			cut: {
				label: get('cut'),
				accelerator: ctrl('X'),
				enabled: false,
				click: null as (() => void) | null
			},
			copy: {
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: false,
				click: null as (() => void) | null
			},
			paste: {
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: false,
				click: null as (() => void) | null
			},
			delete: {
				label: get('delete'),
				accelerator: 'Delete',
				enabled: false,
				click: null as (() => void) | null
			},
			undo: {
				label: get('undo'),
				accelerator: ctrl('Z'),
				enabled: false,
				click: null as (() => void) | null
			},
			redo: {
				label: get('redo'),
				accelerator: ctrl('Y'),
				enabled: false,
				click: null as (() => void) | null
			}
		};
		(document.activeElement as HTMLElement | null)?.blur();
		switch (Layout.manager.index) {
			case 'scene':
				if (Scene.state === 'open') {
					const selected = Scene.target instanceof Object;
					const pastable = GlobalClipboard.has('yami.scene.object');
					items.cut.enabled = selected;
					items.copy.enabled = selected;
					items.paste.enabled = pastable;
					items.delete.enabled = selected;
					items.cut.click = () => {
						Scene.copy!();
						Scene.delete!();
					};
					items.copy.click = () => {
						Scene.copy!();
					};
					items.paste.click = () => {
						Scene.paste!();
					};
					items.delete.click = () => {
						Scene.delete!();
					};
				}
				break;
			case 'ui':
				if (getUIStore().state === 'open') {
					const selected = getUIStore().target instanceof Object;
					const pastable = GlobalClipboard.has('yami.ui.object');
					items.cut.enabled = selected;
					items.copy.enabled = selected;
					items.paste.enabled = pastable;
					items.delete.enabled = selected;
					items.cut.click = () => {
						getUIStore().copy();
						getUIStore().delete();
					};
					items.copy.click = () => {
						getUIStore().copy();
					};
					items.paste.click = () => {
						getUIStore().paste();
					};
					items.delete.click = () => {
						getUIStore().delete();
					};
				}
				break;
			case 'animation':
				if (Animation.state === 'open') {
					const selected = Animation.motion instanceof Object;
					const pastable = GlobalClipboard.has('yami.animation.object');
					items.cut.enabled = selected;
					items.copy.enabled = selected;
					items.paste.enabled = pastable;
					items.delete.enabled = selected;
					items.cut.click = () => {
						Animation.copy!();
						Animation.delete!();
					};
					items.copy.click = () => {
						Animation.copy!();
					};
					items.paste.click = () => {
						Animation.paste!();
					};
					items.delete.click = () => {
						Animation.delete!();
					};
				}
				break;
			case 'particle':
				break;
		}
		items.undo.enabled = UndoManager.canUndo!();
		items.redo.enabled = UndoManager.canRedo!();
		items.undo.click = () => UndoManager.undo!();
		items.redo.click = () => UndoManager.redo!();
		Menu.popup!(
			{
				x: bounds.left,
				y: bounds.bottom,
				close: () => {
					removeClass(target, 'selected');
				}
			},
			[items.cut, items.copy, items.paste, items.delete, items.undo, items.redo] as MenuItem[]
		);
	}
};

Menubar.popupViewMenu = function (this: typeof Menubar, target: HTMLElement) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const bounds = rect(target);
		const open = Editor.state === 'open';
		const isFullScreen = Title.fullscreen;
		const isGridOpen = Scene.showGrid;
		const isLightOpen = Scene.showLight;
		const isAnimationOpen = Scene.showAnimation;
		const isDarkTheme = hasClass(document.documentElement, 'dark');
		const isLightTheme = !isDarkTheme;
		const get = (key: string) => t('menuView.' + key);
		Menu.popup!(
			{
				x: bounds.left,
				y: bounds.bottom,
				close: () => {
					removeClass(target, 'selected');
				}
			},
			[
				{
					label: get('fullscreen'),
					accelerator: process.platform === 'darwin' ? '' : 'F11',
					checked: isFullScreen,
					click: () => {
						Menubar.toggleFullScreen!();
					}
				},
				{
					label: get('scene'),
					enabled: open,
					submenu: [
						{
							label: get('scene.grid'),
							checked: isGridOpen,
							click: () => {
								Scene.switchGrid!();
							}
						},
						{
							label: get('scene.light'),
							checked: isLightOpen,
							click: () => {
								Scene.switchLight!();
							}
						},
						{
							label: get('scene.animation'),
							checked: isAnimationOpen,
							click: () => {
								Scene.switchAnimation!();
							}
						},
						{
							label: get('scene.background'),
							icon: this.createColorIcon!(Scene.background.hex),
							click: () => {
								Color.open(Scene.background);
							}
						}
					]
				},
				{
					label: get('ui'),
					enabled: open,
					submenu: [
						{
							label: get('ui.background'),
							icon: this.createColorIcon!(getUIStore().background!.hex),
							click: () => {
								Color.open(getUIStore().background!);
							}
						},
						{
							label: get('ui.foreground'),
							icon: this.createColorIcon!(getUIStore().foreground!.hex),
							click: () => {
								Color.open(getUIStore().foreground!);
							}
						}
					]
				},
				{
					label: get('animation'),
					enabled: open,
					submenu: [
						{
							label: get('animation.background'),
							icon: this.createColorIcon!(Animation.background.hex),
							click: () => {
								Color.open(Animation.background);
							}
						}
					]
				},
				{
					label: get('particle'),
					enabled: open,
					submenu: [
						{
							label: get('particle.background'),
							icon: this.createColorIcon!(Particle.background.hex),
							click: () => {
								Color.open(Particle.background);
							}
						}
					]
				},
				{
					label: get('layout'),
					enabled: open,
					submenu: [
						{
							label: get('layout.default'),
							click: () => {
								Layout.switchLayout(Layout.default);
							}
						},
						{
							label: `${get('layout.zoom')}: ${Zoom.getFactor()}`,
							click: () => {
								Zoom.open();
							}
						}
					]
				},
				{
					label: get('theme'),
					submenu: [
						{
							label: get('theme.light'),
							checked: isLightTheme,
							click: () => {
								Title.switchTheme!('light');
							}
						},
						{
							label: get('theme.dark'),
							checked: isDarkTheme,
							click: () => {
								Title.switchTheme!('dark');
							}
						}
					]
				},
				{
					label: get('language'),
					submenu: this.createLanguageItems!()
				}
			]
		);
	}
};

Menubar.popupWindowMenu = function (this: typeof Menubar, target: HTMLElement) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const bounds = rect(target);
		const open = Editor.state === 'open';
		const get = (key: string) => t('menuWindow.' + key);
		Menu.popup!(
			{
				x: bounds.left,
				y: bounds.bottom,
				close: () => {
					removeClass(target, 'selected');
				}
			},
			[
				{
					label: get('project'),
					accelerator: 'F1',
					enabled: open,
					click: () => {
						Project.open!();
					}
				},
				{
					label: get('variable'),
					accelerator: 'F3',
					enabled: open,
					click: () => {
						Variable.open!();
					}
				},
				{
					label: get('attribute'),
					accelerator: 'F6',
					enabled: open,
					click: () => {
						Attribute.open!();
					}
				},
				{
					label: get('enum'),
					accelerator: 'F7',
					enabled: open,
					click: () => {
						Enum.open!();
					}
				},
				{
					label: get('local'),
					accelerator: 'F8',
					enabled: open,
					click: () => {
						Localization.open();
					}
				},
				{
					label: get('easing'),
					enabled: open,
					click: () => {
						Easing.open!();
					}
				},
				{
					label: get('team'),
					enabled: open,
					click: () => {
						Team.open();
					}
				},
				{
					label: get('plugin'),
					accelerator: 'F9',
					enabled: open,
					click: () => {
						PluginManager.open!();
					}
				},
				{
					label: get('command'),
					accelerator: 'F10',
					enabled: open,
					click: () => {
						CustomCommand.open!();
					}
				},
				{
					label: get('run'),
					accelerator: 'F4',
					enabled: open,
					click: () => {
						Title.playGame!();
					}
				}
			]
		);
	}
};

Menubar.popupHelpMenu = function (this: typeof Menubar, target: HTMLElement) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const bounds = rect(target);
		const get = (key: string) => t('menuHelp.' + key);
		Menu.popup!(
			{
				x: bounds.left,
				y: bounds.bottom,
				close: () => {
					removeClass(target, 'selected');
				}
			},
			[
				{
					label: get('documentation'),
					click: () => {
						File.openURL!(
							getLocalStore().language.slice(0, 2) === 'zh'
								? 'https://open-yami-community.github.io/open-yami-doc/'
								: 'https://open-yami-community.github.io/open-yami-doc/'
						);
					}
				},
				{
					label: get('about'),
					click: () => {
						let osversion = '';
						const macos = navigator.userAgent.match(/Macintosh/);
						const winos = navigator.userAgent.match(/Windows NT [0-9.]+/);
						const bits = navigator.userAgent.match(/(?<!\w)x64|x86(?!\w)/);
						if (macos) osversion += 'Macintosh';
						if (winos) osversion += winos;
						if (winos && bits) osversion += ' ' + bits;
						if (!osversion) osversion = 'unknown';
						Window.open!('about');
						(titleEls.get('editor-version') as YamiElement).textContent =
							Editor.config!.version!;
						(titleEls.get('electron-version') as YamiElement).textContent =
							process.versions.electron;
						(titleEls.get('chrome-version') as YamiElement).textContent =
							process.versions.chrome;
						(titleEls.get('node-version') as YamiElement).textContent =
							process.versions.node;
						(titleEls.get('v8-version') as YamiElement).textContent =
							process.versions.v8;
						(titleEls.get('os-version') as YamiElement).textContent = osversion;
					}
				},
				{
					label: get('updateLog'),
					click: () => {
						UpdateLog.open!();
					}
				},
				{
					label: 'GitHub',
					submenu: [
						{
							label: 'Yami RPG Editor',
							click: () => {
								File.openURL!('https://github.com/yami-pro/yami-rpg-editor');
							}
						},
						{
							label: 'Open Yami Community',
							click: () => {
								File.openURL!('https://github.com/Open-Yami-Community');
							}
						}
					]
				}
			]
		);
	}
};
Menubar.popupOpenYamiMenu = function (this: typeof Menubar, target: HTMLElement) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const open = Editor.state === 'open';
		const bounds = rect(target);
		const get = (key: string) => t('menuOpenYami.' + key);
		Menu.popup!(
			{
				x: bounds.left,
				y: bounds.bottom,
				close: () => {
					removeClass(target, 'selected');
				}
			},
			[
				{
					label: get('setting'),
					click: () => {
						Window.open!('setting');
					}
				},
				{
					label: get('resource'),
					click: () => {
						void Resources.open();
					}
				},
				{
					label: get('qr'),
					enabled: open,
					click: () => {
						void WebServer.open!();
					}
				},
				{
					label: get('export_apk'),
					enabled: open,
					click: async () => {
						Window.open!('export-apk');
						Window.open!('windowProgress');
						const progressInfo = titleEls.get('windowProgress-info') as YamiElement;
						progressInfo.textContent = '加载中...';
						(titleEls.get('export-apk') as YamiElement)?.addEventListener?.(
							'closed',
							() => {
								if (stopExportApkFormWatch) {
									stopExportApkFormWatch();
									stopExportApkFormWatch = null;
								}
								ApkBuilder.reset!();
							},
							{ once: true }
						);
						const pConfig = Path.resolve!(
							Path.dirname!(Editor.config!.project!),
							'apk',
							'./config.json'
						);
						let config = {
							packageName: 'com.xuran.newapp',
							appName: 'New App Name',
							iconPath: '~/Icon/icon.png',
							versionName: '1.0.0',
							versionCode: 1
						};
						const apkConfigSave = () => {
							if (!FS.existsSync!(Path.dirname!(pConfig))) {
								FS.mkdirSync!(Path.dirname!(pConfig));
							}
							void FSP.writeFile(pConfig, JSON.stringify(config), true);
						};
						await (async () => {
							if (FS.existsSync!(pConfig)) {
								config = JSON.parse((await FSP.readFile!(pConfig)).toString());
							} else {
								if (!FS.existsSync!(Path.dirname!(pConfig))) {
									FS.mkdirSync!(Path.dirname!(pConfig));
								}
								await FSP.writeFile!(pConfig, JSON.stringify(config));
							}
						})().then(() => {
							Object.assign(exportApkForm, {
								apkName: config.appName,
								apkIcon: config.iconPath,
								apkPackageName: config.packageName,
								apkVersionName: config.versionName,
								apkVersionCode: String(config.versionCode)
							});
							if (stopExportApkFormWatch) {
								stopExportApkFormWatch();
							}
							stopExportApkFormWatch = watch(exportApkForm, () => {
								Object.assign(config, {
									appName: exportApkForm.apkName,
									iconPath: exportApkForm.apkIcon,
									packageName: exportApkForm.apkPackageName,
									versionName: exportApkForm.apkVersionName,
									versionCode: Number(exportApkForm.apkVersionCode)
								});
								apkConfigSave();
							});
							(titleEls.get('export-apk-apkIcon') as YamiElement)?.addEventListener?.(
								'mouseenter',
								(_e: Event) =>
									setTooltip(
										titleEls.get('export-apk-apkIcon') as YamiElement,
										ApkBuilder.processPathOnly!(config.iconPath)
									)
							);
							(titleEls.get('export-apk-button') as YamiElement)?.addEventListener?.(
								'click',
								(_e: Event) => {
									disable(titleEls.get('export-apk-button') as YamiElement);
									apkConfigSave();
									SettingConfig.load();
									ApkBuilder.build!({
										...config,
										...SettingConfig.config.apkbuild,
										...SettingConfig.config.signed
									});
								}
							);
							if (ApkBuilder.isBuilding!()) {
								disable(titleEls.get('export-apk-button') as YamiElement);
								ApkBuilder.logs.forEach((log) => {
									ApkBuilder.apkLog!(log);
								});
							} else {
								enable(titleEls.get('export-apk-button') as YamiElement);
							}
							Window.close!('windowProgress');
						});
					}
				}
			]
		);
	}
};

Menubar.createRecentItems = function (this: typeof Menubar) {
	if (Editor.state === 'closed') {
		return [];
	}
	const recentTabs = Editor.project!.recentTabs!;
	const items: (MenuItem & { meta?: RecentTabMeta })[] = [];
	const get = (key: string) => t('menuFile.' + key);
	items.push({
		label: get('openRecent.reopenClosedFile'),
		enabled: !!Title.getClosedTabMeta!(),
		accelerator: ctrl('Shift+T'),
		click: () => {
			Title.reopenClosedTab!();
		}
	});
	if (recentTabs.length !== 0) {
		const click = function (this: { meta: unknown }) {
			Title.reopenClosedTab!(this.meta);
		};
		items.push({ type: 'separator' });
		const map = Data.manifest.guidMap;
		for (const guid of recentTabs) {
			const meta = map[guid];
			if (meta !== undefined) {
				items.push({
					label: File.filterGUID!(meta.path),
					meta: meta,
					click: click
				});
			}
		}
	}
	items.push({ type: 'separator' });
	items.push({
		label: get('openRecent.clearItems'),
		enabled: recentTabs.length !== 0,
		click: () => {
			recentTabs.length = 0;
		}
	});
	return items;
};

Menubar.createLanguageItems = function (this: typeof Menubar) {
	const get = (key: string) => t('menuView.language.' + key);
	const autoChecked = Editor.config!.language === '';
	const autoLabel = get('auto');
	const items: MenuItem[] = [
		{
			label: autoLabel,
			checked: autoChecked,
			click: () => {
				if (!autoChecked) {
					void loadI18n('');
				}
			}
		}
	];
	void loadLanguageList().then(
		(languages: Array<{ key: string; alias: string; filename: string }>) => {
			const active = getLocalStore().active;
			if (languages.length !== 0) {
				items.push({ type: 'separator' });
			}
			for (const { key, alias, filename } of languages) {
				let checked = filename === active;
				if (checked && autoChecked) {
					checked = false;
					items[0].label = `${autoLabel} - ${alias}`;
				}
				items.push({
					label: alias,
					checked: checked,
					click: () => {
						if (!checked) {
							void loadI18n(key);
						}
					}
				});
			}
			items.push({ type: 'separator' });
			items.push({
				label: get(showInExplorerCommand),
				click: () => {
					File.openPath!(resolveLocalesDir());
				}
			});
		}
	);
	return items;
};

Menubar.createColorIcon = function (this: typeof Menubar, color: string) {
	const r = parseInt(color.slice(0, 2), 16);
	const g = parseInt(color.slice(2, 4), 16);
	const b = parseInt(color.slice(4, 6), 16);
	const a = parseInt(color.slice(6, 8), 16) / 255;
	const holder = createDetachedElement();
	render(
		h('menu-icon', {
			class: a === 0 ? 'color-icon transparent' : 'color-icon',
			style: { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` }
		}),
		holder
	);
	return holder.firstElementChild as HTMLElement;
};

Menubar.revealSaveDirectory = async function (this: typeof Menubar) {
	let saveDir;
	const { location, subdir } = Data.config.save;
	if (location !== 'local') {
		const dirname = await YamiIpc.invoke.getDirPath(location);
		if (!dirname) return;
		const folder = this.sanitizeFolderName!(subdir);
		saveDir = Path.resolve!(dirname, folder);
	} else {
		saveDir = File.path!('Save');
	}
	File.openPath!(saveDir);
};

Menubar.sanitizeFolderName = function (this: typeof Menubar, name: string) {
	name = name.replace(/[/:*?"<>|]/g, '');
	name = name.replace(/^\s+|\s+$/g, '');
	name = name.replace(/\.$/, '');
	const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
	if (reservedNames.test(name)) {
		name += '_safe';
	}
	return name || 'default_folder';
};

Menubar.keydown = function (this: typeof Menubar, event: KeyboardEvent) {
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyN':
				Title.newProject!();
				break;
			case 'KeyO':
				Title.openProject!();
				break;
			case 'KeyS':
				File.save!();
				void WebServer.update!(Editor.config!.project!);
				break;
			case 'KeyT':
				if (event.shiftKey) {
					Title.reopenClosedTab!();
				}
				break;
			case 'KeyW':
				Title.tabBar.close(Title.tabBar.read());
				break;
			case 'KeyZ':
				if (!macRedoKey(event)) {
					Scene.undo!();
					getUIStore().undo();
					Animation.undo!();
					Particle.undo!();
					break;
				}
			case 'KeyY':
				Scene.redo!();
				getUIStore().redo();
				Animation.redo!();
				Particle.redo!();
				break;
		}
	} else if (event.altKey) {
		switch (event.code) {
			case 'Digit1':
			case 'Digit2':
			case 'Digit3':
			case 'Digit4':
			case 'Digit5':
			case 'Digit6':
			case 'Digit7':
			case 'Digit8':
			case 'Digit9': {
				const count = treeRowCount(Title.tabBar);
				const index = parseInt(event.code.slice(-1)) - 1;
				if (index < count) {
					const item = treeRowItemAt<TitleTabItem>(Title.tabBar, index);
					if (item) Title.tabBar.select(item);
				}
				break;
			}
		}
	} else {
		switch (event.code) {
			case 'F1':
				Project.open!();
				break;
			case 'F3':
				Variable.open!();
				break;
			case 'F6':
				Attribute.open!();
				break;
			case 'F7':
				Enum.open!();
				break;
			case 'F8':
				Localization.open();
				break;
			case 'F9':
				PluginManager.open!();
				break;
			case 'F4':
				Title.playGame!();
				break;
			case 'F10':
				CustomCommand.open!();
				break;
			case 'KeyF':
				Palette.flipTiles!();
				break;
		}
	}
};

registerWindowKeydown('menubar', Menubar.keydown);

Menubar.pointerdown = function (this: typeof Menubar, event: PointerEvent) {
	switch (event.button) {
		case 0:
		case -1: {
			const target = event.target as HTMLElement;
			if (hasClass(target, 'item') && !hasClass(target, 'selected')) {
				switch (target?.getAttribute?.('value')) {
					case 'file':
						return Menubar.popupFileMenu!(target);
					case 'edit':
						return Menubar.popupEditMenu!(target);
					case 'view':
						return Menubar.popupViewMenu!(target);
					case 'window':
						return Menubar.popupWindowMenu!(target);
					case 'help':
						return Menubar.popupHelpMenu!(target);
					case 'openYami':
						return Menubar.popupOpenYamiMenu!(target);
				}
			}
			break;
		}
	}
};

Menubar.pointerup = function (this: typeof Menubar, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const target = event.target;
			if (hasClass(target, 'item') && hasClass(target, 'selected')) {
				event.stopPropagation();
			}
			break;
		}
	}
};

Menubar.pointerover = function (this: typeof Menubar, event: PointerEvent) {
	const element = event.target as HTMLElement;
	if (hasClass(element, 'item')) {
		const parent = element.parentNode as HTMLElement;
		const selected = parent.querySelector('.selected');
		if (selected !== null && selected !== element) {
			Menubar.pointerdown!(event);
		}
	}
};

Menubar.hrefClick = function (this: typeof Menubar, event: MouseEvent) {
	File.openURL!((event.target as HTMLElement | null)?.getAttribute?.('href'));
};

import { getMenubarStore } from '@app/stores/menubar';
import type { YamiElement } from '@app/types/element-api';

const menubarBridgeKeys = ['state'] as const;

for (const key of menubarBridgeKeys) {
	Object.defineProperty(Menubar, key, {
		get: () => getMenubarStore()[key],
		set: (value: unknown) => {
			Reflect.set(getMenubarStore(), key, value);
		},
		configurable: true
	});
}
