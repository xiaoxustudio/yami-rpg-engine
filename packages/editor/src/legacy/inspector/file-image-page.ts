import { $ } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { hide } from '@app/utils/element-utils';
import { File } from '@app/legacy/file/file-system-core.ts';
import { FileItem } from '@app/legacy/file/file-item.ts';
import type { FileMeta } from '@app/legacy/data/metadata-manifest.ts';
import { Inspector } from './inspector.ts';

{
	interface FileImageShape {
		image: HTMLImageElement | null;
		[k: string]: unknown;
	}
	const FileImage: FileImageShape = {
		target: null,
		meta: null,
		symbol: null,
		image: null,
		initialize: null,
		open: null,
		close: null
	};

	FileImage.initialize = function () {};

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
					(
						$('#fileImage') as HTMLElement & { updateImage?: () => void }
					)?.updateImage?.();
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

	Inspector.fileImage = FileImage;
}
