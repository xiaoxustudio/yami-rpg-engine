import { reactive } from 'vue';

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

interface EasingWindow {
	form: EasingForm;
}

const clampNumberValue = (value: number, min: number, max: number, decimals: number): number => {
	const clamped = Math.min(Math.max(parseFloat(String(value)) || 0, min), max);
	const factor = Math.pow(10, decimals);
	return Math.round(clamped * factor) / factor;
};

export const clampEasingPointX = (value: number): number => clampNumberValue(value, 0, 1, 2);

export const clampEasingPointY = (value: number): number => clampNumberValue(value, -5, 5, 2);

const createPoints = (): EasingPointForm[] => Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));

const form = reactive<EasingForm>({
	points: createPoints(),
	mode: 2,
	preview: { reverse: true, duration: 400, delay: 400 },
	scale: 1
});

export function useEasingWindow(): EasingWindow {
	return { form };
}
