import { paletteEls } from '@app/palette/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { on } from '@app/utils/element-utils.ts';
import { requestFocus } from '@app/directives/focus';
import { getPaletteStore } from '@app/stores/palette';
import type { FrameGeneratorForm } from '@app/stores/palette';
import type { YamiElement } from '@app/types/element-api';

// 形状定义已移到 `stores/palette.ts`（那里的 `frameGeneratorForm` 就是真源），这里原样转出。
export type { FrameGeneratorForm };

/**
 * `FrameGenerator` 的成员契约（`any-hatches` 收口，2026-09-20）。
 *
 * 此前是 `Record<string, any>`：`FrameGenerator.open!(…)` 与 `FrameGenerator.initialize!()`
 * 的**成员名写错也不报错**，且 `this` 不受约束。这里按真实挂载点枚举。
 *
 * 可空是有意的：对象字面量先把它们占成 `null`，函数在下方才挂上；`confirm` 里的
 * `this.callback` 只在窗口打开（= `open` 已赋过值）的路径上被调用，所以沿用 `!`
 * ——**类型轮不改运行时行为**。
 */
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
	 * 表单真源在 `stores/palette.ts` 的 `frameGeneratorForm`（原先这里是本模块的模块级 `reactive`）。
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
	// confirm 由 AutoTileGenerateFrames.vue 的 @confirm 驱动（按钮由 WindowFrame 生成）
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
