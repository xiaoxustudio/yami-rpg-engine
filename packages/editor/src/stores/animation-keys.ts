/**
 * Animation 窗口「store 为源」的键表 —— **唯一一份**。
 *
 * 为什么单独放一个叶子模块：这份键表原先在两处各写一遍 ——
 * `stores/animation.ts` 的导出白名单，与 `animation/animation-window.ts` 的
 * `animationBridgeKeys`（桥接循环迭代的那份）。两份曾经漂移过：导出那份少写了 5 个
 * 已桥接键（showMark / showOnionskin / mirror / loop / playing）。
 *
 * 而单例侧**不能**直接 import store 的那份导出：桥接循环在**模块求值期**读数组，
 * 而 store 又要 import 单例（门面 `Animation?.xxx?.()`）⇒ 两边互相 import 会踩 TDZ。
 * 把键表放进一个不 import 任何东西的叶子模块，两侧各自 import 它，既消除重复又无环。
 *
 * 顺序即桥接与测试的既有顺序；改动请同步
 * `stores/__tests__/animation-state-keys.spec.ts` 里写死的期望键集。
 */
export const ANIMATION_STATE_KEYS = [
	'state',
	'target',
	'motion',
	'direction',
	'mode',
	'speed',
	'zoom',
	'showMark',
	'showOnionskin',
	'mirror',
	'loop',
	'playing'
] as const;
