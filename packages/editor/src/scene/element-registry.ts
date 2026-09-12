/**
 * sceneEls：批 4 分组元素注册表。
 * 由渲染这些控件的 SFC 登记（模板 :ref 或 onMounted 里的 registerElement），
 * 供本组模块读取以替代 $('#id') 查 DOM。
 */
import { createElementRegistry } from '@app/utils/element-registry';

export const sceneEls = createElementRegistry();
