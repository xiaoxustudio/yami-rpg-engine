import { defineStore } from 'pinia';
import { nextTick, shallowRef } from 'vue';
import { Window } from '@/tools/window-object.ts';
import { pinia } from './pinia';

export const useConfirmationStore = defineStore('confirmation', () => {
	const open = shallowRef<boolean>(false);
	const message = shallowRef<string>('');
	const items = shallowRef<Array<{ label?: string; click?: () => void }>>([]);
	const closeCallback = shallowRef<(() => void) | null>(null);

	function confirm(
		options: { message?: string; close?: () => void },
		itemsValue: Array<{ label?: string; click?: () => void }>
	) {
		message.value = options.message ?? '';
		items.value = itemsValue;
		closeCallback.value = options.close ?? null;
		open.value = true;
		nextTick(() => {
			Window?.open?.('confirmation');
		});
	}

	function clear() {
		open.value = false;
		message.value = '';
		items.value = [];
		const callback = closeCallback.value;
		closeCallback.value = null;
		callback?.();
	}

	function confirmButton(index: number) {
		const item = items.value[index];
		Window?.close?.('confirmation');
		item?.click?.();
	}

	return {
		open,
		message,
		items,
		closeCallback,
		confirm,
		clear,
		confirmButton
	};
});

export function getConfirmationStore() {
	return useConfirmationStore(pinia);
}
