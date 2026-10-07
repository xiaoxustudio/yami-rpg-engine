import { Inspector } from '@app/inspector/inspector.ts';

interface InputEditor {
	target: unknown;
}

export type InputOwner = object;

export function useInspectorInput() {
	const inputFocus = Inspector.inputFocus;

	const inputBlur = (
		editor: InputEditor,
		owner: InputOwner,
		callback?: (data: Record<string, unknown>) => void
	) => {
		if (!Inspector.inputBlur) {
			return () => {};
		}
		return Inspector.inputBlur(editor, owner, callback as never);
	};

	const sliderFocus = Inspector.sliderFocus;
	const sliderBlur = Inspector.sliderBlur;

	function bindInput(
		elements: Element[] | NodeListOf<Element>,
		editor: InputEditor,
		owner: InputOwner,
		callback?: (data: Record<string, unknown>) => void
	) {
		const blur = inputBlur(editor, owner, callback);
		(elements as HTMLElement[]).forEach((el) => {
			el.addEventListener('focus', inputFocus);
			el.addEventListener('blur', blur);
		});
	}

	function bindSliders(sliders: Element[] | NodeListOf<Element>) {
		if (!sliderFocus || !sliderBlur) {
			return;
		}
		(sliders as HTMLElement[]).forEach((el) => {
			el.addEventListener('focus', sliderFocus);
			el.addEventListener('blur', sliderBlur);
		});
	}

	return {
		inputFocus,
		inputBlur,
		sliderFocus,
		sliderBlur,
		bindInput,
		bindSliders
	};
}
