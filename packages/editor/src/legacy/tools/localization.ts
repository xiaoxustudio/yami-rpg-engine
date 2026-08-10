import { $ } from '@/util/dom.ts';
import { addClass, setTooltip } from '@/util/element-utils';
import { Path } from '@/util/config.ts';
import { fileURLToPath } from 'node:url';
import { File } from '@/file/file-system-core.ts';
import { FSP } from '@/file/file-system.ts';
import { Log } from '@/log/log-window.ts';
import { Editor } from '@/main/editor.ts';

interface LocalComponentItem {
	save?: string;
	content?: string;
	title?: string;
	label?: string;
	tip?: string;
	placeholder?: string;
	options?: string[];
}

interface LocalShape {
	active: string;
	dirname: string;
	language: string;
	languages: { key: string; alias: string; filename: string }[];
	properties: Record<string, string>;
	components: Record<string, LocalComponentItem>;
	saveItems: Record<string, LocalComponentItem>;
	saveTagExp: RegExp;
	titleTagExp: RegExp;
	initialize: ((this: typeof Local) => void) | null;
	update: ((this: typeof Local, data: Record<string, unknown>) => void) | null;
	readLanguageList:
		| ((
				this: typeof Local
		  ) => Promise<{ key: string; alias: string; filename: string }[]> | null)
		| null;
	setLanguage: ((this: typeof Local, language: string) => Promise<void>) | null;
	setProperties: ((this: typeof Local, data: Record<string, unknown>) => void) | null;
	setElement:
		| ((this: typeof Local, element: HTMLElement, item: LocalComponentItem) => void)
		| null;
	parseTip: ((this: typeof Local, tip: string, title: string) => string) | null;
	createGetter: ((this: typeof Local, path: string) => (key: string) => any) | null;
	get: ((this: typeof Local, key: string) => string) | null;
	showInExplorer: (() => string | undefined) | null;
	localize: ((id?: string, key?: string) => void) | null;
}

export const Local: LocalShape = {
	active: null as unknown as string,
	dirname: '',
	language: null as unknown as string,
	languages: null as unknown as { key: string; alias: string; filename: string }[],
	properties: {} as Record<string, string>,
	components: {} as Record<string, LocalComponentItem>,
	saveItems: {} as Record<string, LocalComponentItem>,
	saveTagExp: /^#(\S+)$/,
	titleTagExp: /\$([\S ]+)(?=\n|$)/g,
	initialize: null,
	update: null,
	readLanguageList: null,
	setLanguage: null,
	setProperties: null,
	setElement: null,
	parseTip: null,
	createGetter: null,
	get: null,
	showInExplorer: null,
	localize: null
};

Local.initialize = function (this: typeof Local) {
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
		? Path.dirname!(Path.dirname!(_modulePath))
		: typeof process !== 'undefined' &&
			  typeof process.cwd === 'function' &&
			  typeof Path.resolve === 'function'
			? Path.resolve!(process.cwd(), 'Project')
			: '';
	this.dirname = _moduleDir ? Path.resolve!(_moduleDir, 'Locales') : '';
	this.readLanguageList!()!
		.then(() => {
			return this.setLanguage!(Editor.config!.language ?? '');
		})
		.then(() => {
			addClass($('#menu'), 'visible');
		});
};

Local.readLanguageList = function (this: typeof Local) {
	const languages = (this.languages = [] as { key: string; alias: string; filename: string }[]);
	return FSP.readdir!(this.dirname, { withFileTypes: true })
		.then((files: Array<{ name: string; isFile(): boolean; isDirectory(): boolean }>) => {
			const regexp = /\.(.+)$/;
			for (const file of files) {
				if (file.isDirectory()) {
					continue;
				}
				const name = file.name;
				const extname = Path.extname!(name);
				if (extname.toLowerCase() !== '.json') {
					continue;
				}
				const basename = Path.basename!(name, extname);
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
		.catch((error: unknown) => {
			Log.throw!(error);
			return languages;
		});
};

Local.setLanguage = async function (this: typeof Local, language: string) {
	Editor.config!.language = language;
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
				const path = Path.resolve!(this.dirname, filename);
				this.update!(await File.get!({ local: path, type: 'json' }));
				this.active = filename;
				this.language = language;
				window.dispatchEvent(new Event('localize'));
			} catch (error: unknown) {
				console.error(new Error('Failed to load language pack'));
				Log.throw!(error);
			}
		}
		return;
	}
	// 找不到语言包时切换到自动模式
	if (Editor.config!.language) {
		return this.setLanguage!('');
	}
};

Local.update = (function IIFE() {
	const throwError = (_message: unknown) => {};
	return function (this: typeof Local, data: Record<string, unknown>) {
		this.setProperties!(data.properties as Record<string, unknown>);
		this.components = (data.components ?? {}) as Record<string, LocalComponentItem>;
		const entries = Object.entries(data.components ?? {});
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
						this.setElement!(elements[i] as HTMLElement, item as LocalComponentItem);
					}
				} else {
					throwError(`key '${key}' is invalid`);
				}
			} else {
				const element = document.getElementById(key);
				if (element !== null) {
					this.setElement!(element, item as LocalComponentItem);
				} else {
					throwError(`key '${key}' is invalid`);
				}
			}
		}
		this.saveItems = {} as Record<string, LocalComponentItem>;
	};
})();

Local.setProperties = (function IIFE() {
	const setProperty = (map: Record<string, string>, path: string, value: unknown) => {
		map[path] = value as string;
		if (value instanceof Object) {
			for (const key of Object.keys(value)) {
				setProperty(map, path + '.' + key, (value as Record<string, unknown>)[key]);
			}
		}
	};
	return function (this: typeof Local, data: Record<string, unknown>) {
		const map = this.properties;
		if (data instanceof Object) {
			for (const key of Object.keys(data)) {
				setProperty(map, key, data[key]);
			}
		}
	};
})();

Local.setElement = (function IIFE() {
	const throwError = (_element: unknown, _message: unknown) => {};
	return function (this: typeof Local, element: HTMLElement, item: LocalComponentItem) {
		if (item.save !== undefined) {
			Local.saveItems[item.save] = item;
		}
		if (item.content !== undefined) {
			element.textContent = item.content;
		}
		if (item.title !== undefined) {
			if ((element as HTMLElement).classList.contains('window-frame')) {
				if (typeof element.setTitle === 'function') {
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
			setTooltip(element, Local.parseTip!(item.tip, item.label ?? item.content ?? ''));
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

Local.parseTip = function (this: typeof Local, tip: string, title: string) {
	const match = this.saveTagExp.exec(tip);
	let string: string = match ? (this.saveItems[match[1]]?.tip ?? '') : tip;
	if (title && tip[0] !== '$') {
		string = `<b>${title}</b>\n${string}`;
	}
	return string.replace(this.titleTagExp, '<b>$1</b>');
};

Local.createGetter = function (this: typeof Local, path: string) {
	const prefix = path + '.';
	return (key: string) => this.get!(prefix + key);
};

Local.get = function (this: typeof Local, key: string) {
	const property = this.properties[key];
	if (property === undefined) {
		const index = key.lastIndexOf('.');
		if (index !== -1) {
			key = key.slice(index + 1);
		}
		const remap = 'common.' + key;
		return this.properties[remap] ?? '';
	}
	return property ?? '';
};

Local.showInExplorer = function (this: typeof Local) {
	switch (typeof process !== 'undefined' ? process.platform : '') {
		case 'win32':
			return 'showInExplorer';
		case 'darwin':
			return 'showInFinder';
	}
};

const localStateKeys = ['language', 'active', 'languages'] as const;
import { getLocalStore } from '@app/stores/local';

for (const key of localStateKeys) {
	Object.defineProperty(Local, key, {
		get: () => getLocalStore()[key],
		set: (value: string) => {
			const store = getLocalStore();
			(store as unknown as Record<(typeof localStateKeys)[number], any>)[key] = value;
		},
		configurable: true
	});
}
