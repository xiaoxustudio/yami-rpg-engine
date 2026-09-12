import { moduleEls } from '@app/module/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { on, read, write } from '@app/utils/element-utils.ts';
import { requestFocus } from '@app/directives/focus';

/* 设置图块标签 */
export const SetTileTag: {
	callback: ((tag: unknown) => void) | null;
	initialize: (() => void) | null;
	open: ((tag: unknown, callback: (tag: unknown) => void) => void) | null;
	windowClosed: (() => void) | null;
	confirm: (() => void) | null;
} = {
	// properties
	callback: null,
	// methods
	initialize: null,
	open: null,
	// events
	windowClosed: null,
	confirm: null
};

SetTileTag.initialize = function () {
	if (!moduleEls.get('setTileTag')) return;
	on(moduleEls.get('setTileTag') as HTMLElement, 'closed', this.windowClosed!);
	// confirm 由 SetTileTag.vue 的 @confirm 驱动（按钮由 WindowFrame 生成，注册表取不到）
};

SetTileTag.open = function (tag: unknown, callback: (tag: unknown) => void) {
	this.callback = callback;
	Window.open!('setTileTag');
	write(moduleEls.get('setTileTag-tag') as HTMLElement, tag);
	requestFocus('setTileTag-tag', 'all');
};

SetTileTag.windowClosed = function (this: typeof SetTileTag) {
	this.callback = null;
}.bind(SetTileTag);

SetTileTag.confirm = function (this: typeof SetTileTag) {
	this.callback!(read(moduleEls.get('setTileTag-tag') as HTMLElement));
	Window.close!('setTileTag');
}.bind(SetTileTag);
