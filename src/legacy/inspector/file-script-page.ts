import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { PluginManager } from '@/plugin/plugin.ts';

{
	const FileScript = {
		target: null,
		meta: null,
		overview: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		windowLocalize: null
	};

	FileScript.initialize = function () {
		if (!$('#fileScript-overview')) return;
		this.overview = $('#fileScript-overview');

		window.on('localize', this.windowLocalize);
	};

	FileScript.create = function () {
		return `/* @plugin @version @author @link @desc */

export default class Plugin {
  onStart() {}
}`;
	};

	FileScript.open = async function (file, meta) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const elName = $('#fileScript-name');
			const elSize = $('#fileScript-size');
			const size = Number(file.stats.size);
			elName.textContent = file.basename + file.extname;
			elSize.textContent = File.parseFileSize(size);

			await Data.scripts[meta.guid];
			const elements = PluginManager.createOverview(meta, true);
			const overview = clear(this.overview);
			for (const element of elements) {
				overview.appendChild(element);
			}
		}
	};

	FileScript.close = function () {
		if (this.target) {
			(window as any).Browser?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			clear(this.overview);
		}
	};

	FileScript.windowLocalize = function (event) {
		if (FileScript.target) {
			const { target, meta } = FileScript;
			FileScript.target = null;
			FileScript.open(target, meta);
		}
	};

	Inspector.fileScript = FileScript;
}
