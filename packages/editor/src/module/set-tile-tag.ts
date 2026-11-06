import { getSetTileTag } from '@app/composables/tool-window-bridges';
import { Window } from '@app/tools/window-object.ts';
import { requestFocus } from '@app/directives/focus';

export const SetTileTag: {
	callback: ((tag: unknown) => void) | null;
	initialize: (() => void) | null;
	open: ((tag: unknown, callback: (tag: unknown) => void) => void) | null;
	windowClosed: (() => void) | null;
	confirm: (() => void) | null;
} = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

SetTileTag.initialize = function () {
	// 窗口自己监听 closed 并回调（不再按 id 取根元素）
};

SetTileTag.open = function (tag: unknown, callback: (tag: unknown) => void) {
	this.callback = callback;
	Window.open!('setTileTag');
	getSetTileTag()?.setTag(tag);
	requestFocus('setTileTag-tag', 'all');
};

SetTileTag.windowClosed = function (this: typeof SetTileTag) {
	this.callback = null;
}.bind(SetTileTag);

SetTileTag.confirm = function (this: typeof SetTileTag) {
	this.callback!(getSetTileTag()?.getTag());
	Window.close!('setTileTag');
}.bind(SetTileTag);
