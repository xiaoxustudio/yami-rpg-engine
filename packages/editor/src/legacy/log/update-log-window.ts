import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { on } from '@/util/element-utils.ts';
import { Updater } from '@/update/updater.ts';
import { initializeUpdateLog } from '@/module/global.ts';

export interface UpdateLogItem {
	title?: string;
	major?: string;
	minor?: string;
}

export const UpdateLog = {
	currentMode: null as string | null,
	internalItems: null as unknown as UpdateLogItem[] | null,
	communityItems: null as unknown as UpdateLogItem[] | null,
	open: null as ((...args: unknown[]) => unknown) | null,
	update: null as ((...args: unknown[]) => unknown) | null,
	initialize: null as ((...args: unknown[]) => unknown) | null,
	switchMode: null as ((...args: unknown[]) => unknown) | null,
	tabsClick: null as ((...args: unknown[]) => unknown) | null,
	loadCommunityReleases: null as ((...args: unknown[]) => unknown) | null,
	displayDonationList: null as ((...args: unknown[]) => unknown) | null,
	parseCommunityReleases: null as ((...args: unknown[]) => unknown) | null,
	windowClosed: null as ((...args: unknown[]) => unknown) | null,
	publish: null as (() => void) | null
};

UpdateLog.initialize = function () {
	initializeUpdateLog();
	this.currentMode = 'internal';
	this.internalItems = [];
	this.communityItems = [];
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
	this.internalItems = items;
	UpdateLog.publish!();
} as (...args: unknown[]) => unknown;

UpdateLog.publish = function () {
	window.dispatchEvent(new CustomEvent('update-log-update'));
};

UpdateLog.windowClosed = function () {
	UpdateLog.internalItems = null;
	UpdateLog.communityItems = null;
	UpdateLog.currentMode = 'internal';
	UpdateLog.publish?.();
};
