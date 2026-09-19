import { Window } from '@app/tools/window-object.ts';
import { logEls } from '@app/log/element-registry';
import { on } from '@app/utils/element-utils.ts';
import { Updater } from '@app/services/updater/updater.ts';
import { initializeUpdateLog } from '@app/module/global.ts';
import type { YamiElement } from '@app/types/element-api';

export interface UpdateLogItem {
	title?: string;
	major?: string;
	minor?: string;
}

export const UpdateLog = {
	currentMode: null as string | null,
	internalItems: null as UpdateLogItem[] | null,
	communityItems: null as UpdateLogItem[] | null,
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
	const el = logEls.get('update-log') as YamiElement;
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
