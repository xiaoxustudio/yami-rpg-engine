import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { on, addClass, clear } from '@/util/element-utils.ts';
import { Updater } from '@/update/updater.ts';

export interface UpdateLogItem {
	title?: string;
	major?: string;
	minor?: string;
}

export const UpdateLog = {
	content: $('#update-log-content'),
	currentMode: null as string | null,
	internalItems: null as unknown as UpdateLogItem[] | null,
	communityItems: null as unknown as UpdateLogItem[] | null,
	open: null as ((...args: unknown[]) => unknown) | null,
	update: null as ((...args: unknown[]) => unknown) | null,
	initialize: null as ((...args: unknown[]) => unknown) | null,
	switchMode: null as ((...args: unknown[]) => unknown) | null,
	loadCommunityReleases: null as ((...args: unknown[]) => unknown) | null,
	displayDonationList: null as ((...args: unknown[]) => unknown) | null,
	parseCommunityReleases: null as ((...args: unknown[]) => unknown) | null,
	windowClosed: null as ((...args: unknown[]) => unknown) | null
};

UpdateLog.initialize = function () {
	this.content = $('#update-log-content');
	const el = $('#update-log');
	if (el) on(el, 'closed', this.windowClosed!);
};

UpdateLog.open = function (this: typeof UpdateLog, items: UpdateLogItem[] | null = null) {
	if (items instanceof Array) {
		Window.open!('update-log');
		this.update!(items);
	} else {
		Updater.updateIncrementalChanges(Updater.latestProjectVersion);
	}
} as (...args: unknown[]) => unknown;

UpdateLog.update = function (this: typeof UpdateLog, items: UpdateLogItem[]) {
	if (!this.content) {
		this.content = $('#update-log-content');
	}
	clear(this.content);
	for (const item of items) {
		if (item.title) {
			const title = document.createElement('div');
			title.textContent = item.title;
			addClass(title, 'update-log-title');
			addClass(title, 'text');
			this.content.appendChild(title);
		}
		if (item.major) {
			const major = document.createElement('div');
			major.textContent = item.major;
			addClass(major, 'update-log-major');
			addClass(major, 'text');
			this.content.appendChild(major);
		}
		if (item.minor) {
			const minor = document.createElement('div');
			minor.textContent = item.minor;
			addClass(minor, 'update-log-minor');
			addClass(minor, 'text');
			this.content.appendChild(minor);
		}
	}
} as (...args: unknown[]) => unknown;

UpdateLog.windowClosed = function () {
	clear(UpdateLog.content);
};
