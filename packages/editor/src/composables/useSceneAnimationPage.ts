import '@app/legacy/inspector/scene-animation-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

interface AnimationForm {
	name: string;
	animationId: string;
	motion: string;
	rotatable: boolean;
	x: number;
	y: number;
	angle: number;
	scale: number;
	speed: number;
	opacity: number;
	priority: number;
}

const ANIMATION_KEYS: (keyof AnimationForm)[] = [
	'name',
	'animationId',
	'motion',
	'rotatable',
	'x',
	'y',
	'angle',
	'scale',
	'speed',
	'opacity',
	'priority'
];

export function useSceneAnimationPage() {
	const form = reactive<Partial<AnimationForm>>({});

	const sync = (): void => {
		const target = Inspector?.sceneAnimation?.target as
			| Partial<AnimationForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIMATION_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
		if (form.animationId) {
			Inspector?.sceneAnimation?.animationIdWrite?.({ value: form.animationId });
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^sceneAnimation-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.sceneAnimation.update(
				Inspector.sceneAnimation.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
