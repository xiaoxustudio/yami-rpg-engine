Object.assign(CSS, {
	encodeURL: (function IIFE() {
		const regexp = /([()])/g;
		return function (string: string) {
			return `url(${encodeURI(string).replace(regexp, '\\$1')})`;
		};
	})(),
	rasterize(csspx: number) {
		const dpr = window.devicePixelRatio;
		return Math.round(csspx * dpr) / dpr;
	},
	getDevicePixelContentBoxSize(element: HTMLElement) {
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
});
