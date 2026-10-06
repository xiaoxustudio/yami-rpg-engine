import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

/**
 * 取色器（`tools/color-picker-window.ts` 的 `Color`）窗口状态。
 *
 * 原先这 4 个字段属于 `Color = {} as ColorSlots` 的「延迟绑定槽」：`initialize()` 时写
 * `indexEnabled`（:91），拖拽时写 `paletteX/paletteY/pillarY`（:183/:184/:192），绘制时读回
 * （:197 `Math.round(this.paletteX)` …）。在此之前读到的是 `undefined`，现在按字段类型给
 * `0` / `false` 作为初值（对 `if (…)` 与 `Math.round(…)` 两条既有用法都安全）。
 *
 * 桥接循环装在单例模块里（同其它域）；这里**不**导出第二份白名单，避免与单例侧数组漂移。
 */
export const useColorStore = defineStore('color', () => {
	const paletteX = shallowRef<number>(0);
	const paletteY = shallowRef<number>(0);
	const pillarY = shallowRef<number>(0);
	const indexEnabled = shallowRef<boolean>(false);

	return { paletteX, paletteY, pillarY, indexEnabled };
});

export function getColorStore() {
	return useColorStore(pinia);
}
