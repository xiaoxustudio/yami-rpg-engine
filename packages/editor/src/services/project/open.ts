import { SettingConfig } from '@app/services/project/setting-config';
import { Path } from '@app/utils/config';
import { loadCustomCommandList } from '@app/commands/command-custom.ts';
import { Data } from '@app/data/data-object.ts';
import { FS } from '@app/services/file-system/fs-bridge.ts';
import { getDirectoryTree } from '@app/services/file-system/directory-tree.ts';
import { getLazyWindow } from '@app/tools/window-registry';
import { GameLocal } from '@app/local/local-object.ts';
import { Editor } from './editor.ts';
import { WebServer } from '@app/services/ipc/webserver.ts';
import { getYamiI18n } from '@app/i18n';
import { activateWorkspace, editorDomainsReady } from '@app/bootstrap';
import { Window } from '@app/tools/window-object.ts';
import { showBootProgress } from '@app/main/boot-progress';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { Updater } from '@app/services/updater/updater.ts';
import { getLogStore } from '@app/stores/log';

const loadCluster = () => import('@app/tools/window-cluster');
const Animation = getLazyWindow('animation', () => loadCluster().then((m) => m.Animation));
const File = getLazyWindow('file', () => loadCluster().then((m) => m.File));
const Layout = getLazyWindow('layout', () => loadCluster().then((m) => m.Layout));
const Printer = getLazyWindow('printer', () => loadCluster().then((m) => m.Printer));
const Project = getLazyWindow('project', () => loadCluster().then((m) => m.Project));

async function open(this: typeof Editor, path: string, agreed = false) {
	path = Path.slash!(path ?? this.config!.project);

	if (!path) {
		Layout.manager.switch('home');
		return;
	}

	try {
		if (!FS.statSync!(path).isFile()) {
			throw new Error('Invalid project path');
		}
	} catch (_error: unknown) {
		Layout.manager.switch('home');
		return;
	}

	activateWorkspace();
	Window.open!('windowProgress');
	showBootProgress('正在加载核心组件…', 0, 100);
	await Promise.race([
		editorDomainsReady,
		new Promise<void>((resolve) => setTimeout(resolve, 30000))
	]);
	Window.close!('windowProgress');

	await this.close!();

	File.updateRoot!(path);
	this.config!.project = path;

	const get = (key: string) => t('confirmation.' + key);

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
		const loadDir = getDirectoryTree()?.read();
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
		getDirectoryTree()?.close();
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

		void Printer.loadDefault();
		void loadCustomCommandList().catch((error: unknown) => {
			getLogStore().logThrow(error);
		});
		Animation.Player.updateStep();
		this.loadProject!();
	} catch (error: unknown) {
		Editor.hooks.onError(error);
		const index = path.lastIndexOf('/') + 1;
		const message = path.slice(index);
		getDirectoryTree()?.close();
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

	if (Data.config.script.autoCompile) {
		Project.startTSC();
	}

	Editor.hooks.onTitleChanged();

	GameLocal.initialize();

	const serverConfig: { auto?: boolean } = SettingConfig.config?.server ?? {};
	if (serverConfig.auto) WebServer.start(path);
}

export function initProjectOpen(): void {
	Editor.open = open;
}
