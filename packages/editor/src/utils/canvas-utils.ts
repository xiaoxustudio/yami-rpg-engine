/**
 * 画布辅助函数。
 *
 * 两个维度都相同时仍然重设 `width`（浏览器借此清空后备缓冲）；否则只改真正变化的维度。
 */
export function resizeCanvasContext(
	context: CanvasRenderingContext2D,
	width: number,
	height: number
): void {
	const canvas = context.canvas;
	if (canvas.width === width && canvas.height === height) {
		canvas.width = width;
	} else {
		if (canvas.width !== width) {
			canvas.width = width;
		}
		if (canvas.height !== height) {
			canvas.height = height;
		}
	}
}
