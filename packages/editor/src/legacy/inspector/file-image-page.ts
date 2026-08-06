import { $ } from '@/util/dom.ts';
import { hide, show } from '@/util/element-utils';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';

{
	const FileImage = {
		target: null as any,
		meta: null as any,
		symbol: null as any,
		image: null as any,
		initialize: null as any,
		open: null as any,
		close: null as any,
		updateImage: null as any,
		windowResize: null as any
	};

	FileImage.initialize = function (this: any) {
		if (!$('#fileImage-image')) return;
		this.image = $('#fileImage-image');

		$('#fileImage').on('resize', this.windowResize);
		$('#fileImage-image-detail').on('toggle', this.windowResize);
	};

	FileImage.open = function (this: any, file: any, meta: any) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const elName = $('#fileImage-name');
			const elSize = $('#fileImage-size');
			const elResolution = $('#fileImage-resolution');
			const size = Number(file.stats.size);
			elName.textContent = file.basename + file.extname;
			elSize.textContent = File.parseFileSize!(size);
			elResolution.textContent = '';

			const image = this.image;
			hide(image);
			const path = File.route!(file.path);
			image.src = path;

			const symbol = (this.symbol = Symbol());
			new Promise<void>((resolve: any, reject: any) => {
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
					this.updateImage();
					const width = image.naturalWidth;
					const height = image.naturalHeight;
					elResolution.textContent = `${width} x ${height}`;
				}
			});
		}
	};

	FileImage.close = function (this: any) {
		if (this.target) {
			(window as any).Browser?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			this.symbol = null;
			this.image.src = '';
		}
	};

	FileImage.updateImage = function (this: any) {
		const image = this.image;
		hide(image);
		const frame = image.parentNode;
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

	FileImage.windowResize = function (this: any, event: any) {
		if (FileImage.target !== null && FileImage.symbol === null) {
			FileImage.updateImage();
		}
	};

	Inspector.fileImage = FileImage;
}
