/**
 * 语义：settings 是 `分组键 -> 该组当前挂着的文件夹 id` 的映射，所以「某 id 属于哪个分组」
 * 要反查 keys。本 helper 与 `setFolderGroup` 里的 oldGroup 同式。
 */
export function folderGroupOf(
	settings: Record<string, string> | null | undefined,
	id: string
): string {
	if (!settings) return '';
	return Object.keys(settings).find((key) => settings[key] === id) ?? '';
}
