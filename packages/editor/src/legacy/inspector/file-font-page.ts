import { $ } from '@/util/dom.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { hide, show, write } from '@/util/element-utils';
import { File } from '@/file/file-system-core.ts';
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
		font: null,
		input: null,
		previews: null,
		initialize: null,
		open: null,
		close: null,
		windowResize: null,
		textInput: null
	};

	FileFont.initialize = function (this: FileFontShape) {
		if (!$('#fileFont-content')) return;
		this.previews = $('.fileFont-preview');

		this.input = $('#fileFont-content');
		write(this.input, 'Yami RPG Editor');
		this.textInput({ target: this.input!.input });

		$('#fileFont')?.addEventListener('resize', this.windowResize);
		this.input!.addEventListener('input', this.textInput);
	};

	FileFont.open = function (this: FileFontShape, file: FileFontFileShape, meta: unknown) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const elName = $('#fileFont-name');
			const elSize = $('#fileFont-size');
			const size = Number(file.stats.size);
			elName.textContent = file.basename + file.extname;
			elSize.textContent = File.parseFileSize!(size);

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

	FileFont.windowResize = function (this: FileFontShape, event: Event) {
		const previews = FileFont.previews;
		const dpr = window.devicePixelRatio;
		if (previews.dpr !== dpr) {
			previews.dpr = dpr;
			$('#fileFont-font-grid').style.fontSize = `${12 / dpr}px`;
		}
	};

	FileFont.textInput = function (this: FileFontShape, event: InputEvent) {
		const text = (event.target as HTMLInputElement).value;
		for (const element of FileFont.previews) {
			element.textContent = text;
		}
	};

	Inspector.fileFont = FileFont;
}
