import { $ } from '@/util/dom.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { clear } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { PluginManager } from '@/plugin/plugin.ts';

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

	FileScript.initialize = function (this: any) {
		if (!$('#fileScript-overview')) return;
		this.overview = $('#fileScript-overview');

		window.addEventListener('localize', this.windowLocalize);
	};

	FileScript.create = function (this: any) {
		return `/* @plugin @version @author @link @desc */

export default class Plugin {
  onStart() {}
}`;
	};

	FileScript.open = async function (this: any, file: any, meta: any) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const elName = $('#fileScript-name');
			const elSize = $('#fileScript-size');
			const size = Number(file.stats.size);
			elName.textContent = file.basename + file.extname;
			elSize.textContent = File.parseFileSize!(size);

			await Data.scripts[meta.guid];
			const elements = PluginManager.createOverview!(meta, true);
			const overview = clear(this.overview);
			for (const element of elements) {
				overview.appendChild(element);
			}
		}
	};

	FileScript.close = function (this: any) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			clear(this.overview);
		}
	};

	FileScript.windowLocalize = function (this, event: any) {
		if (FileScript.target) {
			const { target, meta } = FileScript;
			FileScript.target = null;
			FileScript.open(target, meta);
		}
	};

	Inspector.fileScript = FileScript;
}
