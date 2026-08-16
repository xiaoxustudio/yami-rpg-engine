import { EventEditor } from '@/command/event-editor.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Local } from '@/tools/localization.ts';
import { UI } from '@/ui/ui-window.ts';
import { UpdateLog } from '@/log/update-log-window.ts';
import { Editor } from '@/main/editor.ts';
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
