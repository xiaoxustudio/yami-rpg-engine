import '@app/legacy/_register.ts';
import { Editor } from '@app/services/project/editor.ts';
import { initCommandColorBridges, initCommandParseBridges } from '@app/commands/command-object.ts';
import { initUpdater } from '@app/services/updater/register.ts';
import { initBrowserSearchHistory } from '@app/legacy/module/browserSearchHistory.ts';
import { initEslints } from '@app/legacy/module/eslints.ts';
import { initEditorService } from '@app/services/project/init.ts';

initCommandColorBridges();
initCommandParseBridges();
initUpdater();
initBrowserSearchHistory();
initEslints();
initEditorService();

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
