import '@app/inspector/file-font-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface FileFontForm {
	name: string;
	size: string;
	text: string;
}

export function useFileFontPage() {
	const form = reactive<FileFontForm>({
		name: '',
		size: '',
		text: 'Yami RPG Editor'
	});

	const sync = (): void => {
		const info = Inspector?.fileFont?.info ?? null;
		if (info) {
			form.name = info.name;
			form.size = info.size;
		}
	};

	const onTextInput = (event: Event): void => {
		Inspector?.fileFont?.textInput?.({ target: event.target });
	};

	return { form, sync, onTextInput };
}
