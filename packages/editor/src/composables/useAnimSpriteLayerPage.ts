import '@app/inspector/animation-sprite-layer-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface AnimSpriteLayerForm {
	sprite: string;
	blend: string;
	light: string;
}

const ANIM_SPRITE_LAYER_KEYS: (keyof AnimSpriteLayerForm)[] = ['sprite', 'blend', 'light'];

export function useAnimSpriteLayerPage() {
	const form = reactive<Partial<AnimSpriteLayerForm>>({});

	const sync = (): void => {
		const target = Inspector?.animSpriteLayer?.target as
			| Partial<AnimSpriteLayerForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIM_SPRITE_LAYER_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animSpriteLayer-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.animSpriteLayer.update(
				Inspector.animSpriteLayer.target,
				Inspector.getKey(element),
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
