import '@app/inspector/scene-light-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

interface LightForm {
	name: string;
	type: string;
	blend: string;
	x: number;
	y: number;
	range: number;
	intensity: number;
	mask: string;
	anchorX: number;
	anchorY: number;
	width: number;
	height: number;
	angle: number;
	red: number;
	green: number;
	blue: number;
	direct: number;
}

const LIGHT_KEYS: (keyof LightForm)[] = [
	'name',
	'type',
	'blend',
	'x',
	'y',
	'range',
	'intensity',
	'mask',
	'anchorX',
	'anchorY',
	'width',
	'height',
	'angle',
	'red',
	'green',
	'blue',
	'direct'
];

export function useSceneLightPage() {
	const form = reactive<Partial<LightForm>>({});

	const sync = (): void => {
		const target = Inspector?.sceneLight?.target as Partial<LightForm> | null | undefined;
		if (!target) return;
		for (const key of LIGHT_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^sceneLight-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.sceneLight.update(
				Inspector.sceneLight.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
