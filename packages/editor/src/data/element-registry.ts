/**
 * dataEls：分组元素注册表（由渲染这些控件的 SFC 登记，供本组模块读取替代按 id 查 DOM）。
 */
import { createElementRegistry } from '@app/utils/element-registry';

export const dataEls = createElementRegistry();
