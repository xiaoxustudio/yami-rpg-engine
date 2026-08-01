import { SettingConfig } from '@/module/settingconfig';
import { Path } from '@/util/config.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Command } from '@/command/command-object.ts';
import { Data } from '@/data/data-object.ts';
import { Project } from '@/data/project-settings-window.ts';
import { Directory } from '@/file/directory-object.ts';
import { File } from '@/file/file-system-core.ts';
import { FS } from '@/file/file-system.ts';
import { Layout } from '@/layout/layout.ts';
import { GameLocal } from '@/local/local-object.ts';
import { Log } from '@/log/log-window.ts';
import { Editor } from './editor.ts';
import { WebServer } from '@/module/webserver.ts';
import { Printer } from '@/printer/printer.ts';
import { Title } from '@/title/title-bar.ts';
import { Local } from '@/tools/localization.ts';
function getWindow() {
	return (window as any).Window;
}
import { Updater } from '@/update/updater.ts';

Editor.open = async function (path, agreed = false) {
	path = Path.slash(path ?? this.config.project);

	if (!path) {
		(Layout.manager as any).switch('home');
		return;
	}

	try {
		if (!FS.statSync(path).isFile()) {
			throw new Error('Invalid project path');
		}
	} catch (error: any) {
		(Layout.manager as any).switch('home');
		return;
	}

	await this.close();

	(File.updateRoot as any)(path);

	const get = (Local.createGetter as any)('confirmation');

	try {
		const json = FS.readFileSync(path, 'utf8');
		this.project = JSON.parse(json);
		Object.defineProperty(this.project, 'code', { value: json });
		const verNum = (Updater.getVersionNumber as any)(this.project.version);
		if (!(Editor.isProjectVersionSupported as any)()) {
			return (getWindow().confirm as any)(
				{
					message: get('versionIsTooHigh'),
					close: () => {
						(Layout.manager as any).switch('home');
					}
				},
				[
					{
						label: get('confirm')
					}
				]
			);
		}
		// 升级到1.0.122：破坏性更新
		if (verNum < (Updater.getVersionNumber as any)('1.0.122')) {
			if (!agreed) {
				const warning = (Updater.getTSVersionWarning as any)();
				return (getWindow().confirm as any)(
					{
						message: warning.message,
						close: () => {
							(Layout.manager as any).switch('home');
						}
					},
					[
						{
							label: warning.confirm,
							click: () => {
								(Editor.open as any)(path, true);
							}
						},
						{
							label: warning.cancel
						}
					]
				);
			} else {
				(Updater.backupProject as any)();
			}
		}
	} catch (error: any) {
		(Log.throw as any)(error);
		return (getWindow().confirm as any)(
			{
				message: error.message,
				close: () => {
					(Layout.manager as any).switch('home');
				}
			},
			[
				{
					label: get('confirm')
				}
			]
		);
	}

	try {
		const ver = this.project.version;
		const verNum = (Updater.getVersionNumber as any)(ver);
		await (Updater.createLocalization as any)(verNum);
		const loadData = Data.loadAll();
		const loadDir = (Directory.read as any)();
		await loadData;
		await loadDir;
		Data.inheritMetaData();
	} catch (error: any) {
		(Log.throw as any)(error);
		const type =
			error instanceof URIError
				? 'Failed to read file'
				: error instanceof SyntaxError
					? 'Syntax error'
					: 'Error';
		(Directory.close as any)();
		Data.close();
		return (getWindow().confirm as any)(
			{
				message: `${type}: ${error.message}`,
				close: () => {
					(Layout.manager as any).switch('home');
				}
			},
			[
				{
					label: get('confirm')
				}
			]
		);
	}

	try {
		this.updatePath(path);

		await this.checkForProjectUpdates();

		Printer.loadDefault();
		Command.custom.loadCommandList();
		Animation.Player.updateStep();
		this.loadProject();
	} catch (error: any) {
		(Log.throw as any)(error);
		const index = path.lastIndexOf('/') + 1;
		const message = path.slice(index);
		(Directory.close as any)();
		Data.close();
		(getWindow().confirm as any)(
			{
				message: `Failed to read file: ${message}`,
				close: () => {
					(Layout.manager as any).switch('home');
				}
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
		return;
	}

	this.state = 'open';

	(Layout.manager as any).switch('directory');

	this.switchHotkey(true);

	// 启动TS编译
	if (Data.config.script.autoCompile) {
		(Project.startTSC as any)();
	}

	(Title.updateTitleName as any)();

	// 初始化游戏本地化语言 因为是追加的内容 必须置于检查更新之后
	(GameLocal.initialize as any)();

	// 打开开发服务器 SettingConfig.config 在 SettingConfig 实例化期 load() 从 yami-config.json 载入；但若 load() 抛错或文件缺失未兜底，config.server 可能是 undefined，裸取 .auto 会炸
	const serverConfig = SettingConfig.config?.server ?? {};
	if (serverConfig.auto) WebServer.start(path);
};
