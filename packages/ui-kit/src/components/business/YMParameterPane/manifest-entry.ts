import type { ParamDef } from './param-pane-core';

/**
 * 数据清单里一个条目（`guid → 条目`）—— ui-kit 与宿主（编辑器）之间的**跨包契约**。
 *
 * 第 156 轮：`YMParameterPane` 原先把这个值写成 `Record<string, any>`。收成具名形状，
 * 字段全部来自**该组件自己的读点**（`YMParameterPane.vue` 的 `:349-356`）：
 * `parameters`（传给 `groupParameters`）、`langMap.update().get(key)`、`overview?.deprecated`。
 *
 * ## 形状是**封闭**的（刻意不留索引签名）
 *
 * 宿主侧的值是 `FileMeta = InstanceType<typeof Meta>` —— **类实例**。类实例没有索引签名，
 * 而「带 `[k: string]: unknown` 的目标」会要求源**也有**索引签名（`TS2741` 那条实测规则的
 * 反向：索引签名不满足具名属性；源没有索引签名也不满足带索引签名的目标 —— 本轮实测
 * `ParticleShape` → `Record<string, unknown>` 报的正是这条）。
 * ⇒ 这里只列 ui-kit 真正读到的三个字段，其余成员由结构化类型自然放行。
 *
 * ## 为什么单独一个文件、还要从 barrel 导出
 *
 * 宿主侧对应物是 `editor/src/data/metadata.ts` 的 `Meta`：`parameters: ParamDef[] | null`，
 * 外加 `langMap` / `overview` 两个 `declare` 成员。两边形状必须一致，否则编辑器的
 * `:data-manifest="dataManifest"` 绑定会当场报 TS2322（第 155 轮就是这么撞上的：
 * 当时 `ManifestEntry` 只写在 `.vue` 里，宿主**无法引用**它）。
 * ⇒ 放到独立模块 + 从 `index.ts` 导出，宿主就能用**同一份**类型声明 prop 值。
 */
export interface ManifestEntry {
	parameters: ParamDef[] | null;
	langMap: { update(): { get(key: string | undefined): string } };
	overview?: { deprecated?: string };
}
