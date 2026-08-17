import { defineStore } from 'pinia';
import { EventEditor } from '@app/legacy/command/event-editor.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const eventEditorStateKeys = ['closing'] as const;

export const useEventEditorStore = defineStore('eventEditor', () => {
	const closing = shallowRef<boolean>(false);

	function syncState() {
		closing.value = EventEditor?.closing ?? false;
	}

	return {
		closing,
		syncState
	};
});

export function getEventEditorStore() {
	return useEventEditorStore(pinia);
}
