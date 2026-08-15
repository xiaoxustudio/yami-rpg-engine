import { reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { read } from '@/util/element-utils';

interface ActorForm {
	portrait: string;
	clip: number[];
	animationId: string;
	idleMotion: string;
	moveMotion: string;
	rotatable: boolean;
	passage: string;
	speed: number;
	shape: string;
	size: number;
	weight: number;
	immovable: boolean;
	scale: number;
	priority: number;
	inherit: string;
}

const ACTOR_KEYS: (keyof ActorForm)[] = [
	'portrait',
	'clip',
	'animationId',
	'idleMotion',
	'moveMotion',
	'rotatable',
	'passage',
	'speed',
	'shape',
	'size',
	'weight',
	'immovable',
	'scale',
	'priority',
	'inherit'
];

export function useFileActorPage() {
	const form = reactive<Partial<ActorForm>>({});

	const sync = (): void => {
		const target = Inspector?.fileActor?.target as Partial<ActorForm> | null | undefined;
		if (!target) return;
		for (const key of ACTOR_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileActor-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.fileActor.update(
				Inspector.fileActor.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
