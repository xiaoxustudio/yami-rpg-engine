import '@app/inspector/animation-bone-frame-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface AnimJointLayerShape {
	[k: string]: unknown;
}

const AnimJointLayer: AnimJointLayerShape = {
	create: null
};

AnimJointLayer.create = function (this: typeof AnimJointLayer) {
	return {
		class: 'joint',
		name: 'Joint',
		expanded: true,
		hidden: false,
		locked: false,
		frames: [Inspector.animJointFrame.create()],
		children: []
	};
};

Inspector.animJointLayer = AnimJointLayer;

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
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
