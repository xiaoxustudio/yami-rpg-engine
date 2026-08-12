import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { on } from '@/util/element-utils.ts';
import { Editor } from '@/main/editor.ts';

export const ObjectFolder: {
	initialize: (() => void) | null;
	open: (() => void) | null;
	confirm: ((event: Event) => void) | null;
} = {
	initialize: null,
	open: null,
	confirm: null
};

ObjectFolder.initialize = function (this: typeof ObjectFolder) {
	const el = $('#object-folder-confirm');
	if (el) on(el, 'click', this.confirm!);
};

ObjectFolder.open = function (this: typeof ObjectFolder) {
	Window.open!('object-folder');
	const data = (Editor.project!.scene as { defaultFolders: Record<string, unknown> })
		.defaultFolders;
	const write = getElementWriter('object-folder', data);
	write('tilemap');
	write('actor');
	write('region');
	write('light');
	write('animation');
	write('particle');
	write('parallax');
};

ObjectFolder.confirm = function (this: typeof ObjectFolder, event: Event) {
	const read = getElementReader('object-folder');
	(Editor.project!.scene as { defaultFolders: Record<string, unknown> }).defaultFolders = {
		tilemap: read('tilemap'),
		actor: read('actor'),
		region: read('region'),
		light: read('light'),
		animation: read('animation'),
		particle: read('particle'),
		parallax: read('parallax')
	};
	Window.close!('object-folder');
};
