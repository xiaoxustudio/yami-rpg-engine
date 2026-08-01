import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useCommandStore = defineStore('command', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);

	function syncState() {
		const EventEditor = (window as any).EventEditor;
		state.value = EventEditor?.state ?? 'closed';
		target.value = EventEditor?.target ?? null;
	}

	function initialize() {
		(window as any).EventEditor?.initialize?.();
	}

	function open(target: any) {
		(window as any).EventEditor?.open?.(target);
	}

	function close() {
		(window as any).EventEditor?.close?.();
	}

	function planToSave() {
		(window as any).EventEditor?.planToSave?.();
	}

	function openLocalEvent(inserting: any, filter: any, name: any, event: any, callback: any) {
		(window as any).EventEditor?.openLocalEvent?.(inserting, filter, name, event, callback);
	}

	function openGlobalEvent(guid: any) {
		(window as any).EventEditor?.openGlobalEvent?.(guid);
	}

	function openRelatedEvents(contexts: any) {
		(window as any).EventEditor?.openRelatedEvents?.(contexts);
	}

	function findRelatedEvents(eventId: any) {
		return (window as any).EventEditor?.findRelatedEvents?.(eventId);
	}

	function getAllLocalEvents() {
		return (window as any).EventEditor?.getAllLocalEvents?.();
	}

	function clearAllEventClasses(...items: any[]) {
		return (window as any).EventEditor?.clearAllEventClasses?.(...items);
	}

	function clearRelatedEventClasses(...items: any[]) {
		return (window as any).EventEditor?.clearRelatedEventClasses?.(...items);
	}

	function save(item: any) {
		(window as any).EventEditor?.save?.(item);
	}

	function isChanged() {
		return (window as any).EventEditor?.isChanged?.();
	}

	function getItemById(id: any) {
		return (window as any).EventEditor?.getItemById?.(id);
	}

	function getItemByEvent(event: any) {
		return (window as any).EventEditor?.getItemByEvent?.(event);
	}

	function openCommandList(item: any) {
		(window as any).EventEditor?.openCommandList?.(item);
	}

	function closeCommandList() {
		(window as any).EventEditor?.closeCommandList?.();
	}

	function unpackOpenEvents() {
		return (window as any).EventEditor?.unpackOpenEvents?.();
	}

	function packOpenEvents() {
		return (window as any).EventEditor?.packOpenEvents?.();
	}

	function getGlobalEventName(id: any) {
		return (window as any).EventEditor?.getGlobalEventName?.(id);
	}

	function confirm(event?: any) {
		(window as any).EventEditor?.confirm?.(event);
	}

	function apply(event?: any) {
		(window as any).EventEditor?.apply?.(event);
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
