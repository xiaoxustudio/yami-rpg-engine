import { reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { read } from '@/util/element-utils';

interface RegionForm {
	name: string;
	color: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

const REGION_KEYS: (keyof RegionForm)[] = ['name', 'color', 'x', 'y', 'width', 'height'];

export function useSceneRegionPage() {
	const form = reactive<Partial<RegionForm>>({});

	const sync = (): void => {
		const target = Inspector?.sceneRegion?.target as Partial<RegionForm> | null | undefined;
		if (!target) return;
		for (const key of REGION_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^sceneRegion-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.sceneRegion.update(
				Inspector.sceneRegion.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
