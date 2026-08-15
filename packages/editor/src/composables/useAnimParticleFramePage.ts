import { reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { read } from '@/util/element-utils';

interface AnimParticleFrameForm {
	x: number;
	y: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	opacity: number;
	scale: number;
	speed: number;
}

const ANIM_PARTICLE_FRAME_KEYS: (keyof AnimParticleFrameForm)[] = [
	'x',
	'y',
	'rotation',
	'scaleX',
	'scaleY',
	'opacity',
	'scale',
	'speed'
];

export function useAnimParticleFramePage() {
	const form = reactive<Partial<AnimParticleFrameForm>>({});

	const sync = (): void => {
		const target = Inspector?.animParticleFrame?.target as
			| Partial<AnimParticleFrameForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIM_PARTICLE_FRAME_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animParticleFrame-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.animParticleFrame.update(
				Inspector.animParticleFrame.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
