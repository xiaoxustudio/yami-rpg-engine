import { EventEditor } from '@app/commands/event-editor.ts';
import { getInspectorStore } from '@app/stores/inspector.ts';
import { getLocalStore } from '@app/stores/local';
import { getUIStore } from '@app/stores/ui';
import { UpdateLog } from '@app/log/update-log-window.ts';
import { Editor } from '@app/services/project/editor.ts';
import { setUpdaterHooks } from '@app/services/updater/updater.ts';

export function initUpdaterHooks(): void {
	setUpdaterHooks({
		getProjectPath: () => Editor.config?.project ?? null,
		getProject: () => Editor.project,
		getLocalEvents: () => EventEditor.getAllLocalEvents!(),
		createInspectorSchema: (type: string, arg?: string) =>
			getInspectorStore().create(type, arg),
		// `inspectorTypeMap` 从 store 取。这里是回调（调用时才求值），
		// 不是模块加载期读取，所以不存在 store 早于映射表就绪的问题。
		//
		// 契约是 `(className) => string`：表为 null 时 `inspectorTypeMap![className]` 直接抛错，
		// 所以这里用 `!` 而不是 `?.`——可选链会把「抛错」静默降级成「返回 undefined」，是行为变化。
		getUiInspectorType: (className: string) => getUIStore().inspectorTypeMap![className],
		getLanguage: () => getLocalStore().language,
		openUpdateLog: (messages?: unknown[]) => UpdateLog.open!(messages)
	});
}
