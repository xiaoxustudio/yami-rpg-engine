import { moduleEls } from '@app/module/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { on, read, write } from '@app/utils/element-utils.ts';
import { requestFocus } from '@app/directives/focus';
import type { YamiElement } from '@app/types/element-api';

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
	if (!moduleEls.get('setTileTag')) return;
	on(moduleEls.get('setTileTag') as YamiElement, 'closed', this.windowClosed!);
};

SetTileTag.open = function (tag: unknown, callback: (tag: unknown) => void) {
	this.callback = callback;
	Window.open!('setTileTag');
	write(moduleEls.get('setTileTag-tag') as YamiElement, tag);
	requestFocus('setTileTag-tag', 'all');
};

SetTileTag.windowClosed = function (this: typeof SetTileTag) {
	this.callback = null;
}.bind(SetTileTag);

SetTileTag.confirm = function (this: typeof SetTileTag) {
	this.callback!(read(moduleEls.get('setTileTag-tag') as YamiElement));
	Window.close!('setTileTag');
}.bind(SetTileTag);
