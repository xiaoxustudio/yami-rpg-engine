// 宿主全局声明（`window.Window`）：必须**被 import** 才进程序，见该文件头部说明。
import './types/host-globals';

export { default as YMButton } from './components/basic/YMButton/YMButton.vue';
export { default as YMCheckBox } from './components/basic/YMCheckBox/YMCheckBox.vue';
export { default as YMSwitchItem } from './components/basic/YMSwitchItem/YMSwitchItem.vue';
export { default as YMEmptyState } from './components/basic/YMEmptyState/YMEmptyState.vue';
export { default as YMLoadingOverlay } from './components/basic/YMLoadingOverlay/YMLoadingOverlay.vue';
export { default as YMDetailBox } from './components/basic/YMDetailBox/YMDetailBox.vue';
export { default as YMDetailSummary } from './components/basic/YMDetailSummary/YMDetailSummary.vue';
export { default as YMSliderBox } from './components/basic/YMSliderBox/YMSliderBox.vue';
export { default as YMRadioBox } from './components/basic/YMRadioBox/YMRadioBox.vue';
export { default as YMToastManager } from './components/basic/YMToastManager/YMToastManager.vue';
export { default as YMPageManager } from './components/basic/YMPageManager/YMPageManager.vue';
export { default as YMNavBar } from './components/basic/YMNavBar/YMNavBar.vue';
export { default as YMFilterBox } from './components/basic/YMFilterBox/YMFilterBox.vue';
export { default as YMKeyboardBox } from './components/basic/YMKeyboardBox/YMKeyboardBox.vue';
export { default as YMGamepadBox } from './components/basic/YMGamepadBox/YMGamepadBox.vue';
export { default as YMTextBox } from './components/basic/YMTextBox/YMTextBox.vue';
export { default as YMNumberBox } from './components/basic/YMNumberBox/YMNumberBox.vue';
export { default as YMTextArea } from './components/basic/YMTextArea/YMTextArea.vue';
export { default as YMCommonList } from './components/basic/YMCommonList/YMCommonList.vue';
export { default as YMScrollBar } from './components/basic/YMScrollBar/YMScrollBar.vue';
export { default as YMSelectBox } from './components/basic/YMSelectBox/YMSelectBox.vue';
export { default as YMColorBox } from './components/basic/YMColorBox/YMColorBox.vue';
export { default as YMNumberVar } from './components/basic/YMNumberVar/YMNumberVar.vue';
export { default as YMStringVar } from './components/basic/YMStringVar/YMStringVar.vue';
export { default as YMTextAreaVar } from './components/basic/YMTextAreaVar/YMTextAreaVar.vue';
export { default as YMSelectVar } from './components/basic/YMSelectVar/YMSelectVar.vue';
export { default as YMFileVar } from './components/basic/YMFileVar/YMFileVar.vue';
export { default as YMMenuList } from './components/basic/YMMenuList/YMMenuList.vue';
export {
	createMenuApi,
	createMenuListElement,
	type MenuApi,
	type MenuItem,
	type MenuOptions
} from './components/basic/YMMenuList/menu-api';
export { default as YMTreeList } from './components/basic/YMTreeList/YMTreeList.vue';
export {
	createTreeListApi,
	createTreeListElement,
	treeListPrototype,
	treeListStatics,
	// 步骤 4 消费方 API：按 item 操作行状态，不再触碰 DOM
	setTreeItemClass,
	setTreeItemText,
	isTreeItemRendered,
	treeRowElement,
	// 步骤 5b 反向入口：事件目标/行内后代 → 行 item（取代 `element.item` expando）
	treeItemOf,
	treeListOfItem,
	treeRowCount,
	treeRowItemAt,
	treeRowIndexOf,
	treeOwnerListOf,
	type TreeListRowApi,
	type TreeListApiOptions,
	type TreeListElementApi
} from './components/basic/YMTreeList/tree-api';
export { default as YMSelectList } from './components/basic/YMSelectList/YMSelectList.vue';
export {
	createSelectListApi,
	createSelectListElement,
	type SelectListApi,
	type SelectListApiOptions,
	type SelectItem,
	type SelectTarget
} from './components/basic/YMSelectList/select-list-api';
export { default as YMMarqueeArea } from './components/business/YMMarqueeArea/YMMarqueeArea.vue';
export { default as YMDragAndDropHint } from './components/business/YMDragAndDropHint/YMDragAndDropHint.vue';
export {
	attachDragAndDropHintApi,
	createDragAndDropHintElement,
	type DragAndDropHintApi,
	type DragAndDropHintCoords
} from './components/business/YMDragAndDropHint/drag-and-drop-hint-api';
export { default as YMTitleBar } from './components/business/YMTitleBar/YMTitleBar.vue';
export { default as YMWindowFrame } from './components/business/YMWindowFrame/YMWindowFrame.vue';
export { default as YMTabBar } from './components/business/YMTabBar/YMTabBar.vue';
export { default as YMParamList } from './components/business/YMParamList/YMParamList.vue';
export { ParamListHistory } from './components/business/YMParamList/param-history';
export { default as YMParameterPane } from './components/business/YMParameterPane/YMParameterPane.vue';
// 参数定义形状 + 清单条目形状：宿主（编辑器）声明清单条目时要用同一份（第 156 轮）
export type { ParamDef } from './components/business/YMParameterPane/param-pane-core';
export type { ManifestEntry } from './components/business/YMParameterPane/manifest-entry';
export { default as YMCommandList } from './components/business/YMCommandList/YMCommandList.vue';
export {
	createCommandListApi,
	createCommandListElement,
	commandListPrototype,
	commandListStatics,
	type CommandListApiOptions,
	type CommandListElementApi
} from './components/business/YMCommandList/command-api';
export { default as YMCustomBox } from './components/business/YMCustomBox/YMCustomBox.vue';
export {
	createCustomBoxElement,
	type CustomBoxApi,
	type CustomBoxApiOptions,
	type CustomBoxParseResult
} from './components/business/YMCustomBox/custom-box-api';
export {
	createCheckBoxElement,
	type CheckBoxApi,
	type CheckBoxApiOptions
} from './components/basic/YMCheckBox/check-box-api';
export {
	createColorBoxElement,
	type ColorBoxApi,
	type ColorBoxApiOptions
} from './components/basic/YMColorBox/color-box-api';
export {
	createRadioBoxElement,
	type RadioBoxApi,
	type RadioBoxApiOptions
} from './components/basic/YMRadioBox/radio-box-api';
export {
	createDetailBoxElement,
	type DetailBoxApi
} from './components/basic/YMDetailBox/detail-box-api';
export {
	createDetailSummaryElement,
	type DetailSummaryApi
} from './components/basic/YMDetailSummary/detail-summary-api';
export {
	createPageManagerElement,
	type PageManagerApi
} from './components/basic/YMPageManager/page-manager-api';
export {
	createToastManagerElement,
	type ToastManagerApi
} from './components/basic/YMToastManager/toast-api';
export {
	createNumberBoxElement,
	type HistoryInputElement,
	type NumberBoxApi,
	type NumberBoxApiOptions
} from './components/basic/YMNumberBox/number-box-api';
export {
	createTextAreaElement,
	type HistoryTextAreaElement,
	type TextAreaApi,
	type TextAreaApiOptions
} from './components/basic/YMTextArea/text-area-api';
export { createNavBarElement, type NavBarApi } from './components/basic/YMNavBar/nav-bar-api';
export {
	createNumberVarElement,
	defVar,
	defVarForPlugin,
	type NumberVarApi,
	type NumberVarApiOptions
} from './components/basic/YMNumberVar/number-var-api';
export {
	createSelectVarElement,
	type SelectVarApi,
	type SelectVarApiOptions
} from './components/basic/YMSelectVar/select-var-api';
export {
	createStringVarElement,
	type StringVarApi,
	type StringVarApiOptions
} from './components/basic/YMStringVar/string-var-api';
export {
	createFileVarElement,
	type FileVarApi,
	type FileVarApiOptions
} from './components/basic/YMFileVar/file-var-api';
export {
	createTextAreaVarElement,
	type TextAreaVarApi,
	type TextAreaVarApiOptions
} from './components/basic/YMTextAreaVar/textarea-var-api';
export {
	createKeyboardBoxElement,
	type KeyboardBoxApi,
	type KeyboardBoxApiOptions
} from './components/basic/YMKeyboardBox/keyboard-box-api';
export {
	createScrollBarElement,
	type ScrollBarApi,
	type ScrollBarApiOptions
} from './components/basic/YMScrollBar/scroll-bar-api';
export {
	createSelectBoxElement,
	type SelectBoxApi,
	type SelectBoxApiOptions
} from './components/basic/YMSelectBox/select-box-api';
export {
	createTextBoxElement,
	type TextBoxApi,
	type TextBoxApiOptions
} from './components/basic/YMTextBox/text-box-api';
export { default as ThemeProvider } from './theme/ThemeProvider.vue';
export { ThemeKey, defaultTheme } from './theme/theme';
export type { Theme } from './theme/theme';
export { useTheme } from './composables/useTheme';
export {
	useMenuService,
	provideMenuService,
	MENU_SERVICE_KEY,
	type MenuService
} from './composables/useMenuService';
export { WordList, type WordListShape } from './composables/useWordList';

export { HistoryTimer, NumberHistory, TextHistory, CommandHistory } from './utils/history';
// 元素数据的存储层（WeakMap + 原型访问器）放在 ui-kit，editor 侧同路径再导出
export {
	elementDataOf,
	elementDataValueOf,
	getElementData,
	isApiAttached,
	markApiAttached
} from './utils/element-data';
export * from './utils/payload-event';
export type { HistoryOperation, IEditableHistory, ICapacityHistory } from './utils/history';
export { EventBus } from './utils/event-bus';
export { INTRGBA, CSSRGBA } from './utils/color';
export {
	TreeDataContext,
	type TreeDataItem,
	type TreeDataGroup,
	type TreeDataCache,
	type TreeDataLists,
	type LocalizeAdapter
} from './utils/tree-data-context';
export { createScrollListener, type ScrollListenerApi } from './utils/scroll-listener';
export { attachApi } from './utils/attach-api';
// 元素 API 契约——把过去挂在**全局** `HTMLElement` 上的成员面改成显式命名类型
export type { YamiElement, YamiElementApi, YamiListElement } from './utils/element-contract';
export { getListConfig, type ListConfig } from './utils/list-config';
export {
	createTypeRegistry,
	type TypeRegistryApi,
	type TypeRegistryDataSource
} from './components/business/type-registry';
export {
	attachRadioProxyApi,
	createRadioProxy,
	radioProxyMap,
	RadioProxy
} from './utils/radio-proxy';
export type {
	RadioProxyElement,
	RadioRelationEntry,
	RadioRelationTarget
} from './utils/radio-proxy';
export { default as YMFileHeadPane } from './components/business/YMFileHeadPane/YMFileHeadPane.vue';
export { default as YMFileNavPane } from './components/business/YMFileNavPane/YMFileNavPane.vue';
export { default as YMFileBodyPane } from './components/business/YMFileBodyPane/YMFileBodyPane.vue';
export { default as YMFileBrowser } from './components/business/YMFileBrowser/YMFileBrowser.vue';
export { default as YMFormButtons } from './components/basic/YMFormButtons/YMFormButtons.vue';
export { default as YMConfirmation } from './components/business/YMConfirmation/YMConfirmation.vue';
export { default as YMRename } from './components/business/YMRename/YMRename.vue';
export { default as YMZoom } from './components/business/YMZoom/YMZoom.vue';
export { default as YMSetKey } from './components/business/YMSetKey/YMSetKey.vue';
export { default as YMSetQuantity } from './components/business/YMSetQuantity/YMSetQuantity.vue';
export { default as YMFont } from './components/business/YMFont/YMFont.vue';
export { default as YMFontSize } from './components/business/YMFontSize/YMFontSize.vue';
export { default as YMArrayListNumber } from './components/business/YMArrayListNumber/YMArrayListNumber.vue';
export { default as YMArrayListString } from './components/business/YMArrayListString/YMArrayListString.vue';
export { default as YMRequestKeyValue } from './components/business/YMRequestKeyValue/YMRequestKeyValue.vue';

// `CSS.rasterize` 的等价实现（原先由 editor 的 `utils/css.ts` 挂在宿主 `CSS` 上）
export { rasterize } from './utils/dom';
