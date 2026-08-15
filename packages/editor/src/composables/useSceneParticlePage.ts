import { reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { read } from '@/util/element-utils';

interface ParticleForm {
	name: string;
	particleId: string;
	x: number;
	y: number;
	angle: number;
	scale: number;
	speed: number;
	opacity: number;
	priority: number;
}

const PARTICLE_KEYS: (keyof ParticleForm)[] = [
	'name',
	'particleId',
	'x',
	'y',
	'angle',
	'scale',
	'speed',
	'opacity',
	'priority'
];

export function useSceneParticlePage() {
	const form = reactive<Partial<ParticleForm>>({});

	const sync = (): void => {
		const target = Inspector?.sceneParticle?.target as Partial<ParticleForm> | null | undefined;
		if (!target) return;
		for (const key of PARTICLE_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^sceneParticle-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.sceneParticle.update(
				Inspector.sceneParticle.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
