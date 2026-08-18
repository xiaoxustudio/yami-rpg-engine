import { EventEditor } from '@app/legacy/command/event-editor.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Local } from '@app/legacy/tools/localization.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';
import { UpdateLog } from '@app/legacy/log/update-log-window.ts';
import { Editor } from '@app/legacy/main/editor.ts';
import { setUpdaterHooks } from '@app/services/updater/updater.ts';

setUpdaterHooks({
	getProjectPath: () => Editor.config?.project ?? null,
	getProject: () => Editor.project,
	getLocalEvents: () => EventEditor.getAllLocalEvents!(),
	createInspectorSchema: (type: string, arg?: string) => Inspector[type].create(arg),
	getUiInspectorType: (className: string) => UI.inspectorTypeMap[className],
	getLanguage: () => Local.language,
	openUpdateLog: (messages?: unknown[]) => UpdateLog.open!(messages)
});
