import { Editor } from '@app/services/project/editor.ts';
import { logEls } from '@app/log/element-registry';

import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { CHANNELS } from '@app/services/ipc/channels.ts';

interface LogShape {
	readonly box: HTMLElement | null;
	devmode: boolean;
	initialize: ((...args: unknown[]) => void) | null;
	throw: ((...args: unknown[]) => void) | null;
	print: ((...args: unknown[]) => void) | null;
	clear: (() => void) | null;
	update: (() => void) | null;
	tick: (() => void) | null;
	warn: ((message: string, ...args: unknown[]) => void) | null;
	catchError: ((...args: unknown[]) => void) | null;
	catchRejection: ((...args: unknown[]) => void) | null;
	tscLog: ((...args: unknown[]) => void) | null;
	log: ((message: string) => void) | null;
	error: ((message: string) => void) | null;
	open: ((...args: unknown[]) => void) | null;
	switchMode: ((...args: unknown[]) => void) | null;
	loadCommunityReleases: ((...args: unknown[]) => void) | null;
	displayDonationList: ((...args: unknown[]) => void) | null;
	parseCommunityReleases: ((...args: unknown[]) => void) | null;
	openVSCode: ((file: string, line: number, column: number) => void) | null;
	list: { type: string; message: string; duration: number }[];
}

const log: Omit<LogShape, 'list'> = {
	get box() {
		return logEls.get('log-message') as YamiElement;
	},
	devmode: typeof process !== 'undefined' && process.argv?.includes('--debug-mode'),
	initialize: null as (() => void) | null,
	throw: null as ((...args: unknown[]) => void) | null,
	print: null as ((...args: unknown[]) => void) | null,
	clear: null as (() => void) | null,
	update: null as (() => void) | null,
	tick: null as (() => void) | null,
	warn: null as ((message: string, ...args: unknown[]) => void) | null,
	catchError: null as ((...args: unknown[]) => void) | null,
	catchRejection: null as ((...args: unknown[]) => void) | null,
	tscLog: null as ((...args: unknown[]) => void) | null,
	log: null as ((message: string) => void) | null,
	error: null as ((message: string) => void) | null,
	open: null as ((...args: unknown[]) => void) | null,
	switchMode: null as ((...args: unknown[]) => void) | null,
	loadCommunityReleases: null as ((...args: unknown[]) => void) | null,
	displayDonationList: null as ((...args: unknown[]) => void) | null,
	parseCommunityReleases: null as ((...args: unknown[]) => void) | null,
	openVSCode: null as ((file: string, line: number, column: number) => void) | null
};

export const Log = log as LogShape;

let tickInterval: ReturnType<typeof setInterval> | null = null;

Log.initialize = function () {
	if (tickInterval) return;
	tickInterval = setInterval(this.tick!, 1000);

	window.addEventListener('error', this.catchError!);
	window.addEventListener('unhandledrejection', this.catchRejection!);
	YamiIpc.events.on(CHANNELS.send.tscLog, this.tscLog!);
};

Log.throw = function (error: unknown) {
	if (this.devmode) {
		throw error;
	} else {
		console.error(error);
	}
};

Log.print = function (item: unknown) {
	const list = getLogStore().logs;
	if (list.length < 50) {
		list.push(item as { type: string; message: string; duration: number });
		this.update!();
	}
};

Log.clear = function () {
	getLogStore().logs.length = 0;
	this.update!();
};

Log.update = function () {
	const { box } = this;
	if (!box) return;
	(box as HTMLElement & { update?: () => void }).update?.();
};

Log.tick = function () {
	let changed = false;
	const list = getLogStore().logs;
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

Log.catchError = function (event: unknown) {
	const errorEvent = event as ErrorEvent;
	if (errorEvent.message === 'ResizeObserver loop limit exceeded') {
		errorEvent.preventDefault?.();
		errorEvent.stopImmediatePropagation?.();
		return;
	}
	if (Editor.state === 'open') {
		Log.print!({
			type: 'error',
			message: errorEvent.message,
			duration: 6
		});
	}
};

Log.catchRejection = function (event: unknown) {
	if (Editor.state === 'open') {
		Log.print!({
			type: 'error',
			message: (event as PromiseRejectionEvent).reason,
			duration: 6
		});
	}
};

Log.openVSCode = function (file: string, line: number, column: number) {
	YamiIpc.send.openVscode(file, line, column);
};

Log.tscLog = function (_event: unknown, tscMessage: unknown) {
	let duration = 6;
	let message = (tscMessage as string).replace('[2J[3J[H', '').trim();
	if (message.includes('Starting')) {
		Log.clear!();
		duration = 6;
	} else if (message.includes('Found 0 errors')) {
		duration = 6;
	} else if (message.includes('error TS')) {
		message = message.replace(
			/^([^\s]+\.ts)\((\d+),(\d+)\)/gm,
			(_match: string, path: string, line: string, column: string) => {
				const index = path.lastIndexOf('/');
				if (index !== -1) {
					path = `${path.slice(0, index + 1)}<span class="log-strong">${path.slice(index + 1)}</span>`;
				}
				return `<span class="log-path">${path}</span>(<span class="log-num">${line}</span>,<span class="log-num">${column}</span>)`;
			}
		);
		message = message.replace(/(error TS\d+)/g, '<span class="log-weak">$1</span>');
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

import { getLogStore } from '@app/stores/log';
import type { YamiElement } from '@app/types/element-api';

Object.defineProperty(Log, 'list', {
	get: () => getLogStore().logs,
	set: (value: { type: string; message: string; duration: number }[]) => {
		getLogStore().logs = value;
	},
	configurable: true
});
