import { defineStore } from 'pinia';
import { EventEditor } from '@/command/event-editor.ts';
import { shallowRef } from 'vue';

export const useCommandStore = defineStore('command', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);

	function syncState() {
		state.value = EventEditor?.state ?? 'closed';
		target.value = EventEditor?.target ?? null;
	}

	function initialize() {
		EventEditor?.initialize?.();
	}

	function open(target: any) {
		EventEditor?.open?.(target);
	}

	function close() {
		EventEditor?.close?.();
	}

	function planToSave() {
		EventEditor?.planToSave?.();
	}

	function openLocalEvent(inserting: any, filter: any, name: any, event: any, callback: any) {
		EventEditor?.openLocalEvent?.(inserting, filter, name, event, callback);
	}

	function openGlobalEvent(guid: any) {
		EventEditor?.openGlobalEvent?.(guid);
	}

	function openRelatedEvents(contexts: any) {
		EventEditor?.openRelatedEvents?.(contexts);
	}

	function findRelatedEvents(eventId: any) {
		return EventEditor?.findRelatedEvents?.(eventId);
	}

	function getAllLocalEvents() {
		return EventEditor?.getAllLocalEvents?.();
	}

	function clearAllEventClasses(...items: any[]) {
		return EventEditor?.clearAllEventClasses?.(...items);
	}

	function clearRelatedEventClasses(...items: any[]) {
		return EventEditor?.clearRelatedEventClasses?.(...items);
	}

	function save(item: any) {
		EventEditor?.save?.(item);
	}

	function isChanged() {
		return EventEditor?.isChanged?.();
	}

	function getItemById(id: any) {
		return EventEditor?.getItemById?.(id);
	}

	function getItemByEvent(event: any) {
		return EventEditor?.getItemByEvent?.(event);
	}

	function openCommandList(item: any) {
		EventEditor?.openCommandList?.(item);
	}

	function closeCommandList() {
		EventEditor?.closeCommandList?.();
	}

	function unpackOpenEvents() {
		return EventEditor?.unpackOpenEvents?.();
	}

	function packOpenEvents() {
		return EventEditor?.packOpenEvents?.();
	}

	function getGlobalEventName(id: any) {
		return EventEditor?.getGlobalEventName?.(id);
	}

	function confirm(event?: any) {
		EventEditor?.confirm?.(event);
	}

	function apply(event?: any) {
		EventEditor?.apply?.(event);
	}

	return {
		state,
		target,
		syncState,
		initialize,
		open,
		close,
		planToSave,
		openLocalEvent,
		openGlobalEvent,
		openRelatedEvents,
		findRelatedEvents,
		getAllLocalEvents,
		clearAllEventClasses,
		clearRelatedEventClasses,
		save,
		isChanged,
		getItemById,
		getItemByEvent,
		openCommandList,
		closeCommandList,
		unpackOpenEvents,
		packOpenEvents,
		getGlobalEventName,
		confirm,
		apply
	};
});
