import { describe, expect, it } from 'vitest';

import { uiEventsMembers } from '@app/engine/ui/ui-events.ts';
import { getUIStore } from '@app/stores/ui';
import type { UIShape } from '@app/engine/ui/ui-singleton.ts';

/**
 * UI 配色落盘（`UI.saveToConfig`）的**取值口径** —— 本文件对应一次真实崩溃
 * （2026-09-22，用户关闭编辑器时）：
 *
 * ```
 * TypeError: Cannot read properties of undefined (reading 'hex')
 *   at Proxy.saveToConfig (ui-events.ts: saveToConfig)
 *   at saveToConfig (stores/ui.ts)
 *   at saveConfig (services/project/config.ts)
 *   at quit (services/project/close.ts)
 * ```
 *
 * ## 为什么会踩空
 *
 * `saveToConfig` 原来写的是 `config.colors.uiBackground = this.background.hex`，而
 * `this.background` / `this.foreground` 是**遗留单例上的影子副本**，唯一的写入方是
 * `UI.loadFromConfig`（`ui-events.ts`）。可那条路现在**会被静默跳过**：
 *
 *   再也不会预热 `'ui'` 槽位（见 `ui-window-arrival-path.spec.ts` 的不变式 B）；
 * - 于是 `main/initialize.ts` 的 `loadConfig()` 执行时 `'ui'` 槽位还是空的，
 *   `getLazyWindow` 的 get trap 返回 **undefined**，store 里那句
 *   `UI?.loadFromConfig?.(config)`（`stores/ui.ts`）**不报错地什么也没做**；
 * - 这个 `?.` 挡不住——代理对象本身永远不为 null，挡的只是「实例还没到位」这种真实情况。
 *
 * 等到退出时 UI 窗口早已异步到位，`UI.saveToConfig` 正常解析，于是读到 `undefined.hex` 抛错。
 * 更糟的是 `saveConfig`（`services/project/config.ts`）整条被 try/catch 包着 ⇒
 * **异常之后的 animation/particle 配色保存与 config.json 落盘全部不执行**。
 *
 * ## 守的是什么
 *
 * 真源是 store 的 `background` / `foreground`（`drawBackground` 早已读 store，
 * `stores/ui.ts` 的 loadFromConfig 用例也钉过这一点）。所以本文件钉住：
 * **遗留影子副本缺失时也必须以 store 为准落盘，且绝不抛错。**
 */
describe('UI 配色落盘：遗留影子副本缺失时以 store 为准', () => {
	it('saveToConfig 不抛 undefined.hex，并按 store 的颜色写回 config', () => {
		const store = getUIStore();
		try {
			store.loadFromConfig({
				colors: { uiBackground: '1e1e1eff', uiForeground: 'ffffffff' }
			});

			// 运行期实况：`loadConfig()` 早于 UI 窗口异步到位，`UI.loadFromConfig` 被静默跳过
			// ⇒ 遗留单例上**没有** background / foreground。这里按运行期事实构造接收者
			// （类型声明说它一定有，正是这个「类型说谎」让 tsc 全程放行）。
			const legacyWithoutColors = {} as UIShape;
			const config: { colors: Record<string, string> } = { colors: {} };

			expect(
				() => uiEventsMembers.saveToConfig!.call(legacyWithoutColors, config),
				'遗留影子副本缺失时不得抛 Cannot read properties of undefined (reading hex)'
			).not.toThrow();

			expect(config.colors.uiBackground, '应落盘 store 的背景色').toBe('1e1e1eff');
			expect(config.colors.uiForeground, '应落盘 store 的前景色').toBe('ffffffff');
		} finally {
			// 还原成透明兜底，避免影响其它用例
			store.loadFromConfig({
				colors: { uiBackground: '00000000', uiForeground: '000000ff' }
			});
		}
	});

	it('store 副本与遗留副本都在时，以 store 为准（用户改色只写 store）', () => {
		const store = getUIStore();
		try {
			store.loadFromConfig({
				colors: { uiBackground: '112233ff', uiForeground: '445566ff' }
			});

			// 遗留副本故意留旧值：它没有跟随 store 更新，若被采信就会把用户的新配色写回旧值
			const staleLegacy = {
				background: { hex: '00000000' },
				foreground: { hex: '000000ff' }
			} as unknown as UIShape;
			const config: { colors: Record<string, string> } = { colors: {} };

			uiEventsMembers.saveToConfig!.call(staleLegacy, config);

			expect(config.colors.uiBackground, 'store 才是真源').toBe('112233ff');
			expect(config.colors.uiForeground, 'store 才是真源').toBe('445566ff');
		} finally {
			store.loadFromConfig({
				colors: { uiBackground: '00000000', uiForeground: '000000ff' }
			});
		}
	});
});

/**
 *
 * `StageColor` 的入参是 **8 位 RGBA hex**（第 4 位是 alpha）。此前 `safeHex` 只写在 store 侧，
 * 于是同一份 config 在 store 造出 `'1e1e1eff'`（alpha 1），在遗留影子副本上却造出 `'1e1e1e'`
 * （`slice(6,8)` 是空串 ⇒ `alpha = NaN`）——**同一个输入两个答案**，而类型层看不见
 * （契约那时写着 `Record<string, string>`，值根本没被校验过）。
 *
 * 这条用例是**先失败后转绿**的：把 `ui-events.ts` 里那两处 `safeHex(...)` 换成裸值，
 * 第一条断言立刻红在 `expected '1e1e1e' to be '1e1e1eff'`。
 */
describe('UI 配色读取：遗留副本按 safeHex 归一化（与 store 同一份规则）', () => {
	it('6 位 hex 补成不透明，不留 NaN alpha', () => {
		const legacy = {} as UIShape;

		uiEventsMembers.loadFromConfig!.call(legacy, {
			colors: { uiBackground: '1e1e1e', uiForeground: 'ffffffff' }
		});

		expect(legacy.background.hex, '6 位应补成 8 位').toBe('1e1e1eff');
		expect(
			Number.isNaN(legacy.background.alpha),
			`alpha 不能是 NaN（6 位 hex 曾让 slice(6,8) 解析失败），实得 ${legacy.background.alpha}`
		).toBe(false);
		expect(legacy.background.alpha, '6 位应视为完全不透明').toBe(1);
		expect(legacy.foreground.hex, '8 位原样').toBe('ffffffff');
	});

	it('畸形/非字符串值退回 fallback，而不是把 NaN 交给 WebGL', () => {
		const legacy = {} as UIShape;

		uiEventsMembers.loadFromConfig!.call(legacy, {
			colors: { uiBackground: 'not-a-color', uiForeground: 12345 }
		});

		expect(legacy.background.hex, '非 hex 应回退').toBe('00000000');
		expect(legacy.foreground.hex, '非字符串应回退').toBe('000000ff');
		expect(Number.isNaN(legacy.background.alpha)).toBe(false);
		expect(Number.isNaN(legacy.foreground.alpha)).toBe(false);
	});
});
