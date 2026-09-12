/**
 * inspector 族的元素注册表（P5b 批次 3）。
 *
 * inspector 的 37 个页面模块（`src/inspector/*-page.ts`）过去用 `$('#<prefix>-<field>')`
 * 直接查 DOM；这些控件由 LayoutPanel.vue 与各 `components/inspector/*Page.vue` 渲染
 * （经实测：123 个 id 各有**唯一**渲染者，无歧义）。现在改为：
 *  - 渲染方用 `:ref="registryRef(inspectorEls, id)"`（无既有 ref 时）或
 *    在 onMounted 里 `registerElement(inspectorEls, id, <已有 ref>.value)`（已有具名 ref 时）登记；
 *  - 页面模块读 `inspectorEls.get(id)`。
 *
 * radio 组（`uiButton-horizontalAlign` 等 4 个）不走本注册表：`$('#<组名>')` 命中的是
 * RadioProxy 生成的代理 div，应直接用 ui-kit 的 `radioProxyMap`。
 */
import { createElementRegistry } from '@app/utils/element-registry';

export const inspectorEls = createElementRegistry();
