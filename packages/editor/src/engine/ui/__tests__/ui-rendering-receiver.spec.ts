import { describe, expect, it, vi } from 'vitest';

/**
 * `UIEngine.renderingFunction` 的**接收者语义** —— 第 111 轮新增。
 *
 * ## 这条用例守的是什么
 *
 * `ui-engine.ts:637` 那段注释记着一笔代价很高的账：「我在这里连错三次」——
 * `renderingFunction` 是被 `Timer` **裸调用**的（`timer.ts:195` 的 `stageRendering(deltaTime)`），
 * 所以它自己的 `this` **恒为 `undefined`**（不是"指向错的对象"，是根本没有）。
 * 它内部那 7 个 `UI.drawXxx!()` 之所以能工作，是因为 `UI.drawXxx` 是**方法调用**
 * ⇒ `this` 绑定到 UI 单例 ⇒ 各实现里的 `this.scaleX` / `this.centerX` 才取得到值。
 *
 * 曾改成 `UIEngine.drawXxx!.call(this)` 并加 `if (!this?.renderingFunction) return` 作保护：
 * 因为 `this` 恒为 `undefined`，那个保护**每帧提前 return**，症状是
 * **「不报错，但整个 UI 画布一片黑」**。
 *
 * 在那之前，这条不变式**只写在注释里** —— 注释不会失败。本文件把它变成会失败的用例。
 *
 * ## 为什么断言写成「接收者非 undefined」而不是「接收者 === 某某对象」
 *
 * 这条不变式要**跨越 ④-2b 的改写而依然有效**：
 *
 * - 现在：`UI.drawXxx!()` —— 接收者是 `getLazyWindow('ui', …)` 返回的**惰加载代理**；
 * - ④-2b 之后（若采用显式接收者）：`UIEngine.drawXxx!.call(UI)` —— 接收者仍是那个代理。
 *
 * 两种形态下接收者都**不是** `import { UI }` 拿到的那个真实单例对象，所以钉死具体对象会把
 * 一次**合法的**改写判成回归。而三次连错的**失败签名**是「接收者为 `undefined` ⇒ 提前 return
 * ⇒ 7 个 draw 一个都没跑」。因此判据取「7 个都跑了，且每个的接收者都不是 undefined」——
 * 恰好是那个症状，不多不少。
 *
 * ## 自证（这一步抓到了本用例自己的一个假绿）
 *
 * 把 `ui-engine.ts` 里那 7 行中的任意一行改成 `UIEngine.drawXxx!.call(this)`，本文件必须红
 * （那一行的接收者变成 `undefined`）。
 *
 * ⚠️ **第一版自证时它是绿的** —— 因为第一版把「裸调用」写成了 `UIEngine.renderingFunction()`，
 * 而那是**属性调用**，`this` 被绑成了 `UIEngine`，`.call(this)` 于是也能蒙过去。
 * 真实的调用约定是 `Timer` 存下函数引用、之后 `stageRendering(deltaTime)` **脱离接收者**调用
 * （`timer.ts:195`），所以必须先 `const render = UIEngine.renderingFunction` 再 `render()`。
 * 修正后自证通过：突变 ⇒ 红在「`drawBackground` 的接收者是 undefined」，还原 ⇒ 绿。
 * ⇒ 教训：**用例不仅要断言对，还要复现真实的调用约定** —— 否则它守的是一种并不存在的调用形态。
 */
const mockGL = vi.hoisted(() => ({ width: 800, height: 600 }));
vi.mock('@app/engine/webgl/webgl-init.ts', () => ({ GL: mockGL }));

import { UIEngine } from '@app/engine/ui/ui-engine.ts';
import { UI } from '@app/engine/ui/ui-singleton.ts';
import { loadWindow } from '@app/tools/window-registry.ts';
import { loadUI } from '@app/stores/ui.ts';

/** `renderingFunction` 里那 7 行，顺序即源码顺序（`ui-engine.ts:656`–`662`）。 */
const DRAW_CALLS = [
	'drawBackground',
	'drawElements',
	'drawCoordinateAxes',
	'drawHoverWireframe',
	'drawTargetWireframe',
	'drawTargetAnchor',
	'drawControlPoints'
] as const;

describe('1c ④ 前置：renderingFunction 的 7 个 draw 必须以 UI 为接收者执行', () => {
	it('裸调用 renderingFunction（this 为 undefined）时，7 个 draw 仍全部执行且接收者非空', async () => {
		// 先让 UI 槽位真的就位：否则惰加载代理的 get 返回 undefined，`UI.x()` 会抛 TypeError，
		// 那样测到的就不是「接收者语义」而是「窗口没加载」了。
		await loadWindow('ui', loadUI);

		const seen: { name: string; receiver: unknown }[] = [];
		const saved = new Map<string, unknown>();
		const engine = UIEngine as Record<string, unknown>;
		const uiObject = UI as unknown as Record<string, unknown>;

		for (const name of DRAW_CALLS) {
			saved.set(name, engine[name]);
			const spy = vi.fn(function (this: unknown) {
				seen.push({ name, receiver: this });
			});
			// 两条查找路径都装上同一个 spy：
			//   · 现形态 `UI.x()` 走的是 UI 上的镜像；
			//   · ④-2b 之后的 `UIEngine.x.call(UI)` 走的是引擎自己的挂载。
			// 只装一边，这条用例就会在改写后变成「证明了另一条路没被走」，而不是不变式。
			engine[name] = spy;
			uiObject[name] = spy;
		}

		try {
			// **必须先把函数取出来再调**：`Timer` 是 `appendUpdater('stageRendering', this.renderingFunction)`
			// 存下函数引用、之后在 `timer.ts:195` 直接 `stageRendering(deltaTime)` 调的，
			// 所以真实的 `this` 是 `undefined`。写成 `UIEngine.renderingFunction()` 会**意外地**
			// 把 `this` 绑成 `UIEngine` —— 那样连 `.call(this)` 那种错写法都能蒙过去，
			// 用例就变成了假绿（本用例的第一版正是这样被骗过去的，靠自证才发现）。
			const render = UIEngine.renderingFunction as () => void;
			expect(
				(UIEngine as Record<string, unknown>).renderingFunction,
				'renderingFunction 必须真的挂在 UIEngine 上（否则下面的取函数会拿到 undefined）'
			).toBe(render);
			render();
		} finally {
			for (const name of DRAW_CALLS) engine[name] = saved.get(name);
		}

		expect(
			seen.map((s) => s.name),
			'7 个 draw 必须全部执行（漏一个就是「提前 return」那类静默失效）'
		).toEqual([...DRAW_CALLS]);

		for (const s of seen) {
			expect(
				s.receiver,
				`${s.name} 的接收者是 undefined ⇒ 实现里的 this.scaleX / this.centerX 取不到值 ⇒ 画布一片黑`
			).toBeDefined();
		}
	});
});
