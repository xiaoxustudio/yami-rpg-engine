import { defineStore } from 'pinia';
import { Printer } from '@app/legacy/printer/printer.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const usePrinterStore = defineStore('printer', () => {
	const state = shallowRef<string>('closed');

	function print(content: unknown) {
		Printer?.print?.(content);
	}

	return { state, print };
});

export function getPrinterStore() {
	return usePrinterStore(pinia);
}
