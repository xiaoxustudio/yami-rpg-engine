/**
 * ④-3 的**通用装配入口** —— 阶段 1c 第 ④ 步（2026-09-22 第 169 轮）。
 *
 * ## 它解决什么
 *
 * 每个域（`ui-slots` / `ui-initialize` / `ui-transform` / …）都只**提供**一个成员对象
 * （`uiSlotsMembers` / `uiInitializeMembers` / …），不再自己 `UI.x = …` 地改单例。
 * 装配由 `legacy/ui-window.ts` 在 **UI 诞生处**触发（那里必须**动态** import —— 见该文件
 * `uiWindowReady` 上那段注释：静态引入本模块会连带 `Data`/`Editor` 先于 `UI` 求值、踩 TDZ）。
 *
 * ## 为什么要有这个中间模块（而不是在遗留文件里逐个域写一行）
 *
 * `legacy-ui-lines` 是**零目标**轴，而「一个域一行装配」会让它每个域上升 1（第 168 轮实测：
 * 多一行就报「✗ 上升」，8 个域 = +8）。所以汇总放到**目录外**：遗留文件里永远只有一行，
 * `import('…/ui-members.ts').then((m) => Object.assign(UI, m.uiMembers))`。
 *
 * ## ⚠️ 改这里的写法前，先看台账口径能不能跟上
 *
 * `assignedSlots()` / `legacyOnlyStoreSlots()` 靠**解析装配语法**来知道「哪些槽位有实现」。
 * 这台仪器已经因为写法变化失明过五次（正则字面量 · 模板字面量 · 点号路径 · 注释里的键 · spread），
 * 所以 `ui-slots.mjs` 的 `resolveMemberKeys()` 现在支持**多源 + 传递展开**：
 * `{ ...a, ...b }` 这种汇总写法它是认的。**换形态前先跑 `migration:selftest` 与 `migration:check`。**
 */
import { uiSlotsMembers } from './ui-slots.ts';
import { uiInitializeMembers } from './ui-initialize.ts';
import type { UIShape } from './legacy/ui-window.ts';

/**
 * 全部域提供的 UI 单例成员。新增一个域时**只在这里加一条 spread**，其余地方不动。
 *
 * 注意：这里用 spread 汇总，不再逐个 `Object.assign` —— 台账口径已支持传递解析（见文件头），
 * 而 `ui-window.ts` 那边由此保持**一行**（`legacy-ui-lines` 是零目标轴）。
 */
export const uiMembers = {
	// 预制体域（第 167 轮）
	...uiSlotsMembers,
	// DOM 引用与定时器初始化域（第 170 轮）
	...uiInitializeMembers
};

/** 装配入口：`ui-window.ts` 在 UI 诞生处调用它（动态 import 之后）。 */
export function attachUiMembers(target: UIShape): void {
	Object.assign(target, uiMembers);
}
