import '@app/inspector/element-page.ts';
import '@app/legacy/inspector/element-image-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

interface UIElementForm {
	name: string;
	pointerEvents: string;
	anchorX: number;
	anchorY: number;
	x: number;
	x2: number;
	y: number;
	y2: number;
	width: number;
	width2: number;
	height: number;
	height2: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	skewX: number;
	skewY: number;
	opacity: number;
}

const NODE_KEYS: (keyof UIElementForm)[] = ['name', 'pointerEvents'];

const TRANSFORM_KEYS: (keyof UIElementForm)[] = [
	'anchorX',
	'anchorY',
	'x',
	'x2',
	'y',
	'y2',
	'width',
	'width2',
	'height',
	'height2',
	'rotation',
	'scaleX',
	'scaleY',
	'skewX',
	'skewY',
	'opacity'
];

export function useUIImagePage() {
	const form = reactive<Partial<UIElementForm>>({});

	const sync = (): void => {
		const target = Inspector?.uiElement?.target as
			| (Partial<UIElementForm> & { transform?: Partial<UIElementForm> })
			| null
			| undefined;
		if (!target) return;
		for (const key of NODE_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
		const transform = target.transform ?? {};
		for (const key of TRANSFORM_KEYS) {
			(form as Record<string, unknown>)[key] = transform[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiElement-|^uiImage-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			const key = Inspector.getKey(element);
			if (new RegExp('^uiImage-').test(element.id)) {
				Inspector.uiImage.update(Inspector.uiImage.target, key, read(element));
			} else {
				Inspector.uiElement.update(Inspector.uiElement.target, key, read(element));
			}
		}
		sync();
	};

	return { form, sync, onParamInput };
}
