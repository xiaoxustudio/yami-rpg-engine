import { macRedoKey } from '@/util/event-accessors';
import { Window } from '@/tools/window-object.ts';
import { ipcRenderer } from 'electron';
import { SettingConfig } from '@/module/settingconfig';
import { $ } from '@/util/dom.ts';
import {
	addClass,
	disable,
	enable,
	hasClass,
	rect,
	removeClass,
	setTooltip,
	write
} from '@/util/element-utils';
import { Path } from '@/util/config.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { CustomCommand } from '@/command/custom-command-window.ts';
import { Menu } from '@/components/menu-list.ts';
import { Data } from '@/data/data-object.ts';
import { Project } from '@/data/project-settings-window.ts';
import { Team } from '@/data/team-window.ts';
import { Easing } from '@/data/transition-window.ts';
import { Enum } from '@/enum/enum-window.ts';
import { File } from '@/file/file-system-core.ts';
import { FS, FSP } from '@/file/file-system.ts';
import { Layout } from '@/layout/layout.ts';
import { ExportLanguage } from '@/local/export-language-window.ts';
import { ImportLanguage } from '@/local/import-language-window.ts';
import { Localization } from '@/local/local-window.ts';
import { UpdateLog } from '@/log/update-log-window.ts';
import { Editor } from '@/main/editor.ts';
import { ApkBuilder } from '@/module/apkbuilder.ts';
import { Resources } from '@/module/resource.ts';

import { WebServer } from '@/module/webserver.ts';
import { Palette } from '@/palette/palette.ts';
import { Particle } from '@/particle/particle-window.ts';
import { PluginManager } from '@/plugin/plugin.ts';
import { Scene } from '@/scene/scene-window.ts';
import { Title } from './title-bar.ts';
import { Color } from '@/tools/color-picker-window.ts';
import { Local } from '@/tools/localization.ts';
import { UndoManager } from '@/tools/undo-manager.ts';

import { Zoom } from '@/tools/zoom-window.ts';
import { UI } from '@/ui/ui-window.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { Variable } from '@/variable/variable.ts';

// ******************************** 菜单栏对象 ********************************

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type MenubarMethod = ((...args: any[]) => any) | null;

interface MenubarShape {
	state: string | null;
	popup: ((...args: unknown[]) => void) | null;

	// methods
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
	// events
	keydown: MenubarMethod;
	pointerdown: MenubarMethod;
	pointerup: MenubarMethod;
	pointerover: MenubarMethod;
	hrefClick: MenubarMethod;
}

export const Menubar: MenubarShape = {
	// methods,
	initialize: null as any,
	toggleFullScreen: null as any,
	popupFileMenu: null as any,
	popupEditMenu: null as any,
	popupViewMenu: null as any,
	popupWindowMenu: null as any,
	popupHelpMenu: null as any,
	popupOpenYamiMenu: null as any,
	createRecentItems: null as any,
	createLanguageItems: null as any,
	createColorIcon: null as any,
	revealSaveDirectory: null as any,
	sanitizeFolderName: null as any,
	// events,
	keydown: null as any,
	pointerdown: null as any,
	pointerup: null as any,
	pointerover: null as any,
	hrefClick: null as any,
	state: null as string | null,
	popup: null as ((...args: unknown[]) => void) | null
};

// 初始化
Menubar.initialize = function (this: any) {
	// 侦听事件
	window.addEventListener('keydown', this.keydown);
	// #menu pointerdown/pointerup/pointerover 经 Vue 模板转发（AppShell @pointerdown/@pointerup/@pointerover → Menubar.*）
	document
		.querySelectorAll('.href')
		.forEach((el) => el.addEventListener('click', this.hrefClick!));
};

// 开关全屏模式
Menubar.toggleFullScreen = function (this: any) {
	ipcRenderer.send('toggle-full-screen');
};

// 弹出文件菜单
Menubar.popupFileMenu = function (this: any, target: any) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const bounds = rect(target);
		const open = Editor.state === 'open';
		const get = Local.createGetter!('menuFile');
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
						File.openPath!(Path.dirname!((Editor.config as any).project));
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

// 弹出编辑菜单
Menubar.popupEditMenu = function (this: any, target: any) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const bounds = rect(target);
		const get = Local.createGetter!('menuEdit');
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
		// 提前触发检查器输入框的blur事件
		document.activeElement!.blur();
		switch (Layout.manager.index) {
			case 'scene':
				if (Scene.state === 'open') {
					const selected = Scene.target instanceof Object;
					const pastable = (Clipboard as any).has('yami.scene.object');
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
				if (UI.state === 'open') {
					const selected = UI.target instanceof Object;
					const pastable = (Clipboard as any).has('yami.ui.object');
					items.cut.enabled = selected;
					items.copy.enabled = selected;
					items.paste.enabled = pastable;
					items.delete.enabled = selected;
					items.cut.click = () => {
						UI.copy!();
						UI.delete!();
					};
					items.copy.click = () => {
						UI.copy!();
					};
					items.paste.click = () => {
						UI.paste!();
					};
					items.delete.click = () => {
						UI.delete!();
					};
				}
				break;
			case 'animation':
				if (Animation.state === 'open') {
					const selected = Animation.motion instanceof Object;
					const pastable = (Clipboard as any).has('yami.animation.object');
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
			[items.cut, items.copy, items.paste, items.delete, items.undo, items.redo] as any[]
		);
	}
};

// 弹出视图菜单
Menubar.popupViewMenu = function (this: any, target: any) {
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
		const get = Local.createGetter!('menuView');
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
							icon: this.createColorIcon!(UI.background.hex),
							click: () => {
								Color.open(UI.background);
							}
						},
						{
							label: get('ui.foreground'),
							icon: this.createColorIcon!(UI.foreground.hex),
							click: () => {
								Color.open(UI.foreground);
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
							label: `${get('layout.zoom')}: ${(Zoom.getFactor as any)()}`,
							click: () => {
								(Zoom.open as any)();
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

// 弹出窗口菜单
Menubar.popupWindowMenu = function (this: any, target: any) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const bounds = rect(target);
		const open = Editor.state === 'open';
		const get = Local.createGetter!('menuWindow');
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
						Variable.open();
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

// 弹出帮助菜单
Menubar.popupHelpMenu = function (this: any, target: any) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const bounds = rect(target);
		const get = Local.createGetter!('menuHelp');
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
							Local.language.slice(0, 2) === 'zh'
								? 'https://open-yami-community.github.io/open-yami-doc/'
								: 'https://open-yami-community.github.io/open-yami-doc/' // 锁死中文
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
						$('#editor-version').textContent = (Editor.config as any).version;
						$('#electron-version').textContent = process.versions.electron;
						$('#chrome-version').textContent = process.versions.chrome;
						$('#node-version').textContent = process.versions.node;
						$('#v8-version').textContent = process.versions.v8;
						$('#os-version').textContent = osversion;
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
// 弹出OpenYami菜单
Menubar.popupOpenYamiMenu = function (this: any, target: any) {
	if (!hasClass(target, 'selected')) {
		addClass(target, 'selected');
		const open = Editor.state === 'open';
		const bounds = rect(target);
		const get = Local.createGetter!('menuOpenYami');
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
						Resources.open();
					}
				},
				{
					label: get('qr'),
					enabled: open,
					click: () => {
						WebServer.open!();
					}
				},
				{
					label: get('export_apk'),
					enabled: open,
					click: async () => {
						Window.open!('export-apk');
						Window.open!('windowProgress');
						const progressInfo = $('#windowProgress-info');
						progressInfo.textContent = '加载中...';
						$('#export-apk').addEventListener(
							'closed',
							() => {
								ApkBuilder.reset!();
							},
							{ once: true }
						);
						// 解析本地构建APK配置
						const pConfig = Path.resolve!(
							Path.dirname!((Editor.config as any).project),
							'apk',
							'./config.json'
						);
						let config = {
							// 自定义选项
							packageName: 'com.xuran.newapp', // 新包名
							appName: 'New App Name', // 新应用名称
							iconPath: '~/Icon/icon.png', // 新图标路径
							versionName: '1.0.0', // 版本名称
							versionCode: 1 // 版本号（整数）
						};
						const apkConfigSave = () => {
							// 没有则创建父级文件夹
							if (!FS.existsSync!(Path.dirname!(pConfig))) {
								FS.mkdirSync!(Path.dirname!(pConfig));
							}
							FSP.writeFile!(pConfig, JSON.stringify(config), {});
						};
						const InputEvent = (e: any, name: any) => {
							(config as Record<string, any>)[name] = e.target.value;
							apkConfigSave();
						};
						await new Promise(async (resolve: any, reject: any) => {
							if (FS.existsSync!(pConfig)) {
								resolve(
									(config = JSON.parse((await FSP.readFile!(pConfig)).toString()))
								);
							} else {
								// 配置不存在
								if (!FS.existsSync!(Path.dirname!(pConfig))) {
									FS.mkdirSync!(Path.dirname!(pConfig));
								}
								resolve(FSP.writeFile!(pConfig, JSON.stringify(config)));
							}
						}).then(() => {
							// 初始化
							write($('#export-apk-apkName'), config.appName);
							$('#export-apk-apkName').addEventListener('input', (e: any) =>
								InputEvent(e, 'appName')
							);
							write($('#export-apk-apkIcon'), config.iconPath);
							$('#export-apk-apkIcon').addEventListener('input', (e: any) =>
								InputEvent(e, 'iconPath')
							);
							$('#export-apk-apkIcon').addEventListener('mouseenter', (e: any) =>
								setTooltip(
									$('#export-apk-apkIcon'),
									ApkBuilder.processPathOnly!(config.iconPath)
								)
							);
							write($('#export-apk-apkPackageName'), config.packageName);
							$('#export-apk-apkPackageName').addEventListener('input', (e: any) =>
								InputEvent(e, 'packageName')
							);
							write($('#export-apk-apkVersionName'), config.versionName);
							$('#export-apk-apkVersionName').addEventListener('input', (e: any) =>
								InputEvent(e, 'versionName')
							);
							write($('#export-apk-apkVersionCode'), config.versionCode);
							$('#export-apk-apkVersionCode').addEventListener('input', (e: any) =>
								InputEvent(e, 'versionCode')
							);

							$('#export-apk-button').addEventListener('click', (e: any) => {
								disable($('#export-apk-button'));
								apkConfigSave();
								SettingConfig.load(); // 更新配置
								ApkBuilder.build!({
									...config,
									...SettingConfig.config.apkbuild,
									...SettingConfig.config.signed
								});
							});
							// 加载状态
							if (ApkBuilder.isBuilding!()) {
								disable($('#export-apk-button'));
								ApkBuilder.logs.forEach((log: any) => {
									ApkBuilder.apkLog!(log);
								});
							} else {
								enable($('#export-apk-button'));
							}
							Window.close!('windowProgress');
						});
					}
				}
			]
		);
	}
};

// 创建最近的文件项目
Menubar.createRecentItems = function (this: any) {
	if (Editor.state === 'closed') {
		return [];
	}
	const { recentTabs } = Editor.project as any;
	const items: any[] = [] as any[];
	const get = Local.createGetter!('menuFile');
	items.push({
		label: get('openRecent.reopenClosedFile'),
		enabled: !!Title.getClosedTabMeta!(),
		accelerator: ctrl('Shift+T'),
		click: () => {
			Title.reopenClosedTab!();
		}
	});
	// 添加最近的标签选项
	if (recentTabs.length !== 0) {
		const click = function (this: any) {
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

// 创建语言项目
Menubar.createLanguageItems = function (this: any) {
	const get = Local.createGetter!('menuView.language');
	const autoChecked = (Editor.config as any).language === '';
	const autoLabel = get('auto');
	const items: any[] = [
		{
			label: autoLabel,
			checked: autoChecked,
			click: () => {
				if (!autoChecked) {
					Local.setLanguage!('');
				}
			}
		}
	];
	Local.readLanguageList!().then((languages: any) => {
		const active = Local.active;
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
						Local.setLanguage!(key);
					}
				}
			});
		}
		items.push({ type: 'separator' });
		items.push({
			label: get(Local.showInExplorer!()),
			click: () => {
				File.openPath!(Local.dirname);
			}
		});
	});
	return items;
};

// 创建颜色图标
Menubar.createColorIcon = function (this: any, color: any) {
	const icon = document.createElement('menu-icon');
	const r = parseInt(color.slice(0, 2), 16);
	const g = parseInt(color.slice(2, 4), 16);
	const b = parseInt(color.slice(4, 6), 16);
	const a = parseInt(color.slice(6, 8), 16) / 255;
	icon.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
	addClass(icon, 'color-icon');
	if (a === 0) {
		addClass(icon, 'transparent');
	}
	return icon;
};

// 显示存档目录
Menubar.revealSaveDirectory = async function (this: any) {
	let saveDir;
	const { location, subdir } = Data.config.save;
	if (location !== 'local') {
		const dirname = await ipcRenderer.invoke('get-dir-path', location);
		const folder = this.sanitizeFolderName!(subdir);
		saveDir = Path.resolve!(dirname, folder);
	} else {
		saveDir = File.path!('Save');
	}
	File.openPath!(saveDir);
};

// 规范化文件夹名称
Menubar.sanitizeFolderName = function (this: any, name: any) {
	// 移除Windows/macOS/Linux不允许的字符
	name = name.replace(/[/:*?"<>|]/g, '');
	// 去掉开头和结尾的空格
	name = name.replace(/^\s+|\s+$/g, '');
	// Windows不能以"."结尾
	name = name.replace(/\.$/, '');
	// 避免Windows设备名（不区分大小写）
	const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
	if (reservedNames.test(name)) {
		// 添加后缀以避免冲突
		name += '_safe';
	}
	// 避免空字符串
	return name || 'default_folder';
};

// 键盘按下事件
Menubar.keydown = function (this: any, event: any) {
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
				WebServer.update!((Editor.config as any).project);
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
					UI.undo!();
					Animation.undo!();
					Particle.undo!();
					break;
				}
			case 'KeyY':
				Scene.redo!();
				UI.redo!();
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
				const elements = Title.tabBar.childNodes;
				const index = parseInt(event.code.slice(-1)) - 1;
				if (index < elements.length) {
					Title.tabBar.select(elements[index].item);
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
				Variable.open();
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
			// case 'Pause':
			//   GL.WEBGL_lose_context.loseContext()
			//   break
		}
	}
};

// 指针按下事件
Menubar.pointerdown = function (this: any, event: any) {
	switch (event.button) {
		case 0:
		case -1: {
			const target = event.target;
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

// 指针弹起事件
Menubar.pointerup = function (this: any, event: any) {
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

// 指针进入事件
Menubar.pointerover = function (this: any, event: any) {
	const element = event.target;
	if (hasClass(element, 'item')) {
		const parent = element.parentNode;
		const selected = parent.querySelector('.selected');
		if (selected !== null && selected !== element) {
			Menubar.pointerdown!(event);
		}
	}
};

// 超链接 - 点击事件
Menubar.hrefClick = function (this: any, event: any) {
	File.openURL!(event.target?.getAttribute?.('href'));
};
