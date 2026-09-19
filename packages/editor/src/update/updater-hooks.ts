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
		// 迁出遗留层：`UI.inspectorTypeMap` 已升进 store。这里本就是回调（调用时才求值），
		// 不是模块加载期读取，所以不存在 store 早于映射表就绪的问题。
		//
		// 保持 `(className) => string` 这个既有契约不变：老写法 `UI.inspectorTypeMap[className]`
		// 对 null 表会直接抛错而不会返回 undefined，所以这里用 `!` 而不是 `?.`——
		// 换成可选链会把「抛错」静默降级成「返回 undefined」，那是行为变化，不该混在搬家提交里。
		getUiInspectorType: (className: string) => getUIStore().inspectorTypeMap![className],
		getLanguage: () => getLocalStore().language,
		openUpdateLog: (messages?: unknown[]) => UpdateLog.open!(messages)
	});
}
