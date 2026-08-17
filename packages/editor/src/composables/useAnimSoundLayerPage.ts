import '@app/legacy/inspector/animation-sound-layer-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { read } from '@app/legacy/util/element-utils';

interface AnimSoundLayerForm {
	playbackRate: string;
}

const ANIM_SOUND_LAYER_KEYS: (keyof AnimSoundLayerForm)[] = ['playbackRate'];

export function useAnimSoundLayerPage() {
	const form = reactive<Partial<AnimSoundLayerForm>>({});

	const sync = (): void => {
		const target = Inspector?.animSoundLayer?.target as
			| Partial<AnimSoundLayerForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIM_SOUND_LAYER_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animSoundLayer-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.animSoundLayer.update(
				Inspector.animSoundLayer.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
