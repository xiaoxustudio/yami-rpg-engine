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
