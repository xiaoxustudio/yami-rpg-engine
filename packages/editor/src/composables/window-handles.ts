/**
 * 窗口帧能力句柄（唯一真源在 `@ui-kit` 的 `utils/window-handles`）。
 *
 * editor 侧只做一次转出，保持 `@app/composables/window-handles` 这个 import 路径稳定。
 */
export { clearWindowHandle, getWindowHandle, setWindowHandle, type WindowHandle } from '@ui-kit';
