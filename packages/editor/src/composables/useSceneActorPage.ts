import '@app/legacy/inspector/scene-actor-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { read } from '@app/legacy/util/element-utils';

interface ActorForm {
	name: string;
	type: string;
	actorId: string;
	teamId: string;
	x: number;
	y: number;
	angle: number;
	scale: number;
}

const ACTOR_KEYS: (keyof ActorForm)[] = [
	'name',
	'type',
	'actorId',
	'teamId',
	'x',
	'y',
	'angle',
	'scale'
];

export function useSceneActorPage() {
	const form = reactive<Partial<ActorForm>>({});

	const sync = (): void => {
		const target = Inspector?.sceneActor?.target as Partial<ActorForm> | null | undefined;
		if (!target) return;
		for (const key of ACTOR_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^sceneActor-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.sceneActor.update(
				Inspector.sceneActor.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
