import { $ } from '@app/legacy/util/dom.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { FileItem } from '@app/legacy/file/file-item.ts';
import type { FileMeta } from '@app/legacy/data/metadata-manifest.ts';
import { Inspector } from './inspector.ts';

{
	interface FileScriptShape {
		[k: string]: any;
	}
	const FileScript: FileScriptShape = {
		target: null,
		meta: null,
		overview: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		windowLocalize: null
	};

	FileScript.initialize = function (this: typeof FileScript) {};

	FileScript.create = function (this: typeof FileScript) {
		return `/* @plugin @version @author @link @desc */

export default class Plugin {
  onStart() {}
}`;
	};

	FileScript.open = async function (
		this: typeof FileScript,
		file: FileItem,
		meta: FileMeta | null
	) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const elName = $('#fileScript-name');
			const elSize = $('#fileScript-size');
			const size = Number((file.stats as unknown as { size: number }).size);
			elName.textContent = file.basename + file.extname;
			elSize.textContent = File.parseFileSize!(size);

			await Data.scripts[meta!.guid];
			this.meta = meta;
			this.overview?.dispatchEvent(new Event('update'));
		}
	};

	FileScript.close = function (this: typeof FileScript) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			this.overview?.dispatchEvent(new Event('update'));
		}
	};

	FileScript.windowLocalize = function (this, event: Event) {
		if (FileScript.target) {
			const { target, meta } = FileScript;
			FileScript.target = null;
			FileScript.open(target, meta);
		}
	};

	Inspector.fileScript = FileScript;
}
