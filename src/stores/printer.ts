import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const usePrinterStore = defineStore('printer', () => {
	const state = shallowRef<string>('closed');

	function syncState() {
		state.value = (window as any).Printer?.state ?? 'closed';
	}

	function print(content: any) {
		(window as any).Printer?.print?.(content);
	}

	return { state, syncState, print };
});
