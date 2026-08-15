import { reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { read } from '@/util/element-utils';

interface AnimSoundFrameForm {
	sound: string;
	volume: number;
}

const ANIM_SOUND_FRAME_KEYS: (keyof AnimSoundFrameForm)[] = ['sound', 'volume'];

export function useAnimSoundFramePage() {
	const form = reactive<Partial<AnimSoundFrameForm>>({});

	const sync = (): void => {
		const target = Inspector?.animSoundFrame?.target as
			| Partial<AnimSoundFrameForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIM_SOUND_FRAME_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animSoundFrame-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.animSoundFrame.update(
				Inspector.animSoundFrame.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
