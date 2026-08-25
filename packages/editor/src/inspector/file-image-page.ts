import { $ } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { hide } from '@app/utils/element-utils';
import { File } from '@app/file/file-system-core.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import type { FileMeta } from '@app/data/metadata-manifest.ts';
import { Inspector } from '@app/inspector/inspector.ts';

{
	interface FileImageInfo {
		name: string;
		size: string;
		resolution: string;
	}
	interface FileImageShape {
		image: HTMLImageElement | null;
		info: FileImageInfo | null;
		update: (() => void) | null;
		[k: string]: unknown;
	}
	const FileImage: FileImageShape = {
		target: null,
		meta: null,
		symbol: null,
		info: null,
		image: null,
		initialize: null,
		open: null,
		close: null,
		update: null
	};

	FileImage.initialize = function () {};

	FileImage.open = function (this: typeof FileImage, file: FileItem, meta: FileMeta | null) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const size = Number((file.stats as unknown as { size: number }).size);
			this.info = {
				name: file.basename + file.extname,
				size: File.parseFileSize!(size),
				resolution: ''
			};
			this.update!();

			const image = this.image!;
			hide(image);
			const path = File.route!(file.path);
			image.src = path;

			const symbol = (this.symbol = Symbol());
			void new Promise<void>((resolve: () => void, reject: () => void) => {
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
					this.info!.resolution = `${width} x ${height}`;
					this.update!();
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

	FileImage.update = function (this: typeof FileImage) {
		const el = $('#fileImage');
		if (!el) return;
		(el as HTMLElement & { update?: () => void }).update?.();
	};

	Inspector.fileImage = FileImage;
}
