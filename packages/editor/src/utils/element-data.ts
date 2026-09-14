/**
 * 元素数据模块的**再导出**（实现已迁到 ui-kit，见 `packages/ui-kit/src/utils/element-data.ts`）。
 *
 * 保留本文件的原因：
 * ① `@app/utils/element-data` 这个路径被 editor 侧多处使用（`animation-list`、`animation-events`、
 *    `event-editor-initialize`），路径不变则调用点零改动；
 * ② `main.ts` 以**副作用**方式导入本文件来安装原型访问器——再导出同样会求值 ui-kit 的实现，
 *    因此"导入即安装"的行为不变。
 */
export { getElementData } from '@ui-kit';
