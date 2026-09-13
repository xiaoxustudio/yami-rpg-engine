/**
 * localEls：批 4 分组元素注册表（由渲染这些控件的 SFC 登记，供本组模块读取替代按 id 查 DOM）。
 * P1b 第 8 刀：同时镜像进 `composableEls`——`ExportLanguage.vue` 的 setForm/getForm 循环按运行时
 * id 取控件，SFC 侧登记的是本表。
 */
import { composableEls } from '@app/composables/element-registry';
import { createElementRegistry } from '@app/utils/element-registry';

export const localEls = createElementRegistry(composableEls);
