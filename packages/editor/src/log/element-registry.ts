/**
 * logEls：分组元素注册表（渲染方登记，模块读取以替代按 id 查 DOM）。
 */
import { createElementRegistry } from '@app/utils/element-registry';

export const logEls = createElementRegistry();
