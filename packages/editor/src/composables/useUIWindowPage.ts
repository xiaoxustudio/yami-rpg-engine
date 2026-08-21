import '@app/inspector/element-window-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

interface UIWindowForm {
	layout: string;
	overflow: string;
	scrollX: number;
	scrollY: number;
	gridWidth: number;
	gridHeight: number;
	gridGapX: number;
	gridGapY: number;
	paddingX: number;
	paddingY: number;
}

const NODE_KEYS: (keyof UIWindowForm)[] = [
	'layout',
	'scrollX',
	'scrollY',
	'gridWidth',
	'gridHeight',
	'gridGapX',
	'gridGapY',
	'paddingX',
	'paddingY',
	'overflow'
];

export function useUIWindowPage() {
	const form = reactive<Partial<UIWindowForm>>({});

	const sync = (): void => {
		const target = Inspector?.uiWindow?.target as Partial<UIWindowForm> | null | undefined;
		if (!target) return;
		for (const key of NODE_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiWindow-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.uiWindow.update(
				Inspector.uiWindow.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
