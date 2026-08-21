import '@app/inspector/animation-action-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

interface MotionForm {
	mode: string;
	skip: boolean;
	loop: boolean;
	loopStart: number;
}

const MOTION_KEYS: (keyof MotionForm)[] = ['mode', 'skip', 'loop', 'loopStart'];

export function useAnimMotionPage() {
	const form = reactive<Partial<MotionForm>>({});

	const sync = (): void => {
		const target = Inspector?.animMotion?.target as Partial<MotionForm> | null | undefined;
		if (!target) return;
		for (const key of MOTION_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animMotion-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.animMotion.update(
				Inspector.animMotion.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
