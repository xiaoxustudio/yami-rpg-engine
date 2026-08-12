import { defineStore } from 'pinia';
import { Printer } from '@/printer/printer.ts';
import { shallowRef } from 'vue';

export const usePrinterStore = defineStore('printer', () => {
	const state = shallowRef<string>('closed');

	function syncState() {
		state.value = Printer?.state ?? 'closed';
	}

	function print(content: unknown) {
		Printer?.print?.(content);
	}

	return { state, syncState, print };
});
