import { reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { read } from '@/util/element-utils';

interface AnimJointFrameForm {
	x: number;
	y: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	opacity: number;
}

const ANIM_JOINT_FRAME_KEYS: (keyof AnimJointFrameForm)[] = [
	'x',
	'y',
	'rotation',
	'scaleX',
	'scaleY',
	'opacity'
];

export function useAnimJointFramePage() {
	const form = reactive<Partial<AnimJointFrameForm>>({});

	const sync = (): void => {
		const target = Inspector?.animJointFrame?.target as
			| Partial<AnimJointFrameForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIM_JOINT_FRAME_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animJointFrame-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.animJointFrame.update(
				Inspector.animJointFrame.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
