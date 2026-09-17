import { reactive, ref } from 'vue';
import { titleEls } from '@app/title/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { read } from '@app/utils/element-utils';
import { Timer } from '@app/utils/timer';
import { Data } from '@app/data/data-object.ts';
import { requestFocus } from '@app/directives/focus';
import { GUID } from '@app/services/file-system/guid.ts';
import { File } from '@app/file/file-system-core.ts';
import { FS, FSP } from '@app/services/file-system/fs-bridge.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Log } from '@app/log/log-window.ts';
import { Editor } from '@app/services/project/editor.ts';
import { TemplatesPath } from '@app/module/global.ts';
import { isNoResource } from '@app/module/constants';
import { getLocalStore } from '@app/stores/local';
import { Title } from '@app/title/title-bar.ts';
import { getYamiI18n } from '@app/i18n';

import { Path } from '@app/utils/config';
import type { YamiElement } from '@app/types/element-api';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

type NewProjectState = 'passed' | 'open' | 'closed' | 'unnamed' | 'existing';

export interface NewProjectForm {
	template: string;
	folder: string;
	location: string;
}

const form = reactive<NewProjectForm>({ template: '', folder: '', location: '' });

// P5b 尾项：确认按钮的启用态。原先由 `check()` 对 `#newProject-confirm` 调 disable/enable，
// 而该按钮由 WindowFrame → YMFormButtons 生成（不在元素注册表里）⇒ 属性化后经
// `WindowFrame` 的 `confirm-disabled` 透传到 `button[name="confirm"]` 的 `:disabled`。
export const newProjectConfirmDisabled = ref(false);

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type NewProjectMethod = ((...args: unknown[]) => unknown) | null;

interface NewProjectShape {
	state: NewProjectState;
	timer: Timer | null;
	form: NewProjectForm;
	initialize: (() => void) | null;
	open: NewProjectMethod;
	check: NewProjectMethod;
	readFileList:
		| ((
				dirname: string,
				idFilter: unknown
		  ) => Promise<Array<{ folder?: boolean; path: string }>>)
		| null;
	copyFilesTo: NewProjectMethod;
	writeData: NewProjectMethod;
	getNewFolder: NewProjectMethod;
	templateInput: NewProjectMethod;
	folderBeforeinput: NewProjectMethod;
	folderInput: NewProjectMethod;
	locationInput: NewProjectMethod;
	chooseClick: NewProjectMethod;
	confirm: NewProjectMethod;
}

export const NewProject: NewProjectShape = {
	state: 'passed',
	timer: null,
	form,
	initialize: null,
	open: null,
	check: null,
	readFileList: null,
	copyFilesTo: null,
	writeData: null,
	getNewFolder: null,
	templateInput: null,
	folderBeforeinput: null,
	folderInput: null,
	locationInput: null,
	chooseClick: null,
	confirm: null
};

NewProject.initialize = function (this: typeof NewProject) {
	const template = titleEls.get('newProject-template') as YamiElement;
	if (!template) return;
	template.loadItems([
		{ name: 'ARPG - English', value: 'arpg-ts-english' },
		{ name: 'ARPG - 简体中文', value: 'arpg-ts-chinese' },
		{ name: 'Minimized Current Project', value: 'minimized-project' }
	]);

	// template/folder/location/choose/confirm 事件经 Vue 模板转发（NewProject.vue @input/@beforeinput/@click/@confirm → NewProject.*）
};

NewProject.open = function (this: typeof NewProject) {
	Window.open!('newProject');
	const dialogs = Editor.config!.dialogs!;
	const location = Path.normalize!(dialogs.new!);
	const folder = this.getNewFolder!(location);
	let template;
	switch (getLocalStore().language) {
		default:
		case 'en-US':
			template = 'arpg-ts-english';
			break;
		case 'zh-CN':
			template = 'arpg-ts-chinese';
			break;
	}
	Object.assign(form, { template, folder, location });
	requestFocus('newProject-template');
	this.check!();
};

NewProject.check = function (this: typeof NewProject) {
	const folder = form.folder;
	const location = form.location;
	if (!folder) {
		if (this.state !== 'unnamed') {
			this.state = 'unnamed';
			(titleEls.get('newProject-warning') as YamiElement).textContent = t(
				'confirmation.enterFolderName'
			);
		}
		newProjectConfirmDisabled.value = true;
	} else if (FS.existsSync!(Path.resolve!(location, folder))) {
		if (this.state !== 'existing') {
			this.state = 'existing';
			(titleEls.get('newProject-warning') as YamiElement).textContent = t(
				'confirmation.folderAlreadyExists'
			);
		}
		newProjectConfirmDisabled.value = true;
	} else {
		if (this.state !== 'passed') {
			this.state = 'passed';
			(titleEls.get('newProject-warning') as YamiElement).textContent = '';
		}
		// 「最小化当前项目」模板要有可最小化的项目：编辑器已关闭（无项目可复制）时禁止确认。
		// 原实现的 `if (template === 'minimized-project' && Editor.state === 'closed') disable`，
		// 读法与上面两条同构：不满足则启用。
		newProjectConfirmDisabled.value =
			form.template === 'minimized-project' && Editor.state === 'closed';
	}
};

NewProject.readFileList = (function IIFE() {
	const options = { withFileTypes: true };
	const read = (
		dirname: string,
		idFilter: unknown,
		path: string,
		list: Array<{ folder?: boolean; path: string }>
	) => {
		return FSP.readdir(`${dirname}/${path}`, options).then(
			async (files: Array<{ name: string; isDirectory(): boolean }>) => {
				if (path) {
					path += '/';
				}
				const promises: Promise<unknown>[] = [];
				for (const file of files) {
					const newPath = `${path}${file.name}`;
					if (file.isDirectory()) {
						list.push({
							folder: true,
							path: newPath
						});
						promises.push(read(dirname, idFilter, newPath, list));
					} else {
						// 如果存在ID过滤器，文件名中包括了ID 但是未在ID过滤器中找到，则判定为多余文件，跳过
						if (idFilter) {
							const guid = File.parseGUID!(file.name);
							if (guid && !(idFilter as Record<string, unknown>)[guid]) continue;
						}
						list.push({
							path: newPath
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
	return function (this: typeof NewProject, dirname: string, idFilter: unknown) {
		return read(dirname, idFilter, '', []);
	};
})();

NewProject.copyFilesTo = function (this: typeof NewProject, ...args: unknown[]) {
	const sPath = args[0] as string;
	const dPath = args[1] as string;
	const idFilter = args[2];
	Window.open!('copyProgress');
	const progressBar = titleEls.get('copyProgress-bar') as YamiElement;
	const progressInfo = titleEls.get('copyProgress-info') as YamiElement;
	progressBar.style.width = '0';
	progressInfo.textContent = '';
	return this.readFileList!(sPath, idFilter).then(
		(list: Array<{ folder?: boolean; path: string }>) => {
			let total = 0;
			let count = 0;
			let info = '';
			const promises: Promise<unknown>[] = [];
			const length = list.length;
			for (let i = 0; i < length; i++) {
				const item = list[i];
				const path = item.path;
				switch (item.folder) {
					case true:
						FS.mkdirSync!(dPath + '/' + path);
						continue;
					default:
						promises.push(
							FSP.copyFile!(sPath + '/' + path, dPath + '/' + path).then(() => {
								count++;
								info = path;
							})
						);
						total++;
						continue;
				}
			}
			this.timer = new Timer({
				duration: Infinity,
				update: (_timer: Timer) => {
					const percent = Math.round((count / total) * 100);
					progressBar.style.width = `${percent}%`;
					progressInfo.textContent = info;
				}
			}).add();
			return Promise.all(promises);
		}
	);
};

NewProject.writeData = function (this: typeof NewProject, ...args: unknown[]) {
	const dirPath = args[0] as string;
	const path = `${dirPath}/data/config.json`;
	return FSP.readFile!(path, 'utf8').then((data: string) => {
		const config = JSON.parse(data);
		config.gameId = GUID.generate64bit();
		config.save.subdir = config.gameId;
		const json = JSON.stringify(config, null, 2);
		return FSP.writeFile!(path, json);
	});
};

NewProject.getNewFolder = function (this: typeof NewProject, ...args: unknown[]) {
	const location = args[0] as string;
	// oxlint-disable-next-line no-constant-condition
	for (let i = 1; true; i++) {
		const folder = `Project${i}`;
		if (!FS.existsSync!(Path.resolve!(location, folder))) {
			return folder;
		}
	}
};

NewProject.templateInput = function (this: typeof NewProject, ..._args: unknown[]) {
	NewProject.check!();
};

NewProject.folderBeforeinput = function (this: typeof NewProject, ...args: unknown[]) {
	const event = args[0] as InputEvent;
	if (event.inputType === 'insertText' && typeof event.data === 'string') {
		const regexp = /[\\/:*?"<>|"]/;
		if (regexp.test(event.data)) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
};

NewProject.folderInput = function (this: typeof NewProject, ..._args: unknown[]) {
	const regexp = /[\\/:*?"<>|"]/g;
	const oldName = form.folder;
	const newName = oldName.replace(regexp, '');
	if (oldName !== newName) {
		form.folder = newName;
	}
	NewProject.check!();
};

NewProject.locationInput = function (this: typeof NewProject, ..._args: unknown[]) {
	NewProject.check!();
};

NewProject.chooseClick = function (this: typeof NewProject, ..._args: unknown[]) {
	File.showOpenDialog!({
		defaultPath: form.location,
		properties: ['openDirectory']
	}).then(({ filePaths }: { filePaths: string[] }) => {
		if (filePaths.length === 1) {
			form.location = filePaths[0];
			NewProject.check!();
		}
	});
};

NewProject.confirm = function (this: typeof NewProject, ..._args: unknown[]) {
	const template = form.template;
	const location = form.location;
	const folder = form.folder;
	const sPath =
		template !== 'minimized-project'
			? Path.resolve!(TemplatesPath, template)
			: Path.resolve!(File.root);
	const dPath = Path.resolve!(location, folder);
	Window.close!('newProject');
	FSP.mkdir!(dPath, { recursive: true })
		.then((_done: boolean) => {
			return template === 'minimized-project' ? Data.createReferencedFileIDMap!() : undefined;
		})
		.then((idFilter: unknown) => {
			return NewProject.copyFilesTo!(sPath, dPath, idFilter);
		})
		.then((_done: boolean) => {
			return NewProject.writeData!(dPath);
		})
		.finally(() => {
			Window.close!('copyProgress');
			if (NewProject.timer) {
				NewProject.timer.remove();
				NewProject.timer = null;
			}
		})
		.then(() => {
			Editor.open!(`${dPath}/game.yamirpg`);
			Editor.config!.dialogs!.new = Path.slash!(Path.resolve!(location));
		})
		.catch((error: unknown) => {
			Editor.close!();
			Log.throw!(error);
			Window.confirm!(
				{
					message: 'Failed to create project',
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
		});
};

const newProjectConfirmOriginal = NewProject.confirm;

NewProject.confirm = function (this: typeof NewProject) {
	const template = read(titleEls.get('newProject-template') as YamiElement);
	const noResourceObj = isNoResource();
	if (
		(template == 'arpg-ts-english' && noResourceObj['arpg-ts-english'].check) ||
		(template == 'arpg-ts-chinese' && noResourceObj['arpg-ts-chinese'].check) ||
		template != (['arpg-ts-english', 'arpg-ts-chinese'] as unknown as string)
	) {
		newProjectConfirmOriginal!.call(Title);
	} else {
		alert(t('confirmation.resource-not-found'));
	}
};
