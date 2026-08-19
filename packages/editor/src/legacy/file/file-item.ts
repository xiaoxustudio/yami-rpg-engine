import { request } from '@app/utils/dom';
import { Window } from '@app/legacy/tools/window-object.ts';
import { t } from '@app/i18n';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { configureFileItemDisplay } from '@app/services/file-system/file-item.ts';

configureFileItemDisplay({
	request,
	localize: (key: string) => t(key),
	confirm: (options, items) => Window.confirm!(options, items),
	maxTexSize: () => GL.maxTexSize
});

export { FileItem } from '@app/services/file-system/file-item.ts';
