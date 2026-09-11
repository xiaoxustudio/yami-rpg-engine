/**
 * 属性/枚举「set-as（设为分组）」的共用数据面读取（T5b 步骤 5b）。
 *
 * 语义：settings 是 `分组键 -> 该组当前挂着的文件夹 id` 的映射，所以「某 id 属于哪个分组」
 * 要反查 keys。旧实现读的是行元素上的 `item.element?.group`，但**全仓没有任何代码写这个属性**
 * （唯一的 `.group =` 赋值在 `engine/layout/layout.ts`，那是拖拽事件对象），因此那个表达式
 * 恒为 undefined → 右键菜单的勾选恒为 false。本 helper 与 `setFolderGroup` 里的 oldGroup 同式。
 */
export function folderGroupOf(
	settings: Record<string, string> | null | undefined,
	id: string
): string {
	if (!settings) return '';
	return Object.keys(settings).find((key) => settings[key] === id) ?? '';
}
