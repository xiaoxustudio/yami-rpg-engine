import { reactive } from 'vue';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils';

export interface AngleGetterForm {
	type: string;
	position: { type: string; actor: { type: string } };
	degrees: number;
}

interface AngleGetterTarget {
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface AngleGetterWindow {
	form: AngleGetterForm;
	open: (target: AngleGetterTarget) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

type AngleGetterFrame = HTMLElement & {
	setForm?: (data: Partial<AngleGetterForm>) => void;
	getForm?: () => AngleGetterForm;
};

const form = reactive<AngleGetterForm>({
	type: 'position',
	position: { type: 'actor', actor: { type: 'trigger' } },
	degrees: 0
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;

const getFrame = (): AngleGetterFrame | null =>
	document.getElementById('angleGetter') as AngleGetterFrame | null;

const open = (target: AngleGetterTarget): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	Window.open!('angleGetter');

	let position = { type: 'actor', actor: { type: 'trigger' } };
	let degrees = 0;
	const angle = target.read?.() ?? {};
	switch (angle.type) {
		case 'position':
			position = angle.position;
			break;
		case 'absolute':
		case 'relative':
		case 'direction':
			degrees = angle.degrees;
			break;
		case 'random':
			break;
	}
	Object.assign(form, { type: angle.type, position, degrees });
	getFrame()?.setForm?.(form);
	getFocus(document.getElementById('angleGetter-type'));
};

const confirm = (): void => {
	const data = getFrame()?.getForm?.() ?? form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'position':
			getter = { type: data.type, position: data.position };
			break;
		case 'absolute':
		case 'relative':
		case 'direction':
			getter = { type: data.type, degrees: data.degrees };
			break;
		case 'random':
			getter = { type: data.type };
			break;
	}
	callback?.(getter!);
	Window.close!('angleGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useAngleGetterWindow(): AngleGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
