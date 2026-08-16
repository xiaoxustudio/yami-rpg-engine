import { useTileNodeWindow } from '@app/composables/useTileNodeWindow';

export const TileNode: Record<string, any> = {
	get canvas() {
		return useTileNodeWindow().canvas;
	},
	get screen() {
		return useTileNodeWindow().screen;
	},
	get marquee() {
		return useTileNodeWindow().marquee;
	},
	get context() {
		return useTileNodeWindow().context;
	},
	get dragging() {
		return useTileNodeWindow().dragging;
	},
	get nodes() {
		return useTileNodeWindow().nodes;
	},
	get image() {
		return useTileNodeWindow().image;
	},
	get offsetX() {
		return useTileNodeWindow().offsetX;
	},
	get offsetY() {
		return useTileNodeWindow().offsetY;
	},
	get hframes() {
		return useTileNodeWindow().hframes;
	},
	get vframes() {
		return useTileNodeWindow().vframes;
	},
	get scrollLeft() {
		return useTileNodeWindow().scrollLeft;
	},
	get scrollTop() {
		return useTileNodeWindow().scrollTop;
	},
	get scrollRight() {
		return useTileNodeWindow().scrollRight;
	},
	get scrollBottom() {
		return useTileNodeWindow().scrollBottom;
	},
	get initialize() {
		return useTileNodeWindow().initialize;
	},
	get open() {
		return useTileNodeWindow().open;
	},
	get updateTransform() {
		return useTileNodeWindow().updateTransform;
	},
	get updateBackground() {
		return useTileNodeWindow().updateBackground;
	},
	get drawNodes() {
		return useTileNodeWindow().drawNodes;
	},
	get requestRendering() {
		return useTileNodeWindow().requestRendering;
	},
	get renderingFunction() {
		return useTileNodeWindow().renderingFunction;
	},
	get stopRendering() {
		return useTileNodeWindow().stopRendering;
	},
	get scrollToSelection() {
		return useTileNodeWindow().scrollToSelection;
	},
	get getDevicePixelClientBoxSize() {
		return useTileNodeWindow().getDevicePixelClientBoxSize;
	},
	get dprchange() {
		return useTileNodeWindow().dprchange;
	},
	get windowClosed() {
		return useTileNodeWindow().windowClosed;
	},
	get keydown() {
		return useTileNodeWindow().keydown;
	},
	get screenScroll() {
		return useTileNodeWindow().screenScroll;
	},
	get marqueePointerdown() {
		return useTileNodeWindow().marqueePointerdown;
	},
	get pointerup() {
		return useTileNodeWindow().pointerup;
	},
	get pointermove() {
		return useTileNodeWindow().pointermove;
	}
};
