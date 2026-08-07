import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { on } from '@/util/element-utils.ts';
import { Editor } from '@/main/editor.ts';

export const ObjectFolder: {
	initialize: ((...args: any[]) => any) | null;
	open: ((...args: any[]) => any) | null;
	confirm: ((...args: any[]) => any) | null;
} = {
	initialize: null as any,
	open: null as any,
	confirm: null as any
};

ObjectFolder.initialize = function (this: any) {
	const el = $('#object-folder-confirm');
	if (el) on(el, 'click', this.confirm!);
};

ObjectFolder.open = function (this: any) {
	Window.open!('object-folder');
	const data = (Editor.project as any).scene.defaultFolders;
	const write = getElementWriter('object-folder', data);
	write('tilemap');
	write('actor');
	write('region');
	write('light');
	write('animation');
	write('particle');
	write('parallax');
};

ObjectFolder.confirm = function (this: any, event: any) {
	const read = getElementReader('object-folder');
	(Editor.project as any).scene.defaultFolders = {
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
