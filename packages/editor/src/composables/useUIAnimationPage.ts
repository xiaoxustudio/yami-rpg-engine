import '@app/inspector/element-animation-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface UIAnimationForm {
	animation: string;
	motion: string;
	autoplay: boolean;
	rotatable: boolean;
	angle: number;
	frame: number;
	offsetX: number;
	offsetY: number;
}

const ANIMATION_KEYS: (keyof UIAnimationForm)[] = [
	'animation',
	'motion',
	'autoplay',
	'rotatable',
	'angle',
	'frame',
	'offsetX',
	'offsetY'
];

export function useUIAnimationPage() {
	const form = reactive<Partial<UIAnimationForm>>({});

	const sync = (): void => {
		const target = Inspector?.uiAnimation?.target as
			| Partial<UIAnimationForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIMATION_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiAnimation-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.uiAnimation.update(
				Inspector.uiAnimation.target,
				Inspector.getKey(element),
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
