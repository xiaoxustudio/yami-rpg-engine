import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { pinia } from './pinia';

export interface EasingPointForm {
	x: number;
	y: number;
}

export interface EasingForm {
	points: EasingPointForm[];
	mode: number;
	preview: { reverse: boolean; duration: number; delay: number };
	scale: number;
}

const createPoints = (): EasingPointForm[] => Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));

export const useEasingFormStore = defineStore('easingForm', () => {
	const form = reactive<EasingForm>({
		points: createPoints(),
		mode: 2,
		preview: { reverse: true, duration: 400, delay: 400 },
		scale: 1
	});

	return { form };
});

export function getEasingFormStore() {
	return useEasingFormStore(pinia);
}
