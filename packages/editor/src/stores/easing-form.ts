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

/**
 * 缓动编辑器表单（`useEasingWindow().form` 的真源）。
 *
 * 为什么单独一个 store 文件而不是塞进 `stores/easing.ts`：后者要 `import { Easing }`（单例），
 * 而单例 `data/transition-window.ts:398,727,1009,1097,1227,1419` 有 6 处直接读写这份表单
 * ⇒ 塞进 easing store 会形成 `easing store → transition-window → useEasingWindow → easing store`
 * 的循环。这里只依赖 vue + pinia，没有环。
 *
 * 为什么升进 store：原先它是 `composables/useEasingWindow.ts:31` 的模块级 `reactive`，被两个模板
 * （`Easing.vue:103`、`EasingPointsSection.vue:238`）与单例的 6 处直接读 —— 进 store 后可进
 * DevTools，且不再依赖模块导入顺序。用 `reactive` 保留「就地改 `form.points[i].x`」的语义。
 */
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
