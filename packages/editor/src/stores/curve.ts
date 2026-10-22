import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import type { CurveFrame, CurveState } from '@app/composables/useCurveWindow';

export const useCurveStore = defineStore('curve', () => {
	const state = shallowRef<CurveState>('closed');
	const target = shallowRef<CurveFrame | null>(null);
	const index = shallowRef<string | null>(null);

	return { state, target, index };
});

export function getCurveStore() {
	return useCurveStore(pinia);
}
