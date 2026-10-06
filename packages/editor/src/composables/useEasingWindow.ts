import { getEasingFormStore } from '@app/stores/easing-form';
import type { EasingForm, EasingPointForm } from '@app/stores/easing-form';

// 类型定义已移到 `stores/easing-form.ts`（那里的状态就是真源），这里原样转出，调用方 import 不变。
export type { EasingForm, EasingPointForm };

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

/**
 * 缓动编辑器表单。
 *
 * 表单本身已升进 `stores/easing-form.ts`；
 * 这个 composable 现在只是「取 store 里那个 form 对象」的门面 —— 返回的仍是**同一个 reactive
 * 对象**，所以 `Easing.vue:103`、`EasingPointsSection.vue:238` 与单例的 6 处就地改值全部照旧，
 * 而这些改动从今往后直接反映在 store/DevTools 上。
 */
export function useEasingWindow(): EasingWindow {
	return { form: getEasingFormStore().form };
}
