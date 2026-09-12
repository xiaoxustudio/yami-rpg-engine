import '@app/inspector/file-image-page.ts';
import { reactive } from 'vue';
import { hide, show } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { inspectorEls } from '@app/inspector/element-registry.ts';

interface FileImageForm {
	name: string;
	size: string;
	resolution: string;
}

export function useFileImagePage() {
	const form = reactive<FileImageForm>({
		name: '',
		size: '',
		resolution: ''
	});

	const sync = (): void => {
		const info = Inspector?.fileImage?.info ?? null;
		if (info) {
			form.name = info.name;
			form.size = info.size;
			form.resolution = info.resolution;
		}
	};

	const updateImage = (): void => {
		const image = (inspectorEls.get('fileImage-image') as HTMLImageElement | null) ?? null;
		if (!image) return;
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

	const windowResize = (_event: Event): void => {
		const fileImage = Inspector.fileImage;
		if (fileImage?.target !== null && fileImage?.symbol === null) {
			updateImage();
		}
	};

	return { form, sync, updateImage, windowResize };
}
