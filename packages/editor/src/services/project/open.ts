import { SettingConfig } from '@/module/settingconfig';
import { Path } from '@/util/config.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Command } from '@/command/command-object.ts';
import { Data } from '@/data/data-object.ts';
import { Project } from '@/data/project-settings-window.ts';
import { Directory } from '@/file/directory-object.ts';
import { File } from '@/file/file-system-core.ts';
import { FS } from '@app/services/file-system/fs-bridge.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { GameLocal } from '@/local/local-object.ts';
import { Editor } from './editor.ts';
import { WebServer } from '@/module/webserver.ts';
import { Printer } from '@/printer/printer.ts';
import { Local } from '@/tools/localization.ts';

import { Updater } from '@app/services/updater/updater.ts';

Editor.open = async function (this: typeof Editor, path, agreed = false) {
	path = Path.slash!(path ?? this.config!.project);

	if (!path) {
		Layout.manager.switch('home');
		return;
	}

	try {
		if (!FS.statSync!(path).isFile()) {
			throw new Error('Invalid project path');
		}
	} catch (error: unknown) {
		Layout.manager.switch('home');
		return;
	}

	await this.close!();

	File.updateRoot!(path);

	const get = Local.createGetter!('confirmation');

	try {
		const json = FS.readFileSync!(path, 'utf8');
		this.project = JSON.parse(json);
		Object.defineProperty(this.project!, 'code', { value: json });
		const verNum = Updater.getVersionNumber!(this.project!.version!);
		if (!Editor.isProjectVersionSupported!()) {
			return Editor.hooks.onWindowConfirm(
				{
					message: get('versionIsTooHigh'),
					close: () => {
						Layout.manager.switch('home');
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
		if (verNum < Updater.getVersionNumber!('1.0.122')) {
			if (!agreed) {
				const warning = Updater.getTSVersionWarning!();
				return Editor.hooks.onWindowConfirm(
					{
						message: warning.message,
						close: () => {
							Layout.manager.switch('home');
						}
					},
					[
						{
							label: warning.confirm,
							click: () => {
								Editor.open!(path, true);
							}
						},
						{
							label: warning.cancel
						}
					]
				);
			} else {
				Updater.backupProject!();
			}
		}
	} catch (error: unknown) {
		Editor.hooks.onError(error);
		return Editor.hooks.onWindowConfirm(
			{
				message: (error as Error).message,
				close: () => {
					Layout.manager.switch('home');
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
		const ver = this.project!.version;
		const verNum = Updater.getVersionNumber!(ver!);
		await Updater.createLocalization!(verNum);
		const loadData = Data.loadAll!();
		const loadDir = Directory.read!();
		await loadData;
		await loadDir;
		Data.inheritMetaData!();
	} catch (error: unknown) {
		Editor.hooks.onError(error);
		const type =
			error instanceof URIError
				? 'Failed to read file'
				: error instanceof SyntaxError
					? 'Syntax error'
					: 'Error';
		Directory.close!();
		Data.close!();
		return Editor.hooks.onWindowConfirm(
			{
				message: `${type}: ${(error as Error).message}`,
				close: () => {
					Layout.manager.switch('home');
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
		this.updatePath!(path);

		await this.checkForProjectUpdates!();

		Printer.loadDefault();
		Command.custom.loadCommandList();
		Animation.Player.updateStep();
		this.loadProject!();
	} catch (error: unknown) {
		Editor.hooks.onError(error);
		const index = path.lastIndexOf('/') + 1;
		const message = path.slice(index);
		Directory.close!();
		Data.close!();
		Editor.hooks.onWindowConfirm(
			{
				message: `Failed to read file: ${message}`,
				close: () => {
					Layout.manager.switch('home');
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

	Layout.manager.switch('directory');

	this.switchHotkey!(true);

	// 启动TS编译
	if (Data.config.script.autoCompile) {
		Project.startTSC();
	}

	Editor.hooks.onTitleChanged();

	// 初始化游戏本地化语言 因为是追加的内容 必须置于检查更新之后
	GameLocal.initialize();

	// 打开开发服务器 SettingConfig.config 在 SettingConfig 实例化期 load() 从 yami-config.json 载入；但若 load() 抛错或文件缺失未兜底，config.server 可能是 undefined，裸取 .auto 会炸
	const serverConfig = SettingConfig.config?.server ?? {};
	if (serverConfig.auto) WebServer.start(path);
};
