import { Window } from '@app/tools/window-object.ts';
import { getLazyWindow } from '@app/tools/window-registry';
import { Log } from '@app/log/log-window.ts';
import { PluginManager } from '@app/plugin/plugin.ts';
import { setEditorProjectHooks } from '@app/services/project/editor.ts';

const Title = getLazyWindow('title', () =>
	import('@app/tools/window-cluster').then((m) => m.Title)
);

setEditorProjectHooks({
	onWindowSaveDispatch: () => Window.closeAll!(),
	onWindowConfirm: (options, items) => Window.confirm!(options, items),
	onTitleChanged: () => Title.updateTitleName!(),
	onPluginLoad: (project) => PluginManager.loadFromProject!(project),
	onError: (error) => Log.throw!(error)
});
