import '@app/inspector/file-script-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface FileScriptForm {
	name: string;
	size: string;
}

export function useFileScriptPage() {
	const form = reactive<FileScriptForm>({
		name: '',
		size: ''
	});

	const sync = (): void => {
		const info = Inspector?.fileScript?.info ?? null;
		if (info) {
			form.name = info.name;
			form.size = info.size;
		}
	};

	return { form, sync };
}
