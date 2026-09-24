/**
 * 宿主（编辑器）挂在 `window` 上的全局声明 —— 第 149 轮新增。
 *
 * `YMTitleBar.vue` 的 `getWindow()` 读 `window.Window`：那是宿主在
 * `editor/src/tools/window-object.ts` 里挂上去的窗口 API（`Reflect.set(window, 'Window', …)`）。
 * 此前没有声明，`window.Window` 静态上被解析成全局 **`Window` 构造器**
 * （`{ new(): Window; prototype: Window }`），读点只能写
 * `window as unknown as Window & { Window?: { close(id?: string): void } }`。
 *
 * ## 为什么是「被 `index.ts` import 的 `.ts` 模块」而不是一个独立 `.d.ts`
 *
 * 全局增强要生效，声明所在文件必须**进入当期程序**。本仓有三个程序会编译到这个组件：
 *   1. ui-kit 自己的 `tsconfig.json` / `tsconfig.build.json`（`pnpm -F @yami/ui-kit run build:types`）；
 *   2. 编辑器侧的 `typecheck:vue`（用自己的 tsconfig，只按**模块图 + 自己的 glob** 收文件）；
 *   3. oxlint 的类型感知规则。
 * 实测：放在 `src/types/` 下的独立 `.d.ts`，程序 2 看不见（TS2551）；放在 `.vue` 文件里的
 * `declare global`，程序 2 能看见、程序 3 看不见（同样 TS2551）。⇒ 放在**被 `index.ts` import
 * 的模块**里：桶文件是编辑器必然引用到的入口，三个程序就都能看到。
 *
 * 声明成**可选**是如实描述：宿主没挂载时它确实是 `undefined`（因此 `getWindow()` 的返回类型
 * 也是可选的），并且让 `delete window.Window` 合法。
 *
 * ⚠️ 读点还要一行**窄化赋值**（`const host: Window = window;`）：`window` 的静态类型是
 * `Window & typeof globalThis`，而 `typeof globalThis` 上那个**同名构造器**会把本成员相交掉
 * （直接读/写/删分别报 TS2741 / TS2322 / TS2790，均实测过）。
 */
declare global {
	interface Window {
		/** 窗口 API（宿主挂载）：ui-kit 只用到 `close`（见 `YMTitleBar.vue` 的 `getWindow`） */
		Window?: { close(id?: string): void };
	}
}

export {};
