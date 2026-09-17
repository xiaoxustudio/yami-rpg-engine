/**
 * P4d：本文件过去用 `Object.assign(CSS, { … })` 给**宿主对象** `CSS` 打补丁
 * （`global.d.ts` 里还有 `declare namespace CSS` 配套声明）。
 * 现在改为普通命名导出——调用点显式 import，不再污染 `window.CSS`。
 *
 * `rasterize` 与 `@ui-kit` 的实现逐字相同，这里直接再导出，避免两份实现漂移。
 */
export { rasterize } from '@ui-kit';

export const encodeURL = (function IIFE() {
	const regexp = /([()])/g;
	return function (string: string): string {
		return `url(${encodeURI(string).replace(regexp, '\\$1')})`;
	};
})();

export function getDevicePixelContentBoxSize(element: HTMLElement): {
	width: number;
	height: number;
} {
	const rect = element.getBoundingClientRect();
	const dpr = window.devicePixelRatio;
	const left = Math.round(rect.left * dpr + 1e-5);
	const right = Math.round(rect.right * dpr + 1e-5);
	const top = Math.round(rect.top * dpr + 1e-5);
	const bottom = Math.round(rect.bottom * dpr + 1e-5);
	const width = right - left;
	const height = bottom - top;
	return { width, height };
}
