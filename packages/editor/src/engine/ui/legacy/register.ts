/**
 * 单例域模块的副作用 import 清单（**顺序有意义**：见下）。
 *
 * ⚠️ 阶段 1c ③（2026-09-21 第 96–97 轮）已把 7 个域模块搬出 `legacy/`，只剩本清单还留在这里
 * —— 它的职责是「按固定顺序加载域模块」，与模块本身是不是遗留代码无关。
 * 等 ④ 退役 `ui-window.ts` 的对象字面量时，这个文件连同一层接线一起收掉。
 *
 * 顺序：`ui-initialize` 先建 DOM 引用与定时器；`ui-file` 挂文档生命周期；
 * 其余域模块只做赋值，彼此不依赖加载顺序。
 */
import '../ui-initialize.ts';
import '../ui-file.ts';
import '../ui-transform.ts';
import '../ui-prefab.ts';
import '../ui-events.ts';
import '../ui-pointer.ts';
import '../ui-list.ts';
