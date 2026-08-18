import { createTextAreaElement, type TextAreaApi } from '@ui-kit';
import { listenDraggingScrollbarEvent } from '@app/legacy/util/element-utils';

export function createTextArea(): TextAreaApi {
	return createTextAreaElement({ listenDraggingScrollbarEvent });
}

export function macInputKeydown(event: KeyboardEvent): void {
	if (event.metaKey) {
		switch (event.code) {
			case 'KeyC':
				document.execCommand('copy');
				break;
			case 'KeyV':
				document.execCommand('paste');
				break;
			case 'KeyX':
				document.execCommand('cut');
				break;
		}
	}
}
