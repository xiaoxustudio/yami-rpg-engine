/**
 * UI 检查器的 `owner`：**以 store 为唯一真源**的实例。
 *
 * 背景：`inspector/element-*.ts`（11 个页面）与 `inspector.ts` 都要求页面上的 `owner` 满足
 * 同一组契约，而旧的 `owner: UI` 直接指向遗留单例 `@app/ui/ui-window.ts`
 * （现已平移到 `@app/engine/ui/ui-singleton.ts`，见 PHASE-1C 第 66 轮）：
 *
 *   - `ParamHistoryOwner`（`composables/useParamHistory.ts`）：`history` / `setTarget` / `planToSave`
 *   - `Inspector`（`inspector.ts:24,42`）：`setTarget(target, meta?)` —— 比上面多一个可选 `meta`
 *
 * 于是「把 owner 从遗留层搬走」会牵出这三处不同的形状。本模块把它们收在一个对象上，
 * **每个成员都即时读取 store**，不缓存值——这一点很关键：`history` 是随 UI 窗口开关变化的
 * （`ui-file.ts` 在 `load()` 里赋值、`close()` 里置 null），如果在这里捕获一次引用，
 * 关闭后就会指向已经作废的历史栈。
 *
 * 为什么用 `defineProperty` 而不是 `{ get history() { … } }` 简写：与 `ui-window.ts` 既有的
 * store 桥接写法保持一致（那边也用 `Object.defineProperty` 挂 6 个键），便于统一识别。
 */
import { getUIStore } from '@app/stores/ui';

export interface UIOwnerShape {
	history: unknown;
	setTarget(target: unknown, meta?: unknown): void;
	planToSave(): void;
}

export const UIOwner: UIOwnerShape = {
	setTarget: (target: unknown, meta?: unknown) => {
		// `meta` 目前没有消费方：store 的 setTarget 只吃 target，与 legacy `UI.setTarget` 一致。
		// 保留这个形参是为了满足 `inspector.ts` 的 `(target, meta?) => void` 契约。
		void meta;
		getUIStore().setTarget(target as never);
	},
	planToSave: () => {
		getUIStore().planToSave();
	},
	history: undefined
};

// `history` 必须每次读 store（见上文：它会随 UI 窗口开关在 History / null 之间变），
// 因此定义成访问器而不是普通字段。
Object.defineProperty(UIOwner, 'history', {
	get: () => getUIStore().history,
	configurable: true
});
