import { setSpacePressed } from '@app/utils/event-accessors';
import type { EditorEvent } from '@app/types/editor-event';
window.addEventListener(
	'keydown',
	function (event: EditorEvent) {
		if ((event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey) {
			switch ((event as KeyboardEvent).code) {
				case 'KeyZ':
				case 'KeyY':
					event.preventDefault();
					break;
				case 'KeyA':
					if (
						document.activeElement instanceof HTMLInputElement ||
						document.activeElement instanceof HTMLTextAreaElement
					) {
						break;
					} else {
						event.preventDefault();
					}
					break;
			}
		}
		switch ((event as KeyboardEvent).code) {
			case 'Space':
				setSpacePressed(true);
				break;
		}
	},
	{ capture: true }
);

window.addEventListener(
	'keyup',
	function (event: EditorEvent) {
		switch ((event as KeyboardEvent).code) {
			case 'Space':
				setSpacePressed(false);
				break;
		}
	},
	{ capture: true }
);
