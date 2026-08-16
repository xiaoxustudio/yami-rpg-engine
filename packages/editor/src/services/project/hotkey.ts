import { Editor } from '@/main/editor.ts';

Editor.switchHotkey = (function IIFE() {
	const keydown = function (event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.code) {
				case 'KeyN':
				case 'KeyO':
				case 'KeyZ':
				case 'KeyY':
					return;
			}
		} else {
			switch (event.code) {
				case 'Enter':
				case 'Escape':
				case 'ArrowUp':
				case 'ArrowDown':
					return;
			}
		}
		event.stopPropagation();
	};
	return function (enabled) {
		switch (enabled) {
			case true:
				window.removeEventListener('keydown', keydown, { capture: true });
				break;
			case false:
				window.addEventListener('keydown', keydown, { capture: true });
				break;
		}
	};
})();
