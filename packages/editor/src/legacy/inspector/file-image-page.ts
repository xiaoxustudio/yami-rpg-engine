import { $ } from '@/util/dom.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { hide, show } from '@/util/element-utils';
import { File } from '@/file/file-system-core.ts';
import { FileItem } from '@/file/file-item.ts';
import type { FileMeta } from '@/data/metadata-manifest.ts';
import { Inspector } from './inspector.ts';

{
	interface FileImageShape {
		image: HTMLImageElement | null;
		updateImage: (() => void) | null;
		windowResize: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	const FileImage: FileImageShape = {
		target: null,
		meta: null,
		symbol: null,
		image: null,
		initialize: null,
		open: null,
		close: null,
		updateImage: null,
		windowResize: null
	};

	FileImage.initialize = function (this: typeof FileImage) {
		if (!$('#fileImage-image')) return;
		this.image = $('#fileImage-image') as HTMLImageElement;

		$('#fileImage')?.on?.('resize', this.windowResize);
		$('#fileImage-image-detail')?.on?.('toggle', this.windowResize);
	};

	FileImage.open = function (this: typeof FileImage, file: FileItem, meta: FileMeta | null) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const elName = $('#fileImage-name');
			const elSize = $('#fileImage-size');
			const elResolution = $('#fileImage-resolution');
			const size = Number((file.stats as unknown as { size: number }).size);
			elName.textContent = file.basename + file.extname;
			elSize.textContent = File.parseFileSize!(size);
			elResolution.textContent = '';

			const image = this.image!;
			hide(image);
			const path = File.route!(file.path);
			image.src = path;

			const symbol = (this.symbol = Symbol());
			new Promise<void>((resolve: () => void, reject: () => void) => {
				const intervalIndex = setInterval(() => {
					if (image.naturalWidth !== 0) {
						clearInterval(intervalIndex);
						resolve();
					} else if (image.complete) {
						clearInterval(intervalIndex);
						reject();
					}
				});
			}).then(() => {
				if (this.symbol === symbol) {
					this.symbol = null;
					this.updateImage!();
					const width = image.naturalWidth;
					const height = image.naturalHeight;
					elResolution.textContent = `${width} x ${height}`;
				}
			});
		}
	};

	FileImage.close = function (this: typeof FileImage) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			this.symbol = null;
			this.image!.src = '';
		}
	};

	FileImage.updateImage = function (this: typeof FileImage) {
		const image = this.image!;
		hide(image);
		const frame = image.parentElement!;
		const frameBox = CSS.getDevicePixelContentBoxSize(frame);
		const cw = frameBox.width;
		const ch = frameBox.height;
		if (cw > 0 && ch > 0) {
			const nw = image.naturalWidth;
			const nh = image.naturalHeight;
			let dw;
			let dh;
			if (nw <= cw && nh <= ch) {
				dw = nw;
				dh = nh;
			} else {
				const scaleX = cw / nw;
				const scaleY = ch / nh;
				if (scaleX < scaleY) {
					dw = cw;
					dh = Math.round(nh * scaleX);
				} else {
					dw = Math.round(nw * scaleY);
					dh = ch;
				}
			}
			const dpr = window.devicePixelRatio;
			image.style.left = `${((cw - dw) >> 1) / dpr}px`;
			image.style.top = `${((ch - dh) >> 1) / dpr}px`;
			image.style.width = `${dw / dpr}px`;
			image.style.height = `${dh / dpr}px`;
			show(image);
		}
	};

	FileImage.windowResize = function (this: typeof FileImage, event: Event) {
		if (FileImage.target !== null && FileImage.symbol === null) {
			FileImage.updateImage!();
		}
	};

	Inspector.fileImage = FileImage;
}
