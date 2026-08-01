import { Editor } from './editor.ts';

(function main() {
	const start = () => {
		(Editor.initialize as any)();
	};
	if ((window as any).__SKIP_AUTO_INIT__) {
		window.addEventListener('vue-app-mounted', start, { once: true });
		return;
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start, { once: true });
	} else {
		start();
	}
})();
