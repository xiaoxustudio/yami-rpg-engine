import { Editor } from './editor.ts';

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
