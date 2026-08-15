import { Inspector } from '@/inspector/inspector.ts';

export function useFileFontPage() {
	const onTextInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		Inspector?.fileFont?.textInput?.({ target });
	};

	return { onTextInput };
}
