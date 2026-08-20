import '@app/legacy/inspector/file-ui-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

interface FileUIForm {
	width: number;
	height: number;
}

const NODE_KEYS: (keyof FileUIForm)[] = ['width', 'height'];

export function useFileUIPage() {
	const form = reactive<Partial<FileUIForm>>({});

	const sync = (): void => {
		const target = Inspector?.fileUI?.target as Partial<FileUIForm> | null | undefined;
		if (!target) return;
		for (const key of NODE_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileUI-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.fileUI.update(
				Inspector.fileUI.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
