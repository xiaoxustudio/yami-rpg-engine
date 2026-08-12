import { defineStore } from 'pinia';
import { EventEditor } from '@/command/event-editor.ts';
import { shallowRef } from 'vue';

export const useCommandStore = defineStore('command', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<Record<string, unknown> | null>(null);

	function syncState() {
		state.value = EventEditor?.state ?? 'closed';
		target.value = EventEditor?.target ?? null;
	}

	function initialize() {
		EventEditor?.initialize?.();
	}

	function open(target: string) {
		EventEditor?.open?.(target);
	}

	function close() {
		EventEditor?.close?.();
	}

	function planToSave() {
		EventEditor?.planToSave?.();
	}

	function openLocalEvent(
		inserting: boolean,
		filter: string,
		name: string,
		event: unknown,
		callback: (() => void) | null
	) {
		EventEditor?.openLocalEvent?.(inserting, filter, name, event, callback);
	}

	function openGlobalEvent(guid: string) {
		EventEditor?.openGlobalEvent?.(guid);
	}

	function openRelatedEvents(contexts: unknown[]) {
		EventEditor?.openRelatedEvents?.(contexts);
	}

	function findRelatedEvents(eventId: string) {
		return EventEditor?.findRelatedEvents?.(eventId);
	}

	function getAllLocalEvents() {
		return EventEditor?.getAllLocalEvents?.();
	}

	function clearAllEventClasses(...items: unknown[]) {
		return EventEditor?.clearAllEventClasses?.(...items);
	}

	function clearRelatedEventClasses(...items: unknown[]) {
		return EventEditor?.clearRelatedEventClasses?.(...items);
	}

	function save(item: unknown) {
		EventEditor?.save?.(item);
	}

	function isChanged() {
		return EventEditor?.isChanged?.();
	}

	function getItemById(id: string) {
		return EventEditor?.getItemById?.(id);
	}

	function getItemByEvent(event: unknown) {
		return EventEditor?.getItemByEvent?.(event);
	}

	function openCommandList(item: unknown) {
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

	function getGlobalEventName(id: string) {
		return EventEditor?.getGlobalEventName?.(id);
	}

	function confirm(event?: Event) {
		EventEditor?.confirm?.(event);
	}

	function apply(event?: Event) {
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
