import '@app/main/register.ts';
import { Editor } from '@app/services/project/editor.ts';
import { initCommandColorBridges, initCommandParseBridges } from '@app/commands/command-object.ts';
import { initUpdater } from '@app/services/updater/register.ts';
import { initBrowserSearchHistory } from '@app/module/browser-search-history.ts';
import { initEslints } from '@app/module/eslints.ts';
import { initEditorService } from '@app/services/project/init.ts';
import { configureFileItemDisplay } from '@app/services/file-system/file-item.ts';
import { request } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { getYamiI18n } from '@app/i18n';
import { GL } from '@app/engine/webgl/webgl-init.ts';

initCommandColorBridges();
initCommandParseBridges();
initUpdater();
initBrowserSearchHistory();
initEslints();
initEditorService();

configureFileItemDisplay({
	request,
	localize: (key: string, named?: Record<string, unknown>) =>
		getYamiI18n().global.t(key, named ?? {}),
	confirm: (options, items) => Window.confirm!(options, items),
	maxTexSize: () => GL.maxTexSize
});

(function main() {
	const start = () => {
		Editor.initialize!();
	};
	if ((window as unknown as Record<string, unknown>).__SKIP_AUTO_INIT__) {
		window.addEventListener('vue-app-mounted', start, { once: true });
		return;
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start, { once: true });
	} else {
		start();
	}
})();
