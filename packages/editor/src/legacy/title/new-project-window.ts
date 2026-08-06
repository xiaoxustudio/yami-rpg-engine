import { $, getElementWriter } from '@/util/dom.ts';
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
function getWindow() {
	return (window as any).Window;
}
import { Path } from '@/util/config.ts';

type NewProjectState = 'passed' | 'open' | 'closed';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type NewProjectMethod = ((...args: any[]) => any) | null;

interface NewProjectShape {
	state: NewProjectState;
	timer: any | null;
	initialize: (() => void) | null;
	open: NewProjectMethod;
	check: NewProjectMethod;
	readFileList: NewProjectMethod;
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

NewProject.initialize = function () {
	const template = $('#newProject-template');
	if (!template) return;
	template.loadItems([
		{ name: 'ARPG - English', value: 'arpg-ts-english' },
		{ name: 'ARPG - 简体中文', value: 'arpg-ts-chinese' },
		{ name: 'Minimized Current Project', value: 'minimized-project' }
	]);

	template.addEventListener('input', this.templateInput);
	// folder/location input 经 Vue 模板转发（NewProject.vue @input/@beforeinput → NewProject.*）
	$('#newProject-choose').addEventListener('click', this.chooseClick);
	$('#newProject-confirm').addEventListener('click', this.confirm);
};

NewProject.open = function () {
	getWindow().open('newProject');
	const write = getElementWriter('newProject');
	const dialogs = Editor.config.dialogs;
	const location = Path.normalize(dialogs.new);
	const folder = this.getNewFolder(location);
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
	this.check();
};

NewProject.check = function () {
	const folder = read($('#newProject-folder'));
	const location = read($('#newProject-location'));
	if (!folder) {
		if (this.state !== 'unnamed') {
			this.state = 'unnamed';
			$('#newProject-warning').textContent = Local.get('confirmation.enterFolderName');
		}
		disable($('#newProject-confirm'));
	} else if (FS.existsSync(Path.resolve(location, folder))) {
		if (this.state !== 'existing') {
			this.state = 'existing';
			$('#newProject-warning').textContent = Local.get('confirmation.folderAlreadyExists');
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
	const read = (dirname, idFilter, path, list) => {
		return (FSP.readdir as any)(`${dirname}/${path}`, options).then(async (files: any[]) => {
			if (path) {
				path += '/';
			}
			const promises = [];
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
						const guid = File.parseGUID(file.name);
						if (guid && !idFilter[guid]) continue;
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
		});
	};
	return function (dirname, idFilter) {
		return read(dirname, idFilter, '', []);
	};
})();

NewProject.copyFilesTo = function (sPath, dPath, idFilter) {
	getWindow().open('copyProgress');
	const progressBar = $('#copyProgress-bar');
	const progressInfo = $('#copyProgress-info');
	progressBar.style.width = '0';
	progressInfo.textContent = '';
	return this.readFileList(sPath, idFilter).then((list) => {
		let total = 0;
		let count = 0;
		let info = '';
		const promises = [];
		const length = list.length;
		for (let i = 0; i < length; i++) {
			const item = list[i];
			const path = item.path;
			switch (item.folder) {
				case true:
					FS.mkdirSync(dPath + '/' + path);
					continue;
				default:
					promises.push(
						FSP.copyFile(sPath + '/' + path, dPath + '/' + path).then(() => {
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
			update: (timer) => {
				const percent = Math.round((count / total) * 100);
				progressBar.style.width = `${percent}%`;
				progressInfo.textContent = info;
			}
		}).add();
		return Promise.all(promises);
	});
};

NewProject.writeData = function (dirPath) {
	const path = `${dirPath}/data/config.json`;
	return FSP.readFile(path, 'utf8').then((data) => {
		const config = JSON.parse(data);
		config.gameId = GUID.generate64bit();
		config.save.subdir = config.gameId;
		const json = JSON.stringify(config, null, 2);
		return FSP.writeFile(path, json);
	});
};

NewProject.getNewFolder = function (location) {
	for (let i = 1; true; i++) {
		const folder = `Project${i}`;
		if (!FS.existsSync(Path.resolve(location, folder))) {
			return folder;
		}
	}
};

NewProject.templateInput = function (event) {
	NewProject.check();
};

NewProject.folderBeforeinput = function (event) {
	if (event.inputType === 'insertText' && typeof event.data === 'string') {
		const regexp = /[\\/:*?"<>|"]/;
		if (regexp.test(event.data)) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
};

NewProject.folderInput = function (event) {
	const el = $('#newProject-folder');
	const regexp = /[\\/:*?"<>|"]/g;
	const oldName = read(el);
	const newName = oldName.replace(regexp, '');
	if (oldName !== newName) {
		write(el, newName);
	}
	NewProject.check();
};

NewProject.locationInput = function (event) {
	NewProject.check();
};

NewProject.chooseClick = function (event) {
	const input = $('#newProject-location');
	File.showOpenDialog({
		defaultPath: read(input),
		properties: ['openDirectory']
	}).then(({ filePaths }) => {
		if (filePaths.length === 1) {
			write(input, filePaths[0]);
			NewProject.check();
		}
	});
};

NewProject.confirm = function (event) {
	const template = read($('#newProject-template'));
	const location = read($('#newProject-location'));
	const folder = read($('#newProject-folder'));
	const sPath =
		template !== 'minimized-project'
			? Path.resolve(TemplatesPath, template)
			: Path.resolve(File.root);
	const dPath = Path.resolve(location, folder);
	getWindow().close('newProject');
	FSP.mkdir(dPath, { recursive: true })
		.then((done) => {
			return template === 'minimized-project' ? Data.createReferencedFileIDMap() : undefined;
		})
		.then((idFilter) => {
			return NewProject.copyFilesTo(sPath, dPath, idFilter);
		})
		.then((done) => {
			return NewProject.writeData(dPath);
		})
		.finally(() => {
			getWindow().close('copyProgress');
			if (NewProject.timer) {
				NewProject.timer.remove();
				NewProject.timer = null;
			}
		})
		.then(() => {
			Editor.open(`${dPath}/game.yamirpg`);
			Editor.config.dialogs.new = Path.slash(Path.resolve(location));
		})
		.catch((error) => {
			Editor.close();
			Log.throw(error);
			getWindow().confirm(
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
