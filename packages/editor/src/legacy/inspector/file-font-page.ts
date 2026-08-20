import { $ } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { hide, show } from '@app/utils/element-utils';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Inspector } from './inspector.ts';

{
	interface FileFontFileShape {
		stats: { size: number };
		basename: string;
		extname: string;
		path: string;
	}
	interface FileFontShape {
		[k: string]: any;
	}
	const FileFont: FileFontShape = {
		target: null,
		meta: null,
		symbol: null,
		info: null,
		font: null,
		previews: null,
		initialize: null,
		open: null,
		close: null,
		update: null,
		windowResize: null
	};

	FileFont.initialize = function () {};

	FileFont.open = function (this: FileFontShape, file: FileFontFileShape, meta: unknown) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const size = Number(file.stats.size);
			this.info = {
				name: file.basename + file.extname,
				size: File.parseFileSize!(size)
			};
			this.update!();

			const previews = this.previews;
			const path = File.route!(file.path);
			const url = CSS.encodeURL(path);
			const font = new FontFace('preview', url);
			for (const preview of previews) {
				hide(preview);
			}
			if (this.font instanceof FontFace) {
				document.fonts.delete(this.font);
			}
			const symbol = (this.symbol = Symbol());
			font.load().then(() => {
				if (this.symbol === symbol) {
					this.symbol = null;
					this.font = font;
					document.fonts.add(font);
					for (const preview of previews) {
						show(preview);
					}
				}
			});
		}
	};

	FileFont.close = function (this: FileFontShape) {
		if (this.target) {
			if (this.font instanceof FontFace) {
				document.fonts.delete(this.font);
			}
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			this.symbol = null;
			this.font = null;
		}
	};

	FileFont.update = function (this: FileFontShape) {
		const el = $('#fileFont');
		if (!el) return;
		(el as HTMLElement & { update?: () => void }).update?.();
	};

	FileFont.windowResize = function (this: FileFontShape) {
		const previews = FileFont.previews;
		const dpr = window.devicePixelRatio;
		if (previews.dpr !== dpr) {
			previews.dpr = dpr;
			$('#fileFont-font-grid').style.fontSize = `${12 / dpr}px`;
		}
	};

	Inspector.fileFont = FileFont;
}
