import { $ } from '@/util/dom.ts';
import { addClass, setTooltip } from '@/util/element-utils';
import { Path } from '@/util/config.ts';
import { fileURLToPath } from 'node:url';
import { File } from '@/file/file-system-core.ts';
import { FSP } from '@/file/file-system.ts';
import { Log } from '@/log/log-window.ts';
import { Editor } from '@/main/editor.ts';

export const Local = {
	active: null as any,
	dirname: '',
	language: null as any,
	languages: null as any,
	properties: {},
	// 保存最近一次 update() 的 components 表，供延迟创建的元素（如动态渲染的设置项）按 id 取回 label/tip/content
	components: {} as Record<string, any>,
	saveItems: {},
	saveTagExp: /^#(\S+)$/,
	titleTagExp: /\$([\S ]+)(?=\n|$)/g,
	initialize: null as any,
	update: null as any,
	readLanguageList: null as any,
	setLanguage: null as any,
	setProperties: null as any,
	setElement: null as any,
	parseTip: null as any,
	createGetter: null as any,
	get: null as any,
	showInExplorer: null
};

Local.initialize = function () {
	for (const button of document.getElementsByName('confirm')) {
		button.setAttribute('hotkey', 'Ctrl+Enter');
	}
	for (const button of document.getElementsByName('cancel')) {
		button.setAttribute('hotkey', 'Escape');
	}
	// ESM 下 __dirname 不存在，用 import.meta.url 推算：file: 协议剥两次得 dist/，http/https 兜底 cwd()/Project
	const _moduleURL = new URL(import.meta.url);
	const _modulePath =
		typeof fileURLToPath === 'function' && _moduleURL.protocol === 'file:'
			? fileURLToPath(_moduleURL)
			: '';
	const _moduleDir = _modulePath
		? Path.dirname(Path.dirname(_modulePath))
		: typeof process !== 'undefined' &&
			  typeof process.cwd === 'function' &&
			  typeof Path.resolve === 'function'
			? Path.resolve(process.cwd(), 'Project')
			: '';
	this.dirname = _moduleDir ? Path.resolve(_moduleDir, 'Locales') : '';
	this.readLanguageList()
		.then(() => {
			return this.setLanguage(Editor.config.language);
		})
		.then(() => {
			addClass($('#menu'), 'visible');
		});
};

Local.readLanguageList = function () {
	const languages = (this.languages = []);
	return FSP.readdir(this.dirname, { withFileTypes: true })
		.then((files) => {
			const regexp = /\.(.+)$/;
			for (const file of files) {
				if (file.isDirectory()) {
					continue;
				}
				const name = file.name;
				const extname = Path.extname(name);
				if (extname.toLowerCase() !== '.json') {
					continue;
				}
				const basename = Path.basename(name, extname);
				const match = basename.match(regexp);
				if (match) {
					languages.push({
						key: basename.slice(0, match.index),
						alias: match[1],
						filename: name
					});
				} else {
					languages.push({
						key: basename,
						alias: basename,
						filename: name
					});
				}
			}
			return languages;
		})
		.catch((error) => {
			Log.throw(error);
			return languages;
		});
};

Local.setLanguage = async function (language) {
	Editor.config.language = language;
	if (language === '') {
		language = 'en-US';
		let matchedWeight = 0;
		const sKeys = navigator.language.split('-');
		for (const { key } of this.languages) {
			const dKeys = key.split('-');
			if (sKeys[0] === dKeys[0]) {
				let weight = 0;
				for (let sKey of sKeys) {
					if (dKeys.includes(sKey)) {
						weight++;
					}
				}
				if (matchedWeight < weight) {
					matchedWeight = weight;
					language = key;
				}
			}
		}
	}
	for (const { key, filename } of this.languages) {
		if (key !== language) continue;
		if (this.active !== filename) {
			try {
				const path = Path.resolve(this.dirname, filename);
				this.update(await File.get({ local: path, type: 'json' }));
				this.active = filename;
				this.language = language;
				window.dispatchEvent(new Event('localize'));
			} catch (error: any) {
				console.error(new Error('Failed to load language pack'));
				Log.throw(error);
			}
		}
		return;
	}
	// 找不到语言包时切换到自动模式
	if (Editor.config.language) {
		return this.setLanguage('');
	}
};

Local.update = (function IIFE() {
	const throwError = (_message) => {};
	return function (data) {
		this.setProperties(data.properties);
		this.components = data.components ?? {};
		const setElement = this.setElement;
		const entries = Object.entries(data.components);
		const length = entries.length;
		for (let i = 0; i < length; i++) {
			const [key, item] = entries[i];
			if (key[0] === '[') {
				if (key === '[comment]') continue;
				const elements =
					key[1] === '.'
						? document.getElementsByClassName(key.slice(2, -1))
						: document.getElementsByName(key.slice(1, -1));
				const length = elements.length;
				if (length !== 0) {
					for (let i = 0; i < length; i++) {
						setElement(elements[i], item);
					}
				} else {
					throwError(`key '${key}' is invalid`);
				}
			} else {
				const element = document.getElementById(key);
				if (element !== null) {
					setElement(element, item);
				} else {
					throwError(`key '${key}' is invalid`);
				}
			}
		}
		this.saveItems = {};
	};
})();

Local.setProperties = (function IIFE() {
	const setProperty = (map, path, value) => {
		map[path] = value;
		if (value instanceof Object) {
			for (const key of Object.keys(value)) {
				setProperty(map, path + '.' + key, value[key]);
			}
		}
	};
	return function (data) {
		const map = this.properties;
		if (data instanceof Object) {
			for (const key of Object.keys(data)) {
				setProperty(map, key, data[key]);
			}
		}
	};
})();

Local.setElement = (function IIFE() {
	const throwError = (_element, _message) => {};
	return function (element, item) {
		if (item.save !== undefined) {
			Local.saveItems[item.save] = item;
		}
		if (item.content !== undefined) {
			element.textContent = item.content;
		}
		if (item.title !== undefined) {
			if ((element as HTMLElement).classList.contains('window-frame')) {
				if (typeof (element as any).setTitle === 'function') {
					element.setTitle(item.title);
				}
			} else {
				throwError(element, 'typeof @element is not window-frame');
			}
		}
		if (item.label !== undefined) {
			const prev = element.previousElementSibling;
			if (prev instanceof HTMLElement) {
				prev.textContent = item.label;
			} else {
				throwError(element, 'there is no label of @element');
			}
		}
		if (item.tip !== undefined) {
			setTooltip(element, Local.parseTip(item.tip, item.label ?? item.content));
		}
		if (item.placeholder !== undefined) {
			if ((element as HTMLElement).classList.contains('text-box')) {
				element.setPlaceholder(item.placeholder);
			} else {
				throwError(element, 'typeof @element is not text-box');
			}
		}
		if (item.options !== undefined) {
			if ((element as HTMLElement).classList.contains('select-box')) {
				element.setItemNames(item.options);
			} else {
				throwError(element, 'typeof @element is not select-box');
			}
		}
	};
})();

Local.parseTip = function (tip, title) {
	const match = this.saveTagExp.exec(tip);
	let string = match ? this.saveItems[match[1]].tip : tip;
	if (title && tip[0] !== '$') {
		string = `<b>${title}</b>\n${string}`;
	}
	return string.replace(this.titleTagExp, '<b>$1</b>');
};

Local.createGetter = function (path) {
	const prefix = path + '.';
	return (key) => this.get(prefix + key);
};

Local.get = function (key) {
	const property = this.properties[key];
	if (property === undefined) {
		const index = key.lastIndexOf('.');
		if (index !== -1) {
			key = key.slice(index + 1);
		}
		const remap = 'common.' + key;
		return this.properties[remap] ?? '';
	}
	return property;
};

Local.showInExplorer = function () {
	switch (typeof process !== 'undefined' ? process.platform : '') {
		case 'win32':
			return 'showInExplorer';
		case 'darwin':
			return 'showInFinder';
	}
};

import { localStateKeys, getLocalStore } from '@app/stores/local';

for (const key of localStateKeys) {
	Object.defineProperty(Local, key, {
		get: () => getLocalStore()[key],
		set: (value: any) => {
			const store = getLocalStore();
			(store as any)[key] = value;
		},
		configurable: true
	});
}
