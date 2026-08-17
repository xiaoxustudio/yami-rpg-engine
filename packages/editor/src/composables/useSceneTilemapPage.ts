import '@app/legacy/inspector/scene-tilemap-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { read } from '@app/legacy/util/element-utils';

interface TilemapForm {
	name: string;
	layer: string;
	order: number;
	light: string;
	blend: string;
	x: number;
	y: number;
	width: number;
	height: number;
	anchorX: number;
	anchorY: number;
	offsetX: number;
	offsetY: number;
	parallaxFactorX: number;
	parallaxFactorY: number;
	opacity: number;
}

const TILEMAP_KEYS: (keyof TilemapForm)[] = [
	'name',
	'layer',
	'order',
	'light',
	'blend',
	'x',
	'y',
	'width',
	'height',
	'anchorX',
	'anchorY',
	'offsetX',
	'offsetY',
	'parallaxFactorX',
	'parallaxFactorY',
	'opacity'
];

export function useSceneTilemapPage() {
	const form = reactive<Partial<TilemapForm>>({});

	const sync = (): void => {
		const target = Inspector?.sceneTilemap?.target as Partial<TilemapForm> | null | undefined;
		if (!target) return;
		for (const key of TILEMAP_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event?: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^sceneTilemap-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.sceneTilemap.update(
				Inspector.sceneTilemap.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
