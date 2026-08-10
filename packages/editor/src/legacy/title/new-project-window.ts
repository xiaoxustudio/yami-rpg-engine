import { $, getElementWriter } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { disable, enable, getFocus, read, write } from '@/util/element-utils';
import { Timer } from '@/util/timer.ts';
import { Data } from '@/data/data-object.ts';
import { GUID } from '@/file/guid.ts';
import { File } from '@/file/file-system-core.ts';
import { FS, FSP } from '@/file/file-system.ts';
import { Layout } from '@/layout/layout.ts';
import { Log } from '@/log/log-window.ts';
import { Editor } from '@/main/editor.ts';
import { TemplatesPath } from '@/module/global.ts';
import { Local } from '@/tools/localization.ts';

import { Path } from '@/util/config.ts';

type NewProjectState = 'passed' | 'open' | 'closed' | 'unnamed' | 'existing';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type NewProjectMethod = ((...args: unknown[]) => unknown) | null;

interface NewProjectShape {
	state: NewProjectState;
	timer: Timer | null;
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
	const template = $('#newProject-template');
	if (!template) return;
	template.loadItems([
		{ name: 'ARPG - English', value: 'arpg-ts-english' },
		{ name: 'ARPG - 简体中文', value: 'arpg-ts-chinese' },
		{ name: 'Minimized Current Project', value: 'minimized-project' }
	]);

	template.addEventListener('input', this.templateInput as unknown as EventListener);
	// folder/location input 经 Vue 模板转发（NewProject.vue @input/@beforeinput → NewProject.*）
	$('#newProject-choose').addEventListener('click', this.chooseClick as unknown as EventListener);
	$('#newProject-confirm').addEventListener('click', this.confirm as unknown as EventListener);
};

NewProject.open = function (this: typeof NewProject) {
	Window.open!('newProject');
	const write = getElementWriter('newProject');
	const dialogs = Editor.config!.dialogs!;
	const location = Path.normalize!(dialogs.new!);
	const folder = this.getNewFolder!(location);
	let template;
	switch (Local.language) {
		default:
		case 'en-US':
			template = 'arpg-ts-english';
			break;
		case 'zh-CN':
			template = 'arpg-ts-chinese';
			break;
	}
	write('template', template);
	write('folder', folder);
	write('location', location);
	getFocus($('#newProject-template'));
	this.check!();
};

NewProject.check = function (this: typeof NewProject) {
	const folder = read($('#newProject-folder'));
	const location = read($('#newProject-location'));
	if (!folder) {
		if (this.state !== 'unnamed') {
			this.state = 'unnamed';
			$('#newProject-warning').textContent = Local.get!('confirmation.enterFolderName');
		}
		disable($('#newProject-confirm'));
	} else if (FS.existsSync!(Path.resolve!(location, folder))) {
		if (this.state !== 'existing') {
			this.state = 'existing';
			$('#newProject-warning').textContent = Local.get!('confirmation.folderAlreadyExists');
		}
		disable($('#newProject-confirm'));
	} else {
		if (this.state !== 'passed') {
			this.state = 'passed';
			$('#newProject-warning').textContent = '';
		}
		const template = read($('#newProject-template'));
		if (template === 'minimized-project' && Editor.state === 'closed') {
			disable($('#newProject-confirm'));
		} else {
			enable($('#newProject-confirm'));
		}
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
	const progressBar = $('#copyProgress-bar');
	const progressInfo = $('#copyProgress-info');
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
				update: (timer: Timer) => {
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
	for (let i = 1; true; i++) {
		const folder = `Project${i}`;
		if (!FS.existsSync!(Path.resolve!(location, folder))) {
			return folder;
		}
	}
};

NewProject.templateInput = function (this: typeof NewProject, ...args: unknown[]) {
	const event = args[0] as Event;
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

NewProject.folderInput = function (this: typeof NewProject, ...args: unknown[]) {
	const event = args[0] as Event;
	const el = $('#newProject-folder');
	const regexp = /[\\/:*?"<>|"]/g;
	const oldName = read(el);
	const newName = oldName.replace(regexp, '');
	if (oldName !== newName) {
		write(el, newName);
	}
	NewProject.check!();
};

NewProject.locationInput = function (this: typeof NewProject, ...args: unknown[]) {
	const event = args[0] as Event;
	NewProject.check!();
};

NewProject.chooseClick = function (this: typeof NewProject, ...args: unknown[]) {
	const event = args[0] as Event;
	const input = $('#newProject-location');
	File.showOpenDialog!({
		defaultPath: read(input),
		properties: ['openDirectory']
	}).then(({ filePaths }: { filePaths: string[] }) => {
		if (filePaths.length === 1) {
			write(input, filePaths[0]);
			NewProject.check!();
		}
	});
};

NewProject.confirm = function (this: typeof NewProject, ...args: unknown[]) {
	const event = args[0] as Event;
	const template = read($('#newProject-template'));
	const location = read($('#newProject-location'));
	const folder = read($('#newProject-folder'));
	const sPath =
		template !== 'minimized-project'
			? Path.resolve!(TemplatesPath, template)
			: Path.resolve!(File.root);
	const dPath = Path.resolve!(location, folder);
	Window.close!('newProject');
	FSP.mkdir!(dPath, { recursive: true })
		.then((done: boolean) => {
			return template === 'minimized-project' ? Data.createReferencedFileIDMap!() : undefined;
		})
		.then((idFilter: unknown) => {
			return NewProject.copyFilesTo!(sPath, dPath, idFilter);
		})
		.then((done: boolean) => {
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
