import { Inspector } from '@app/inspector/inspector.ts';
import { controlRoot, type ControlApi } from './control-refs';

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

	/** 控件实例也行：焦点监听绑到它的根元素上。 */
	type Bindable = Element | ControlApi;

	const toElement = (target: Bindable): Element | null =>
		target instanceof Element ? target : controlRoot(target);

	function bindInput(
		elements: Bindable[] | NodeListOf<Element>,
		editor: InputEditor,
		owner: InputOwner,
		callback?: (data: Record<string, unknown>) => void
	) {
		const blur = inputBlur(editor, owner, callback);
		for (const target of elements as Bindable[]) {
			const el = toElement(target);
			if (!el) continue;
			el.addEventListener('focus', inputFocus);
			el.addEventListener('blur', blur);
		}
	}

	function bindSliders(sliders: Bindable[] | NodeListOf<Element>) {
		if (!sliderFocus || !sliderBlur) {
			return;
		}
		for (const target of sliders as Bindable[]) {
			const el = toElement(target);
			if (!el) continue;
			el.addEventListener('focus', sliderFocus);
			el.addEventListener('blur', sliderBlur);
		}
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
