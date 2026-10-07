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
		getUiInspectorType: (className: string) => getUIStore().inspectorTypeMap![className],
		getLanguage: () => getLocalStore().language,
		openUpdateLog: (messages?: unknown[]) => UpdateLog.open!(messages)
	});
}
