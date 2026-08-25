import { getDataStore } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

function updateLocalEvents(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const listMap = Updater.hooks.getLocalEvents();
		const { manifest } = getDataStore().data;
		// oxlint-disable-next-line no-explicit-any
		for (const [guid, events] of Object.entries<any>(listMap)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			for (const event of events) {
				const { commands } = event;
				delete event.commands;
				event.enabled = true;
				event.commands = commands;
			}
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
}

function updateGlobalEvents(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const { manifest, events } = getDataStore().data;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileEvent', 'global'));
		// oxlint-disable-next-line no-explicit-any
		for (const [guid, sEvent] of Object.entries<any>(events!)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dEvent = Updater.hooks.createInspectorSchema('fileEvent', 'global');
			for (const key of keys) {
				if (key in sEvent) {
					dEvent[key] = sEvent[key];
					continue;
				}
				switch (key) {
					case 'namespace':
						dEvent[key] = false;
						continue;
				}
			}
			events![guid] = dEvent;
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
}

function updateGlobalEvent(meta: unknown) {
	const metaObj = meta as { guid: string };
	const guid = metaObj.guid;
	const events = getDataStore().data.events;
	const sEvent = events![guid];
	if ('namespace' in sEvent || 'priority' in sEvent) return;
	const dEvent = Updater.hooks.createInspectorSchema('fileEvent', 'global');
	for (const key of Object.keys(dEvent)) {
		if (key in sEvent) {
			dEvent[key] = sEvent[key];
			continue;
		}
		switch (key) {
			case 'namespace':
				dEvent[key] = false;
				continue;
		}
	}
	events![guid] = dEvent;
	append(getDataStore().data.manifest!.changes as unknown[], metaObj);
}

export function initUpdaterEvents(): void {
	Updater.updateLocalEvents = updateLocalEvents;
	Updater.updateGlobalEvents = updateGlobalEvents;
	Updater.updateGlobalEvent = updateGlobalEvent;
}
