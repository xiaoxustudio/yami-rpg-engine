import { inspectorEls } from './element-registry.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { hide, show } from '@app/utils/element-utils';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import type { YamiElement } from '@app/types/element-api';
import { encodeURL } from '@app/utils/css';

{
	interface FileFontFileShape {
		stats: { size: number };
		basename: string;
		extname: string;
		path: string;
	}
	type FileFontPreviews = YamiElement[] & { dpr?: number };
	interface FileFontShape {
		target: FileFontFileShape | null;
		meta: unknown;
		symbol: symbol | null;
		info: { name: string; size: string } | null;
		font: FontFace | null;
		previews: FileFontPreviews | null;
		initialize: (() => void) | null;
		open: ((file: FileFontFileShape, meta: unknown) => void) | null;
		close: (() => void) | null;
		update: (() => void) | null;
		windowResize: (() => void) | null;
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

			const previews = this.previews!;
			const path = File.route!(file.path);
			const url = encodeURL(path);
			const font = new FontFace('preview', url);
			for (const preview of previews) {
				hide(preview);
			}
			if (this.font instanceof FontFace) {
				document.fonts.delete(this.font);
			}
			const symbol = (this.symbol = Symbol());
			void font.load().then(() => {
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
		const el = inspectorEls.get('fileFont') as YamiElement;
		if (!el) return;
		(el as HTMLElement & { update?: () => void }).update?.();
	};

	FileFont.windowResize = function (this: FileFontShape) {
		const previews = FileFont.previews!;
		const dpr = window.devicePixelRatio;
		if (previews.dpr !== dpr) {
			previews.dpr = dpr;
			(inspectorEls.get('fileFont-font-grid') as YamiElement).style.fontSize =
				`${12 / dpr}px`;
		}
	};

	Inspector.fileFont = FileFont;
}
