import { Data } from '@app/legacy/data/data-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Updater } from './updater.ts';

function updateLocalEvents(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const listMap = Updater.hooks.getLocalEvents();
		for (const [guid, events] of Object.entries<any>(listMap)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			for (const event of events) {
				const { commands } = event;
				delete event.commands;
				event.enabled = true;
				event.commands = commands;
			}
			File.planToSave!(meta, guid);
		}
	}
}

function updateGlobalEvents(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const events = Data.events;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileEvent', 'global'));
		for (const [guid, sEvent] of Object.entries<any>(events)) {
			const meta = Data.manifest.guidMap[guid];
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
			events[guid] = dEvent;
			File.planToSave!(meta);
		}
	}
}

function updateGlobalEvent(meta: unknown) {
	const metaObj = meta as { guid: string };
	const guid = metaObj.guid;
	const sEvent = Data.events[guid];
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
	Data.events[guid] = dEvent;
	File.planToSave!(metaObj);
}

export function initUpdaterEvents(): void {
	Updater.updateLocalEvents = updateLocalEvents;
	Updater.updateGlobalEvents = updateGlobalEvents;
	Updater.updateGlobalEvent = updateGlobalEvent;
}
