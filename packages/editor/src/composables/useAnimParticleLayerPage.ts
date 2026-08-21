import '@app/inspector/animation-particle-layer-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

interface AnimParticleLayerForm {
	particleId: string;
	position: string;
	angle: string;
	order: string;
}

const ANIM_PARTICLE_LAYER_KEYS: (keyof AnimParticleLayerForm)[] = [
	'particleId',
	'position',
	'angle',
	'order'
];

export function useAnimParticleLayerPage() {
	const form = reactive<Partial<AnimParticleLayerForm>>({});

	const sync = (): void => {
		const target = Inspector?.animParticleLayer?.target as
			| Partial<AnimParticleLayerForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIM_PARTICLE_LAYER_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animParticleLayer-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.animParticleLayer.update(
				Inspector.animParticleLayer.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
