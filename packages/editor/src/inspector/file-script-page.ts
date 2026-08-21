import { $ } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import type { FileMeta } from '@app/data/metadata-manifest.ts';
import { Inspector } from '@app/inspector/inspector.ts';

{
	interface FileScriptShape {
		[k: string]: any;
	}
	const FileScript: FileScriptShape = {
		target: null,
		meta: null,
		info: null,
		overview: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
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

			const size = Number((file.stats as unknown as { size: number }).size);
			this.info = {
				name: file.basename + file.extname,
				size: File.parseFileSize!(size)
			};
			this.update!();

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

	FileScript.update = function (this: typeof FileScript) {
		const el = $('#fileScript');
		if (!el) return;
		(el as HTMLElement & { update?: () => void }).update?.();
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
