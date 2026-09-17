/// <reference types="vite/client" />

// 全局类型增强声明（**已收口，2026-09-17**）。
//
// 本文件曾经是"把本仓库在内置对象 / 宿主对象 / DOM 接口上打的补丁"的集中声明处：
//   1. `interface HTMLElement`×2 / `Element` / `ParentNode` / `ChildNode` / `Event`×2 /
//      `Window` / `TextBox` / `PointerEvent` / `KeyboardEvent` / `HTMLButtonElement` /
//      `HTMLInputElement`——元素与事件的成员面；**P4c 已整批退役**，改为显式契约
//      `@app/types/element-api`（`YamiElementApi`）与 `@app/types/editor-event`（载荷类型）。
//   2. `Math` / `Array` / `ArrayConstructor` / `String` / `Number` / `Object` / `RegExp` /
//      `Function` / `CSS` / `CanvasRenderingContext2D` / `TimerStatic` / `PlatformPath`——
//      内置/宿主对象的静态与原型扩展；**P4d 已整批退役**，实现改为普通命名导出
//      （`utils/math.ts`、`utils/array.ts`、`utils/object.ts`、`utils/css.ts`…），
//      调用点显式 `import`。
//
// 现在本文件**只剩**「未提供类型的第三方依赖」的 ambient 声明。新增任何 `interface` 增强前，
// 请先确认它无法用命名导出表达——`scripts/global-types-audit.mjs` 会报 `interface` 块数
// （当前 **0**）；P4c / P4d 的完整历史与理由见《迁移收尾清单》《主迁移规划》
// （`docs/` 已于 2026-09-17 按收尾流程移除，历史见 git：`docs(phase15)` 提交）。

declare module 'xml2js';
declare module 'koa';
declare module 'mime-types';
declare module 'qrcode';
declare module 'yauzl';
declare module 'markdown-it';
