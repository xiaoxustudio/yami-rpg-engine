import '@app/inspector/file-video-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface FileVideoForm {
	name: string;
	size: string;
	duration: string;
	resolution: string;
	bitrate: string;
}

export function useFileVideoPage() {
	const form = reactive<FileVideoForm>({
		name: '',
		size: '',
		duration: '',
		resolution: '',
		bitrate: ''
	});

	const sync = (): void => {
		const info = Inspector?.fileVideo?.info ?? null;
		if (info) {
			form.name = info.name;
			form.size = info.size;
			form.duration = info.duration;
			form.resolution = info.resolution;
			form.bitrate = info.bitrate;
		}
	};

	const windowError = (event: Event): void => {
		if ((event as ErrorEvent).message === 'ResizeObserver loop limit exceeded') {
			event.stopImmediatePropagation();
		}
	};

	return { form, sync, windowError };
}
