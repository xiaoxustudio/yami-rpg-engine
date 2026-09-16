/**
 * 元素数据模块的**再导出**（实现已迁到 ui-kit，见 `packages/ui-kit/src/utils/element-data.ts`）。
 *
 * 保留本文件的原因：
 * ① `@app/utils/element-data` 这个路径被 editor 侧多处使用（`animation-list`、`animation-events`、
 *    `event-editor-initialize`），路径不变则调用点零改动；
 * ② editor 内两种导入写法都要能用——既有调用点走 ui-kit 门面（`import { elementDataOf } from '@ui-kit'`），
 *    也有文件走本路径，因此这里与实现**逐项对齐**（P4b 迁移期新增 `elementDataOf` 等）。
 *
 * 注：原型访问器退役后（P4b 终态）本文件不再有"导入即安装"的副作用意义，只剩路径兼容。
 */
export { getElementData, elementDataOf, isApiAttached, markApiAttached } from '@ui-kit';
