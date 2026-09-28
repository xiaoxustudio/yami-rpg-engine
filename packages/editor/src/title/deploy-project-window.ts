import { titleEls } from '@app/title/element-registry';
import { Window } from '@app/tools/window-object.ts';

import { Timer } from '@app/utils/timer';
import { Codec } from '@app/engine/codec/codec.ts';
import { Data } from '@app/data/data-object.ts';
import { requestFocus } from '@app/directives/focus';
import { File } from '@app/file/file-system-core.ts';
import { FS, FSP } from '@app/services/file-system/fs-bridge.ts';
import { FolderItem } from '@app/services/file-system/file-item.ts';
import { Log } from '@app/log/log-window.ts';
import { Editor } from '@app/services/project/editor.ts';
import { TemplatesPath } from '@app/module/global.ts';
import { getYamiI18n } from '@app/i18n';

import { Path } from '@app/utils/config';
import uglifyJs from 'uglify-js';
import { reactive, ref } from 'vue';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
// ESM 下 __dirname 不存在，用 import.meta.url 推算：file: 协议剥两次得 dist/，http/https 兜底 cwd()/Project
import { fileURLToPath } from 'node:url';
import type { YamiElement } from '@app/types/element-api';
import { clone as deepClone } from '@app/utils/object';
const _moduleURL = new URL(import.meta.url);
const _modulePath =
	typeof fileURLToPath === 'function' && _moduleURL.protocol === 'file:'
		? fileURLToPath(_moduleURL)
		: typeof process !== 'undefined' &&
			  typeof process.cwd === 'function' &&
			  typeof Path.resolve === 'function'
			? Path.resolve!(process.cwd(), 'Project', _moduleURL.pathname.split('/').pop() ?? '')
			: '';
const __dirname = _modulePath ? Path.dirname!(Path.dirname!(_modulePath)) : '';

type DeploymentState = 'passed' | 'open' | 'closed' | 'unnamed' | 'existing';

type DeploymentPlatform = 'windows-x64' | 'mac-universal' | 'web';

interface DeploymentForm {
	platform: string;
	folder: string;
	location: string;
}

export const DeploymentForm = reactive<DeploymentForm>({
	platform: 'windows-x64',
	folder: '',
	location: ''
});

// 确认按钮的启用态。原先由 `check()` 对 `#deployment-confirm` 调 disable/enable，
// 而该按钮由 WindowFrame → YMFormButtons 生成（不在元素注册表里）⇒ 属性化后经
// `WindowFrame` 的 `confirm-disabled` 透传到 `button[name="confirm"]` 的 `:disabled`。
export const deploymentConfirmDisabled = ref(false);

type DeploymentFileItem = {
	folder?: boolean;
	shell?: boolean;
	srcPath?: string;
	newPath?: string;
	path?: string;
	data?: unknown;
	encrypt?: boolean;
	parameters?: unknown;
};

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
// oxlint-disable-next-line no-explicit-any
type DeploymentMethod = ((...args: any[]) => any) | null;

/** `manifest` 里**按 guid 分组**的键（值是 `Record<string, unknown>`） */
type DeploymentGroupKey =
	| 'ui'
	| 'scenes'
	| 'actors'
	| 'triggers'
	| 'states'
	| 'events'
	| 'tilesets'
	| 'animations'
	| 'particles'
	| 'skills'
	| 'items'
	| 'equipments';
/** `manifest` 里**以数组**保存文件元数据的键 */
type DeploymentListKey = 'images' | 'audio' | 'videos' | 'fonts' | 'others';

interface DeploymentManifest {
	ui: Record<string, unknown>;
	scenes: Record<string, unknown>;
	actors: Record<string, unknown>;
	skills: Record<string, unknown>;
	items: Record<string, unknown>;
	equipments: Record<string, unknown>;
	triggers: Record<string, unknown>;
	states: Record<string, unknown>;
	events: Record<string, unknown>;
	tilesets: Record<string, unknown>;
	animations: Record<string, unknown>;
	particles: Record<string, unknown>;
	images: unknown[];
	audio: unknown[];
	videos: unknown[];
	fonts: unknown[];
	script: unknown[];
	others: unknown[];
}

interface DeploymentShape {
	state: DeploymentState;
	gamedir: string;
	timer: Timer | null;
	compress: boolean;
	form: DeploymentForm;
	initialize: (() => void) | null;
	open: DeploymentMethod;
	check: DeploymentMethod;
	readShellList: DeploymentMethod;
	readFileList: DeploymentMethod;
	readTsOutDir: DeploymentMethod;
	copyFilesTo: DeploymentMethod;
	compressJavaScript: DeploymentMethod;
	platformInput: DeploymentMethod;
	folderBeforeinput: DeploymentMethod;
	folderInput: DeploymentMethod;
	locationInput: DeploymentMethod;
	chooseClick: DeploymentMethod;
	confirm: DeploymentMethod;
}

export const Deployment: DeploymentShape = {
	state: 'passed',
	gamedir: '',
	timer: null,
	compress: false,
	form: DeploymentForm,
	initialize: null,
	open: null,
	check: null,
	readShellList: null,
	readFileList: null,
	readTsOutDir: null,
	copyFilesTo: null,
	compressJavaScript: null,
	platformInput: null,
	folderBeforeinput: null,
	folderInput: null,
	locationInput: null,
	chooseClick: null,
	confirm: null
};

Deployment.initialize = function (this: typeof Deployment) {
	const platform = titleEls.get('deployment-platform') as YamiElement;
	if (!platform) return;
	platform.loadItems([
		{ name: 'Windows x64', value: 'windows-x64' },
		{ name: 'MacOS Universal', value: 'mac-universal' },
		{ name: 'Web / Android / iOS', value: 'web' }
	]);

	// platform/folder/location/choose/compress/confirm 事件经 Vue 模板转发（Deployment.vue @input/@beforeinput/@click/@change/@confirm → Deployment.*）
};

Deployment.open = function (this: typeof Deployment) {
	Window.open!('deployment');
	const dialogs = Editor.config!.dialogs!;
	const location = Path.normalize!(dialogs.deploy!);
	Object.assign(DeploymentForm, {
		platform: 'windows-x64',
		folder: 'Output',
		location: location
	});
	requestFocus('deployment-platform');
	this.check!();
};

Deployment.check = function (this: typeof Deployment) {
	let folder = DeploymentForm.folder;
	const location = DeploymentForm.location;
	const platform = DeploymentForm.platform;
	if (platform == 'mac-universal') {
		folder += '.app';
	}
	if (!folder) {
		if (this.state !== 'unnamed') {
			this.state = 'unnamed';
			(titleEls.get('deployment-warning') as YamiElement).textContent = t(
				'confirmation.enterFolderName'
			);
		}
		// 原先这三处是 disable/enable 的成对调用，且只在状态**变化**时执行；
		// 改成「赋一次标志」后无条件写更安全（状态机只在本函数里流转，结果等价）。
		deploymentConfirmDisabled.value = true;
	} else if (FS.existsSync!(Path.resolve!(location, folder))) {
		if (this.state !== 'existing') {
			this.state = 'existing';
			(titleEls.get('deployment-warning') as YamiElement).textContent = t(
				'confirmation.folderAlreadyExists'
			);
		}
		deploymentConfirmDisabled.value = true;
	} else {
		if (this.state !== 'passed') {
			this.state = 'passed';
			(titleEls.get('deployment-warning') as YamiElement).textContent = '';
		}
		deploymentConfirmDisabled.value = false;
	}
};

Deployment.readShellList = (function IIFE() {
	let root = '';
	const options = { withFileTypes: true } as const;
	const read = (path: string, list: DeploymentFileItem[]) => {
		return FSP.readdir(`${root}${path}`, options).then(
			async (files: Array<{ name: string; isDirectory(): boolean }>) => {
				if (path) {
					path += '/';
				}
				const promises: Promise<unknown>[] = [];
				for (const file of files) {
					const newPath = `${path}${file.name}`;
					const srcPath = `${root}${newPath}`;
					if (file.isDirectory()) {
						list.push({
							folder: true,
							shell: true,
							srcPath: srcPath,
							newPath: newPath
						});
						promises.push(read(newPath, list));
					} else {
						list.push({
							shell: true,
							srcPath: srcPath,
							newPath: newPath
						});
					}
				}
				if (promises.length !== 0) {
					await Promise.all(promises);
				}
				return list;
			}
		);
	};
	return function (rootDir: string) {
		root = Path.resolve!(__dirname, rootDir) + '/';
		return read('', []);
	};
})();

Deployment.readFileList = async function (this: typeof Deployment, platform: DeploymentPlatform) {
	const encrypt = true;
	const tsOutDir = Deployment.readTsOutDir!();
	if (!tsOutDir) {
		throw new Error('Unable to get "outDir" from "tsconfig.json".');
	}
	let fileList: DeploymentFileItem[] = [];
	switch (platform) {
		case 'windows-x64':
			fileList = await this.readShellList!(Path.resolve!(TemplatesPath, 'electron-win-x64'));
			this.gamedir = 'resources/app/';
			break;
		case 'mac-universal':
			fileList = await this.readShellList!(
				Path.resolve!(TemplatesPath, 'electron-mac-universal.app')
			);
			this.gamedir = 'Contents/Resources/app/';
			break;
		case 'web':
			fileList = [];
			this.gamedir = '';
			break;
	}
	fileList.push(
		{
			folder: true,
			path: 'Assets'
		},
		{
			folder: true,
			path: 'Module'
		},
		{
			folder: true,
			path: 'Icon'
		},
		{
			folder: true,
			path: 'Data'
		},
		{
			folder: true,
			path: `${tsOutDir}Script`
		}
	);
	const fileIdMap = Data.createReferencedFileIDMap!();
	const manifest: DeploymentManifest = {
		ui: {},
		scenes: {},
		actors: {},
		skills: {},
		items: {},
		equipments: {},
		triggers: {},
		states: {},
		events: {},
		tilesets: {},
		animations: {},
		particles: {},
		images: [],
		audio: [],
		videos: [],
		fonts: [],
		script: [],
		others: []
	};
	for (const key of [
		'ui',
		'scenes',
		'actors',
		'triggers',
		'states',
		'events',
		'tilesets',
		'animations',
		'particles'
	] as DeploymentGroupKey[]) {
		const sGroup = Data[key];
		const dGroup = manifest[key];
		for (const guid of Object.keys(sGroup)) {
			if (!fileIdMap[guid]) continue;
			dGroup[guid] = sGroup[guid];
		}
	}
	const guidAndExt = /\.[0-9a-f]{16}\.\S+$/;
	for (const key of ['skills', 'items', 'equipments'] as DeploymentGroupKey[]) {
		const dataGroup = Data[key];
		const manifestGroup = manifest[key];
		for (const { guid, path } of Data.manifest[key]) {
			if (!fileIdMap[guid]) continue;
			const data = dataGroup[guid];
			if (data !== undefined) {
				manifestGroup[guid] = {
					...data,
					filename: Path.basename!(path).replace(guidAndExt, '')
				};
			}
		}
	}
	const config = deepClone(Data.config);
	config.deployed = true;
	fileList.push(
		{
			data: manifest,
			path: 'Data/manifest.json'
		},
		{
			data: config,
			path: 'Data/config.json'
		},
		{
			data: Data.easings,
			path: 'Data/easings.json'
		},
		{
			data: Data.teams,
			path: 'Data/teams.json'
		},
		{
			data: Data.autotiles,
			path: 'Data/autotiles.json'
		},
		{
			data: Data.variables,
			path: 'Data/variables.json'
		},
		{
			data: Data.attribute,
			path: 'Data/attribute.json'
		},
		{
			data: Data.enumeration,
			path: 'Data/enumeration.json'
		},
		{
			data: Data.localization,
			path: 'Data/localization.json'
		},
		{
			data: Data.plugins,
			path: 'Data/plugins.json'
		},
		{
			data: Data.commands,
			path: 'Data/commands.json'
		}
	);
	fileList.push(
		{
			path: 'Module/axios.min.js'
		},
		{
			path: 'Module/exceljs.min.js'
		}
	);
	fileList.push(
		{ path: 'index.html' },
		{ path: 'Icon/icon.png', encrypt: false },
		{ path: `${tsOutDir}Script/util.js` },
		{ path: `${tsOutDir}Script/loader.js` },
		{ path: `${tsOutDir}Script/codec.js` },
		{ path: `${tsOutDir}Script/webgl.js` },
		{ path: `${tsOutDir}Script/audio.js` },
		{ path: `${tsOutDir}Script/printer.js` },
		{ path: `${tsOutDir}Script/variable.js` },
		{ path: `${tsOutDir}Script/animation.js` },
		{ path: `${tsOutDir}Script/data.js` },
		{ path: `${tsOutDir}Script/local.js` },
		{ path: `${tsOutDir}Script/stage.js` },
		{ path: `${tsOutDir}Script/camera.js` },
		{ path: `${tsOutDir}Script/scene.js` },
		{ path: `${tsOutDir}Script/actor.js` },
		{ path: `${tsOutDir}Script/trigger.js` },
		{ path: `${tsOutDir}Script/filter.js` },
		{ path: `${tsOutDir}Script/input.js` },
		{ path: `${tsOutDir}Script/ui.js` },
		{ path: `${tsOutDir}Script/time.js` },
		{ path: `${tsOutDir}Script/event.js` },
		{ path: `${tsOutDir}Script/command.js` },
		{ path: `${tsOutDir}Script/flow.js` },
		{ path: `${tsOutDir}Script/yami.js` },
		{ path: `${tsOutDir}Script/main.js` }
	);
	const tsExtname = /\.ts$/;
	for (let { guid, path, parameters } of Data.manifest.script) {
		if (!fileIdMap[guid]) continue;
		// 重新映射TS脚本到输出目录的JS脚本
		if (tsExtname.test(path)) {
			path = tsOutDir + path.replace(tsExtname, '.js');
		}
		const newPath = `Assets/${guid}.js`;
		manifest.script.push({
			path: newPath,
			parameters: parameters
		});
		fileList.push({
			srcPath: File.path!(path),
			newPath: newPath
		});
	}
	const fontNameRegexp = /([^/]+)\.\S+\.\S+$/;
	for (const key of ['images', 'audio', 'videos', 'fonts', 'others'] as DeploymentListKey[]) {
		const sMetaList = Data.manifest[key];
		const dMetaList = manifest[key];
		for (const { guid, path, size } of sMetaList) {
			if (!fileIdMap[guid]) continue;
			const extname =
				encrypt && key === 'images'
					? '.dat'
					: key === 'audio'
						? '.res'
						: Path.extname!(path);
			const newPath = `Assets/${guid}${extname}`;
			if (key === 'fonts') {
				dMetaList.push({
					path: newPath,
					name: path.match(fontNameRegexp)?.[1] ?? ''
				});
			} else {
				dMetaList.push({
					path: newPath,
					size: size
				});
			}
			fileList.push({
				srcPath: File.path!(path),
				newPath: newPath
			});
		}
	}
	return fileList;
};

Deployment.readTsOutDir = function (this: typeof Deployment) {
	const ts = FS.readFileSync!(File.path!('tsconfig.json'), 'utf8');
	const match = ts.match(/"outDir"\s*:\s*"(.*?)"/);
	let outDir;
	if (match) {
		outDir = Path.normalize!(match[1]);
	}
	if (!(outDir ?? '').endsWith('/')) {
		outDir += '/';
	}
	return outDir;
};

Deployment.copyFilesTo = function (this: typeof Deployment, dirPath: string) {
	Window.open!('copyProgress');
	const platform = DeploymentForm.platform;
	const progressBar = titleEls.get('copyProgress-bar') as YamiElement;
	const progressInfo = titleEls.get('copyProgress-info') as YamiElement;
	const { extnameToTypeMap } = FolderItem;
	progressBar.style.width = '0';
	progressInfo.textContent = '';
	return this.readFileList!(platform).then((list: DeploymentFileItem[]) => {
		let total = 0;
		let count = 0;
		let info = '';
		const dPath = `${dirPath}/`;
		const promises: Promise<unknown>[] = [];
		const length = list.length;
		for (let i = 0; i < length; i++) {
			const item = list[i];
			const srcPath: string = item.srcPath ?? File.path!(item.path);
			const newPath: string = item.newPath ?? item.path!;
			const gamedir = item.shell ? '' : this.gamedir;
			const dstPath = dPath + gamedir + newPath;
			switch (item.folder) {
				case true:
					FS.mkdirSync!(dstPath, { recursive: true });
					continue;
				default:
					if (item.data) {
						const json = JSON.stringify(item.data);
						promises.push(
							FSP.writeFile!(dstPath, json).then(() => {
								count++;
								info = newPath;
							})
						);
					} else {
						switch (
							(extnameToTypeMap as Record<string, string>)[
								Path.extname!(srcPath).toLowerCase()
							]
						) {
							case 'image':
								// 避免加密应用图标文件
								if (item.encrypt === false) {
									break;
								}
								promises.push(
									(async () => {
										const buffer = await FSP.readFile!(srcPath);
										await FSP.writeFile!(dstPath, Codec.encodeFile!(buffer));
										count++;
										info = newPath;
									})()
								);
								continue;
							case 'script':
								if (this.compress && !srcPath.includes!('.min.')) {
									promises.push(
										this.compressJavaScript!(srcPath, dstPath).then(() => {
											count++;
											info = newPath;
										})
									);
								} else {
									promises.push(
										FSP.copyFile!(srcPath, dstPath).then(() => {
											count++;
											info = newPath;
										})
									);
								}
								continue;
						}
						promises.push(
							FSP.copyFile!(srcPath, dstPath).then(() => {
								count++;
								info = newPath;
							})
						);
					}
					total++;
					continue;
			}
		}
		this.timer = new Timer({
			duration: Infinity,
			update: () => {
				const percent = Math.round((count / total) * 100);
				progressBar.style.width = `${percent}%`;
				progressInfo.textContent = info;
			}
		}).add();
		return Promise.all(promises);
	});
};

Deployment.compressJavaScript = function (
	this: typeof Deployment,
	srcPath: string,
	dstPath: string
) {
	let uglifyJS: typeof uglifyJs | null;
	try {
		uglifyJS = uglifyJs;
	} catch (_e) {
		uglifyJS = null;
	}

	return new Promise((resolve: (value: unknown) => void, reject: (reason?: unknown) => void) => {
		if (!uglifyJS) {
			// If uglify-js is not available, just copy the file
			FSP.copyFile!(srcPath, dstPath).then(resolve, reject);
			return;
		}
		FSP.readFile!(srcPath, 'utf8')
			.then((code: string) => {
				try {
					const result = uglifyJS!.minify(code, {
						mangle: {
							toplevel: false,
							eval: true,
							keep_fnames: false // 不保留函数名
						},
						compress: {
							sequences: true,
							properties: true, // 优化属性访问
							booleans: true, // 优化布尔表达式
							if_return: true, // 优化if/return
							join_vars: true
						},
						output: {
							beautify: false
						},
						sourceMap: false
					});
					if (result.error) {
						reject(result.error);
						throw result.error;
					}
					return resolve(FSP.writeFile!(dstPath, result.code));
				} catch {
					// If minification fails, fall back to copying the original file
					FSP.copyFile!(srcPath, dstPath).then(resolve, reject);
				}
			})
			.catch(reject);
	});
};

Deployment.platformInput = function (this: typeof Deployment, _event: Event) {
	Deployment.check!();
};

Deployment.folderBeforeinput = function (this: typeof Deployment, event: InputEvent) {
	if (event.inputType === 'insertText' && typeof event.data === 'string') {
		const regexp = /[\\/:*?"<>|"]/;
		if (regexp.test(event.data)) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
};

Deployment.folderInput = function (this: typeof Deployment, _event: Event) {
	const regexp = /[\\/:*?"<>|"]/g;
	const oldName = DeploymentForm.folder;
	const newName = oldName.replace(regexp, '');
	if (oldName !== newName) {
		DeploymentForm.folder = newName;
	}
	Deployment.check!();
};

Deployment.locationInput = function (this: typeof Deployment, _event: Event) {
	Deployment.check!();
};

Deployment.chooseClick = function (this: typeof Deployment, _event: Event) {
	File.showOpenDialog!({
		defaultPath: DeploymentForm.location,
		properties: ['openDirectory']
	}).then(({ filePaths }: { filePaths: string[] }) => {
		if (filePaths.length === 1) {
			DeploymentForm.location = filePaths[0];
			Deployment.check!();
		}
	});
};

Deployment.confirm = function (this: typeof Deployment, _event: Event) {
	const platform = DeploymentForm.platform;
	const location = DeploymentForm.location;
	const folder = DeploymentForm.folder;
	let path = Path.resolve!(location, folder);
	Window.close!('deployment');
	if (platform === 'mac-universal') {
		path += '.app';
	}
	return FSP.mkdir!(path, { recursive: true })
		.then(() => {
			return Deployment.copyFilesTo!(path);
		})
		.finally(() => {
			Window.close!('copyProgress');
			if (Deployment.timer) {
				Deployment.timer.remove();
				Deployment.timer = null;
			}
		})
		.then(() => {
			Editor.config!.dialogs!.deploy = Path.slash!(Path.resolve!(location));
		})
		.catch((error: Error) => {
			Log.throw!(error);
			Window.confirm!(
				{
					message: 'Failed to deploy project:\n' + error.message
				},
				[
					{
						label: 'Confirm'
					}
				]
			);
		});
};
