import '@app/inspector/file-audio-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface FileAudioForm {
	name: string;
	size: string;
	duration: string;
	bitrate: string;
	volume: number;
	pan: number;
	dry: number;
	wet: number;
}

export function useFileAudioPage() {
	const form = reactive<FileAudioForm>({
		name: '',
		size: '',
		duration: '',
		bitrate: '',
		volume: 1,
		pan: 0,
		dry: 1,
		wet: 0
	});

	const sync = (): void => {
		const info = Inspector?.fileAudio?.info ?? null;
		if (info) {
			form.name = info.name;
			form.size = info.size;
			form.duration = info.duration;
			form.bitrate = info.bitrate;
		}
		const params = Inspector?.fileAudio?.params ?? null;
		if (params) {
			form.volume = params.volume;
			form.pan = params.pan;
			form.dry = params.dry;
			form.wet = params.wet;
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileAudio-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.fileAudio.paramInput({ target: element });
		}
		sync();
	};

	return { form, sync, onParamInput };
}
