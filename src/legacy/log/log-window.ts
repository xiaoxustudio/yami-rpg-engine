import { $ } from '@/util/dom.ts';
import { addClass, removeClass, clear } from '@/util/element-utils.ts';
import { File } from '@/file/file-system-core.ts';
import { Editor } from '@/main/editor.ts';

import { ipcRenderer } from 'electron';

export const Log = {
	box: $('#log-message'),
	list: [] as any[],
	devmode: process.argv.includes('--debug-mode'),
	initialize: null as (() => void) | null,
	throw: null as ((error: any) => void) | null,
	print: null as ((item: any) => void) | null,
	clear: null as (() => void) | null,
	update: null as (() => void) | null,
	tick: null as (() => void) | null,
	// runtime 挂载: main/initialize.ts 中挂载警告输出
	warn: null as ((message: string, ...args: any[]) => void) | null,
	catchError: null as ((event: any) => void) | null,
	catchRejection: null as ((event: any) => void) | null,
	tscLog: null as ((event: any, tscMessage: any) => void) | null
};

Log.initialize = function () {
	setInterval(this.tick!, 1000);

	window.addEventListener('error', this.catchError!);
	window.addEventListener('unhandledrejection', this.catchRejection!);
	ipcRenderer.on('tsc-log', this.tscLog!);
};

Log.throw = function (error: any) {
	if (this.devmode) {
		throw error;
	} else {
		console.error(error);
	}
};

Log.print = function (item: any) {
	if (this.list.length < 50) {
		this.list.push(item);
		this.update!();
	}
};

Log.clear = function () {
	this.list.length = 0;
	this.update!();
};

Log.update = function () {
	const { box, list } = this;
	if (!box) return;
	clear(box);
	if (list.length !== 0) {
		for (const item of list) {
			const text = document.createElement('log-item');
			text.innerHTML = item.message;
			addClass(text, item.type);
			box.appendChild(text);
			for (const path of box.querySelectorAll('log-path')) {
				path.onclick = () => {
					const LINE = path.nextElementSibling;
					const COLUMN = LINE.nextElementSibling;
					const file = File.route!(path.textContent);
					const line = parseInt(LINE.textContent);
					const column = parseInt(COLUMN.textContent);
					ipcRenderer.send('open-vscode', file, line, column);
				};
			}
		}
		addClass(box, 'open');
	} else {
		removeClass(box, 'open');
	}
};

Log.tick = function () {
	let changed = false;
	const list = Log.list;
	let i = list.length;
	while (--i >= 0) {
		const item = list[i];
		item.duration -= 1;
		if (item.duration <= 0) {
			list.splice(i, 1);
			changed = true;
		}
	}
	if (changed) {
		Log.update!();
	}
};

Log.catchError = function (event: any) {
	if (Editor.state === 'open') {
		Log.print!({
			type: 'error',
			message: event.message,
			duration: 6
		});
	}
};

Log.catchRejection = function (event: any) {
	if (Editor.state === 'open') {
		Log.print!({
			type: 'error',
			message: event.reason,
			duration: 6
		});
	}
};

Log.tscLog = function (event: any, tscMessage: any) {
	let duration = 6;
	let message = tscMessage.replace('[2J[3J[H', '').trim();
	if (message.includes('Starting')) {
		Log.clear!();
		duration = 6;
	} else if (message.includes('Found 0 errors')) {
		duration = 6;
	} else if (message.includes('error TS')) {
		message = message.replace(
			/^([^\s]+\.ts)\((\d+),(\d+)\)/gm,
			(match: any, path: any, line: any, column: any) => {
				const index = path.lastIndexOf('/');
				if (index !== -1) {
					path = `${path.slice(0, index + 1)}<log-strong>${path.slice(index + 1)}</log-strong>`;
				}
				return `<log-path>${path}</log-path>(<log-num>${line}</log-num>,<log-num>${column}</log-num>)`;
			}
		);
		message = message.replace(/(error TS\d+)/g, '<log-weak>$1</log-weak>');
		duration = Infinity;
	} else if (message.includes('Watching for file changes')) {
		duration = Infinity;
	}
	Log.print!({
		type: 'log',
		message: message,
		duration: duration
	});
};
