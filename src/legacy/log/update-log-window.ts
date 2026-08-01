import { $ } from '@/util/dom.ts';
import { on, addClass, clear } from '@/util/element-utils.ts';
import { Window } from '@/tools/window-object.ts';
import { Updater } from '@/update/updater.ts';

export const UpdateLog = {
	content: $('#update-log-content'),
	currentMode: null as string | null,
	internalItems: null as any[] | null,
	communityItems: null as any[] | null,
	open: null as ((items?: any) => void) | null,
	update: null as ((items: any) => void) | null,
	initialize: null as (() => void) | null,
	switchMode: null as ((...args: any[]) => any) | null,
	loadCommunityReleases: null as ((...args: any[]) => any) | null,
	displayDonationList: null as ((...args: any[]) => any) | null,
	parseCommunityReleases: null as ((...args: any[]) => any) | null,
	windowClosed: null as (() => void) | null
};

UpdateLog.initialize = function () {
	this.content = $('#update-log-content');
	const el = $('#update-log');
	if (el) on(el, 'closed', this.windowClosed);
};

UpdateLog.open = function (items: any = null) {
	if (items instanceof Array) {
		(Window.open as any)('update-log');
		this.update!(items);
	} else {
		Updater.updateIncrementalChanges(Updater.latestProjectVersion);
	}
};

UpdateLog.update = function (items: any) {
	if (!this.content) {
		this.content = $('#update-log-content');
	}
	clear(this.content);
	for (const item of items) {
		if (item.title) {
			const title = document.createElement('text');
			title.textContent = item.title;
			addClass(title, 'update-log-title');
			this.content.appendChild(title);
		}
		if (item.major) {
			const major = document.createElement('text');
			major.textContent = item.major;
			addClass(major, 'update-log-major');
			this.content.appendChild(major);
		}
		if (item.minor) {
			const minor = document.createElement('text');
			minor.textContent = item.minor;
			addClass(minor, 'update-log-minor');
			this.content.appendChild(minor);
		}
	}
};

UpdateLog.windowClosed = function () {
	clear(UpdateLog.content);
};
