import { File } from '@/file/file-system-core.ts';

export function setIconClip(
	icon: HTMLElement,
	path: string,
	cx: number,
	cy: number,
	cw: number,
	ch: number
): void {
	(File as any)
		.getImageResolution(path)
		.then(({ width, height }: { width: number; height: number }) => {
			if (cw < 0) {
				cw = Math.floor(width / -cw);
				ch = Math.floor(height / -ch);
				if (cw * ch === 0) return;
			}
			if (cw !== ch) {
				if (cw > ch) {
					const oy = (cw - ch) / 2;
					const t = (100 * oy) / cw;
					const b = 100 - t;
					cy -= oy;
					icon.style.clipPath = `polygon(0 ${t}%, 100% ${t}%, 100% ${b}%, 0 ${b}%)`;
				} else {
					const ox = (ch - cw) / 2;
					const l = (100 * ox) / ch;
					const r = 100 - l;
					cx -= ox;
					icon.style.clipPath = `polygon(${l}% 0, ${r}% 0, ${r}% 100%, ${l}% 100%)`;
				}
			}
			const size = Math.max(cw, ch);
			const sx = width / size;
			const sy = height / size;
			const px = sx !== 1 ? cx / size / (sx - 1) : 0;
			const py = sy !== 1 ? cy / size / (sy - 1) : 0;
			icon.style.backgroundImage = CSS.encodeURL(File.route!(path));
			icon.style.backgroundPosition = `${px * 100}% ${py * 100}%`;
			icon.style.backgroundSize = `${sx * 100}% ${sy * 100}%`;
			if (size <= 128) {
				icon.style.imageRendering = 'pixelated';
			}
		});
}
