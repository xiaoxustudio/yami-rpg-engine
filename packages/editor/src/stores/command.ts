import { defineStore } from 'pinia';
import { EventEditor } from '@app/commands/event-editor.ts';
import { markRaw, reactive } from 'vue';
import { WordList, type WordListShape } from '@ui-kit';
import { pinia } from './pinia';

export interface CommandTargetShape {
	scrollAndResize?: () => void;
	getSelectionPosition?: () => { x: number; y: number } | null;
	save?: (data: { id: string; params: Record<string, unknown> }) => unknown;
}

export interface CommandParseState {
	target: CommandTargetShape | null;
	id: string | null;
	words: WordListShape;
	invalid: boolean;
	saveVars: boolean;
	returnType: string;
	eventName: string;
	eventIndex: number;
	variables: Array<{
		name: string;
		type: string;
		comment: string;
		evIndex: number;
		isLeftValue: boolean;
		refCount: number;
		command?: unknown;
	}>;
	varMap: Record<string, unknown>;
	dependsOn: string[];
	currentCommand: Record<string, unknown> | null;
}

export const useCommandStore = defineStore('command', () => {
	const parse = reactive<CommandParseState>({
		target: null,
		id: null,
		words: markRaw(new WordList()),
		invalid: false,
		saveVars: false,
		returnType: '',
		eventName: '',
		eventIndex: 0,
		variables: [],
		varMap: {},
		dependsOn: ['Inspector'],
		currentCommand: null
	});

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
		parse,
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

export function getCommandStore() {
	return useCommandStore(pinia);
}
