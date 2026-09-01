import '@app/inspector/file-ui-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface FileUIForm {
	width: number;
	height: number;
}

const UI_KEYS: (keyof FileUIForm)[] = ['width', 'height'];

export function useFileUIPage() {
	const form = reactive<Partial<FileUIForm>>({});

	const sync = (): void => {
		const target = Inspector?.fileUI?.target as Partial<FileUIForm> | null | undefined;
		if (!target) return;
		for (const key of UI_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event?: Event): void => {
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
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
