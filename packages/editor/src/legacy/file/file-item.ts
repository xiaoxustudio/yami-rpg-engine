import { request } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { Local } from '@/tools/localization.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { configureFileItemDisplay } from '@app/services/file-system/file-item.ts';

configureFileItemDisplay({
	request,
	localize: (key: string) => Local.get!(key),
	confirm: (options, items) => Window.confirm!(options, items),
	maxTexSize: () => GL.maxTexSize
});

export { FileItem } from '@app/services/file-system/file-item.ts';
