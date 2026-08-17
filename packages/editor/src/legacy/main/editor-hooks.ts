import { Window } from '@app/legacy/tools/window-object.ts';
import { Title } from '@app/legacy/title/title-bar.ts';
import { Log } from '@app/legacy/log/log-window.ts';
import { PluginManager } from '@app/legacy/plugin/plugin.ts';
import { setEditorProjectHooks } from '@app/services/project/editor.ts';

setEditorProjectHooks({
	onWindowSaveDispatch: () => Window.closeAll!(),
	onWindowConfirm: (options, items) => Window.confirm!(options, items),
	onTitleChanged: () => Title.updateTitleName!(),
	onPluginLoad: (project) => PluginManager.loadFromProject!(project),
	onError: (error) => Log.throw!(error)
});
