import { reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { read } from '@/util/element-utils';

interface ParallaxForm {
	name: string;
	image: string;
	layer: string;
	order: number;
	light: string;
	blend: string;
	opacity: number;
	x: number;
	y: number;
	scaleX: number;
	scaleY: number;
	repeatX: number;
	repeatY: number;
	anchorX: number;
	anchorY: number;
	offsetX: number;
	offsetY: number;
	parallaxFactorX: number;
	parallaxFactorY: number;
	shiftSpeedX: number;
	shiftSpeedY: number;
	tint: number[];
}

const PARALLAX_KEYS: (keyof ParallaxForm)[] = [
	'name',
	'image',
	'layer',
	'order',
	'light',
	'blend',
	'opacity',
	'x',
	'y',
	'scaleX',
	'scaleY',
	'repeatX',
	'repeatY',
	'anchorX',
	'anchorY',
	'offsetX',
	'offsetY',
	'parallaxFactorX',
	'parallaxFactorY',
	'shiftSpeedX',
	'shiftSpeedY'
];

export function useSceneParallaxPage() {
	const form = reactive<Partial<ParallaxForm>>({ tint: [0, 0, 0, 0] });

	const sync = (): void => {
		const target = Inspector?.sceneParallax?.target as Partial<ParallaxForm> | null | undefined;
		if (!target) return;
		for (const key of PARALLAX_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
		if (target.tint) {
			form.tint = [...target.tint];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^sceneParallax-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.sceneParallax.update(
				Inspector.sceneParallax.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
