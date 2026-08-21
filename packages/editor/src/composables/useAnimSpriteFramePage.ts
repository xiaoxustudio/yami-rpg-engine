import '@app/inspector/animation-sprite-frame-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface AnimSpriteFrameForm {
	anchorX: number;
	anchorY: number;
	pivotX: number;
	pivotY: number;
	x: number;
	y: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	opacity: number;
	tint: number[];
}

const ANIM_SPRITE_FRAME_KEYS: (keyof AnimSpriteFrameForm)[] = [
	'anchorX',
	'anchorY',
	'pivotX',
	'pivotY',
	'x',
	'y',
	'rotation',
	'scaleX',
	'scaleY',
	'opacity'
];

export function useAnimSpriteFramePage() {
	const form = reactive<Partial<AnimSpriteFrameForm>>({ tint: [] });

	const sync = (): void => {
		const target = Inspector?.animSpriteFrame?.target as
			| Partial<AnimSpriteFrameForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIM_SPRITE_FRAME_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
		if (Array.isArray(target.tint)) {
			form.tint = [...target.tint];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animSpriteFrame-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.animSpriteFrame.update(
				Inspector.animSpriteFrame.target,
				Inspector.getKey(element),
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
