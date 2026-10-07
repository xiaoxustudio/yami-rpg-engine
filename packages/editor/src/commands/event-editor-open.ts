import { EventEditor } from './event-editor.ts';
import type {
	EventEditorEventShape,
	EventEditorShape,
	EventListItem,
	EventRelatedContext
} from './event-editor.ts';
import { Window } from '@app/tools/window-object.ts';
import { getFocus, read } from '@app/utils/element-utils.ts';
import { setTreeItemClass } from '@ui-kit';
import { TreeList } from '@app/components/tree-list.ts';
import { Data } from '@app/data/data-object.ts';

EventEditor.openLocalEvent = function (
	this: EventEditorShape,
	inserting: boolean,
	filter: string,
	name: string,
	event: EventEditorEventShape,
	callback: (() => void) | null
) {
	this.initialize!();
	this.unpackOpenEvents!();
	Window.open!('event');
	window.addEventListener('keydown', this.windowKeydown!);

	const list = this.list;
	const item = list.createLocalEventItem!(inserting, filter, name, event, callback);
	list.addNodeTo!(item, null);
	list.update!();
	list.select!(item);
	list.restoreScroll!();
	list.scrollToSelection!('middle');

	getFocus(list);
	return item;
};

EventEditor.openGlobalEvent = function (this: EventEditorShape, guid: string) {
	this.initialize!();
	if (!Window.isWindowOpen!('event')) {
		this.unpackOpenEvents!();
		Window.open!('event');
		window.addEventListener('keydown', this.windowKeydown!);
	} else if (read(this.list)?.id === guid) {
		return;
	}

	const list = this.list;
	const item = this.getItemById!(guid);
	if (item) {
		list.initialize!();
		list.select!(item);
		list.expandToSelection!(false);
		list.update!();
		list.restoreScroll!();
		this.openCommandList!(item);
	} else {
		const item = list.createGlobalEventItem!(guid);
		list.addNodeTo!(item, null);
		list.update!();
		list.select!(item);
		list.restoreScroll!();
		this.openCommandList!(item);
	}
	list.scrollToSelection!('middle');

	getFocus(list);
};

EventEditor.openRelatedEvents = function (this: EventEditorShape, contexts: EventRelatedContext[]) {
	const list = this.list;
	const items: EventListItem[] = [];
	this.clearRelatedEventClasses!(...(this.data ?? []));
	for (const context of contexts) {
		let item;
		if (context.filter === 'global') {
			const { id } = context;
			item = this.getItemById!(id);
			if (!item) {
				item = list.createGlobalEventItem!(id!);
				TreeList.createParents!([item], null);
				this.data!.push(item);
			}
		} else {
			const { filter, name, event } = context;
			item = this.getItemByEvent!(event);
			if (!item) {
				item = list.createLocalEventItem!(false, filter, name!, event!, null);
				TreeList.createParents!([item], null);
				this.data!.push(item);
			}
		}
		items.push(item);
	}
	if (items.length !== 0) {
		list.update!();
		let index = Infinity;
		for (const item of items) {
			setTreeItemClass(item, 'related-event', true);
			index = Math.min(index, this.data!.indexOf(item));
		}
		list.unselect!();
		list.selectIndex!(index);
		list.scrollToSelection!('middle');
	}
};

EventEditor.findRelatedEvents = function (this: EventEditorShape, eventId: string) {
	const guidMap = Data.manifest.guidMap;
	const references: EventRelatedContext[] = [];
	const find = (event: EventEditorEventShape) => {
		for (const command of event.commands) {
			switch (command.id) {
				case 'callEvent':
				case '!callEvent':
					if (command.params.type === 'global' && command.params.eventId === eventId) {
						return true;
					}
					break;
			}
		}
		return false;
	};
	// oxlint-disable-next-line no-explicit-any
	for (const [id, event] of Object.entries<any>(Data.events)) {
		if (find(event)) {
			references.push({
				filter: 'global',
				id: id
			});
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, actor] of Object.entries<any>(Data.actors)) {
		for (const event of actor.events) {
			if (find(event)) {
				references.push({
					filter: 'actor',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, skill] of Object.entries<any>(Data.skills)) {
		for (const event of skill.events) {
			if (find(event)) {
				references.push({
					filter: 'skill',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, trigger] of Object.entries<any>(Data.triggers)) {
		for (const event of trigger.events) {
			if (find(event)) {
				references.push({
					filter: 'trigger',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, item] of Object.entries<any>(Data.items)) {
		for (const event of item.events) {
			if (find(event)) {
				references.push({
					filter: 'item',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, equipment] of Object.entries<any>(Data.equipments)) {
		for (const event of equipment.events) {
			if (find(event)) {
				references.push({
					filter: 'equipment',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, state] of Object.entries<any>(Data.states)) {
		for (const event of state.events) {
			if (find(event)) {
				references.push({
					filter: 'state',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const preset of Object.values<any>(Data.scenePresets)) {
		for (const event of preset.data.events) {
			if (find(event)) {
				const rootName = guidMap[preset.sceneId]?.file.basename;
				references.push({
					filter: preset.data.class,
					name: `${rootName}.${preset.data.name}`,
					event: event
				});
			}
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const preset of Object.values<any>(Data.uiPresets)) {
		for (const event of preset.data.events) {
			if (find(event)) {
				const rootName = guidMap[preset.uiId]?.file.basename;
				references.push({
					filter: 'element',
					name: `${rootName}.${preset.data.name}`,
					event: event
				});
			}
		}
	}
	this.openRelatedEvents!(references);
};

EventEditor.getAllLocalEvents = function (this: EventEditorShape) {
	const listMap = {} as Record<string, unknown[]>;
	// oxlint-disable-next-line no-explicit-any
	for (const [id, actor] of Object.entries<any>(Data.actors)) {
		if (actor.events.length !== 0) {
			listMap[id] = actor.events;
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, skill] of Object.entries<any>(Data.skills)) {
		if (skill.events.length !== 0) {
			listMap[id] = skill.events;
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, trigger] of Object.entries<any>(Data.triggers)) {
		if (trigger.events.length !== 0) {
			listMap[id] = trigger.events;
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, item] of Object.entries<any>(Data.items)) {
		if (item.events.length !== 0) {
			listMap[id] = item.events;
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, equipment] of Object.entries<any>(Data.equipments)) {
		if (equipment.events.length !== 0) {
			listMap[id] = equipment.events;
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, state] of Object.entries<any>(Data.states)) {
		if (state.events.length !== 0) {
			listMap[id] = state.events;
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const [id, scene] of Object.entries<any>(Data.scenes)) {
		if (scene.events.length !== 0) {
			listMap[id] = scene.events.slice();
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const { sceneId, data } of Object.values<any>(Data.scenePresets)) {
		if (data.events.length !== 0) {
			(listMap[sceneId] ??= []).push(...data.events);
		}
	}
	// oxlint-disable-next-line no-explicit-any
	for (const { uiId, data } of Object.values<any>(Data.uiPresets)) {
		if (data.events.length !== 0) {
			(listMap[uiId] ??= []).push(...data.events);
		}
	}
	return listMap;
};
