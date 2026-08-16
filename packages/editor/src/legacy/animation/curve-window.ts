import {
	useCurveWindow,
	type CurveCanvas,
	type CurveFrame,
	type CurveList,
	type CurveState
} from '@app/composables/useCurveWindow';

export type { CurveCanvas, CurveFrame, CurveList, CurveState };

type CurveMethod = ((...args: unknown[]) => unknown) | null;

interface CurveShape {
	state: CurveState;
	page: HTMLElement | null;
	head: HTMLElement | null;
	list: CurveList | null;
	canvas: CurveCanvas | null;
	target: CurveFrame | null;
	index: number | null | '';
	curveMap: unknown | null;
	initialize: (() => void) | null;
	open: (() => void) | null;
	load: CurveMethod;
	close: (() => void) | null;
	suspend: (() => void) | null;
	resume: (() => void) | null;
	updateHead: (() => void) | null;
	updateEasingOptions: (() => void) | null;
	updateTimeline: ((target: CurveFrame) => void) | null;
	resize: (() => void) | null;
	drawCurve: (() => void) | null;
	requestRendering: (() => void) | null;
	renderingFunction: (() => void) | null;
	stopRendering: (() => void) | null;
	windowResize: ((event?: Event) => void) | null;
	themechange: ((event: Event) => void) | null;
	datachange: ((event: Event) => void) | null;
	easingIdWrite: ((event: Event) => void) | null;
	easingIdInput: ((event: Event) => void) | null;
	settingsPointerdown: ((event: PointerEvent) => void) | null;
}

export const Curve: CurveShape = {
	get state() {
		return useCurveWindow().state;
	},
	get page() {
		return useCurveWindow().page;
	},
	get head() {
		return useCurveWindow().head;
	},
	get list() {
		return useCurveWindow().list;
	},
	get canvas() {
		return useCurveWindow().canvas;
	},
	get target() {
		return useCurveWindow().target;
	},
	get index() {
		return useCurveWindow().index;
	},
	get curveMap() {
		return useCurveWindow().curveMap;
	},
	get initialize() {
		return useCurveWindow().initialize;
	},
	get open() {
		return useCurveWindow().open;
	},
	get load() {
		return useCurveWindow().load;
	},
	get close() {
		return useCurveWindow().close;
	},
	get suspend() {
		return useCurveWindow().suspend;
	},
	get resume() {
		return useCurveWindow().resume;
	},
	get updateHead() {
		return useCurveWindow().updateHead;
	},
	get updateEasingOptions() {
		return useCurveWindow().updateEasingOptions;
	},
	get updateTimeline() {
		return useCurveWindow().updateTimeline;
	},
	get resize() {
		return useCurveWindow().resize;
	},
	get drawCurve() {
		return useCurveWindow().drawCurve;
	},
	get requestRendering() {
		return useCurveWindow().requestRendering;
	},
	get renderingFunction() {
		return useCurveWindow().renderingFunction;
	},
	get stopRendering() {
		return useCurveWindow().stopRendering;
	},
	get windowResize() {
		return useCurveWindow().windowResize;
	},
	get themechange() {
		return useCurveWindow().themechange;
	},
	get datachange() {
		return useCurveWindow().datachange;
	},
	get easingIdWrite() {
		return useCurveWindow().easingIdWrite;
	},
	get easingIdInput() {
		return useCurveWindow().easingIdInput;
	},
	get settingsPointerdown() {
		return useCurveWindow().settingsPointerdown;
	}
};
