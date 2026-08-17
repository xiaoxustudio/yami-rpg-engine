import '@app/legacy/inspector/file-font-page.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';

export function useFileFontPage() {
	const onTextInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		Inspector?.fileFont?.textInput?.({ target });
	};

	return { onTextInput };
}
