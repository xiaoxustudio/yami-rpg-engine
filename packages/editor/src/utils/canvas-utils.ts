/**
 * 画布辅助函数（P4d 补遗）。
 *
 * 原先这里是 `CanvasRenderingContext2D.prototype.resize` 这个内建补丁，P4d 按「零调用方」
 * 删除——但它的两个调用方（`GL.context2d.resize(...)`、`Printer.context.resize(...)`）
 * 挂在**宽松类型**的接收者上（`GL` 是 `any`、printer 的上下文带索引签名），
 * 静态检索看不见，于是运行时才炸 `this.context.resize is not a function`。
 *
 * 现在恢复为显式函数，语义与原补丁**逐字相同**：
 * - 两个维度都相同时**仍然**重设 `width`——浏览器借此清空后备缓冲，调用方随后会自己
 *   重设 `font` 等状态（见 `GL.fillTextWithOutline` 先存 `font` 再恢复）；
 * - 否则只改真正变化的那个维度，尽量少触发缓冲重置次数。
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
		// 尽量少的画布缓冲区重置次数
		if (canvas.width !== width) {
			canvas.width = width;
		}
		if (canvas.height !== height) {
			canvas.height = height;
		}
	}
}
