import '@app/inspector/element-page.ts';
import '@app/inspector/element-image-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

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

interface UIImageForm {
	image: string;
	display: string;
	flip: string;
	blend: string;
	shiftX: number;
	shiftY: number;
	clip: number[];
	border: number;
	'tint-0': number;
	'tint-1': number;
	'tint-2': number;
	'tint-3': number;
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

const IMAGE_KEYS: (keyof UIImageForm)[] = [
	'image',
	'display',
	'flip',
	'blend',
	'shiftX',
	'shiftY',
	'clip',
	'border'
];

export function useUIImagePage() {
	const form = reactive<Partial<UIElementForm> & Partial<UIImageForm>>({});

	const sync = (): void => {
		const target = Inspector?.uiElement?.target as
			| (Partial<UIElementForm> & { transform?: Partial<UIElementForm> })
			| null
			| undefined;
		if (target) {
			for (const key of NODE_KEYS) {
				(form as Record<string, unknown>)[key] = target[key];
			}
			const transform = target.transform ?? {};
			for (const key of TRANSFORM_KEYS) {
				(form as Record<string, unknown>)[key] = transform[key];
			}
		}
		const imageTarget = Inspector?.uiImage?.target as
			| (Partial<UIImageForm> & { tint?: unknown[] })
			| null
			| undefined;
		if (imageTarget) {
			for (const key of IMAGE_KEYS) {
				(form as Record<string, unknown>)[key] = imageTarget[key];
			}
			const tint = imageTarget.tint ?? [];
			for (let i = 0; i < 4; i++) {
				(form as Record<string, unknown>)[`tint-${i}`] = tint[i];
			}
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
				Inspector.uiImage.update(
					Inspector.uiImage.target,
					key,
					(form as Record<string, unknown>)[key]
				);
			} else {
				const formKey = key.startsWith('transform-') ? key.slice('transform-'.length) : key;
				Inspector.uiElement.update(
					Inspector.uiElement.target,
					key,
					(form as Record<string, unknown>)[formKey]
				);
			}
		}
		sync();
	};

	return { form, sync, onParamInput };
}
