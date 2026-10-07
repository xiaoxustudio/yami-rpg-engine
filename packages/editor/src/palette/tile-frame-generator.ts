import { paletteEls } from '@app/palette/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { on } from '@app/utils/element-utils.ts';
import { requestFocus } from '@app/directives/focus';
import { getPaletteStore } from '@app/stores/palette';
import type { FrameGeneratorForm } from '@app/stores/palette';
import type { YamiElement } from '@app/types/element-api';

export type { FrameGeneratorForm };

interface FrameGeneratorShape {
	form: FrameGeneratorForm;
	callback: ((strideX: number, strideY: number, count: number) => void) | null;
	initialize: ((this: FrameGeneratorShape) => void) | null;
	open:
		| ((
				this: FrameGeneratorShape,
				callback: (strideX: number, strideY: number, count: number) => void
		  ) => void)
		| null;
	windowClosed: ((this: FrameGeneratorShape, event: Event) => void) | null;
	confirm: ((this: FrameGeneratorShape, event: Event) => void) | null;
}

export const FrameGenerator: FrameGeneratorShape = {
	/**
	 * 表单真源在 `stores/palette.ts` 的 `frameGeneratorForm`。
	 * 用 getter 而不是快照：`AutoTileGenerateFrames.vue:62` 取到的是**同一个** reactive 对象，
	 * `v-model="form.strideX"` 与下面对 `this.form` 的复位/读取都落在同一份状态上。
	 */
	get form() {
		return getPaletteStore().frameGeneratorForm;
	},
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

FrameGenerator.initialize = function (this: typeof FrameGenerator) {
	this.form.strideX = 0;
	this.form.strideY = 0;
	this.form.count = 1;

	const frameWindow = paletteEls.get('autoTile-generateFrames') as YamiElement;
	if (frameWindow) on(frameWindow, 'closed', this.windowClosed!);
};

FrameGenerator.open = function (
	this: typeof FrameGenerator,
	callback: (strideX: number, strideY: number, count: number) => void
) {
	this.callback = callback;
	Window.open!('autoTile-generateFrames');
	requestFocus('autoTile-generateFrames-strideX', 'all');
};

FrameGenerator.windowClosed = function (this: typeof FrameGenerator, _event: Event) {
	this.callback = null;
}.bind(FrameGenerator);

FrameGenerator.confirm = function (this: typeof FrameGenerator, _event: Event) {
	const strideX = this.form.strideX;
	const strideY = this.form.strideY;
	const count = this.form.count;
	if (strideX === 0 && strideY === 0) {
		return requestFocus('autoTile-generateFrames-strideX');
	}
	this.callback!(strideX, strideY, count);
	Window.close!('autoTile-generateFrames');
}.bind(FrameGenerator);
