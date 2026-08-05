import { createTextBoxElement, type TextBoxApi } from '@ui-kit';

export function createTextBox(): TextBoxApi {
	return createTextBoxElement();
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
