import { useImageClipWindow } from '@app/composables/useImageClipWindow';
import { createElementRegistry, registryElement } from '@app/utils/element-registry';
import { relate, getRelativeCoords } from '@app/utils/element-utils';
import { $ } from '@app/utils/dom';
import { attachDoubleclick } from '@app/utils/doubleclick';
import { on, hide, show, hasClass, read } from '@app/utils/element-utils.ts';
import { File } from '@app/file/file-system-core.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { Path } from '@app/utils/config';
import type { YamiElement } from '@app/types/element-api';
import { clamp } from '@app/utils/math';

export const imageClipEls = createElementRegistry();

type CropTarget = {
	getAttribute?: (name: string) => string | null;
	input?: (value: number[]) => void;
};

type CropDrag = PointerEvent & {
	mode: string;
	scrollLeft: number;
	scrollTop: number;
};

interface CropMarquee extends HTMLElement {
	select(x: number, y: number, width: number, height: number): void;
	scaleX: number;
	scaleY: number;
	x: number;
	y: number;
	width: number;
	height: number;
}

export const ImageClip = {} as ImageClipSlots;

interface ImageClipSlots {
	window: YamiElement;
	screen: YamiElement;
	image: HTMLImageElement;
	marquee: CropMarquee;
	target: CropTarget | null;
	symbol: symbol | null;
	dragging: CropDrag | null;
	initialize: () => void;
	open: (...args: unknown[]) => Promise<void>;
	loadImage: () => void;
	updateImage: () => void;
	updateTitle: (...args: unknown[]) => void;
	updateMarquee: () => void;
	shiftMarquee: (...args: unknown[]) => void;
	scrollToMarquee: (...args: unknown[]) => void;
	startDragging: (event: CropDrag) => void;
	dprchange: (event: Event) => void;
	windowClosed: (event: Event) => void;
	windowResize: (event: Event) => void;
	screenKeydown: (event: KeyboardEvent) => void;
	marqueePointerdown: (event: PointerEvent) => void;
	marqueeDoubleclick: (event: MouseEvent) => void;
	pointerup: (event: PointerEvent) => void;
	pointermove: (event: PointerEvent) => void;
	paramInput: (event: Event) => void;
	confirm: (event: Event) => void;
}

function ensureDomBound() {
	if (ImageClip.window) return;
	const win = imageClipEls.get('imageClip');
	if (!win) return;
	ImageClip.window = win;
	ImageClip.screen = imageClipEls.get('imageClip-screen') as YamiElement;
	ImageClip.image = registryElement<HTMLImageElement>(imageClipEls, 'imageClip-image')!;
	hide(ImageClip.image!);
	ImageClip.marquee = registryElement<CropMarquee>(imageClipEls, 'imageClip-marquee')!;
	hide(ImageClip.marquee!);
}

ImageClip.initialize = function (this: typeof ImageClip) {
	ensureDomBound();
	if (!this.window) return;
	window.addEventListener('dprchange', this.dprchange);
	this.window.addEventListener('closed', this.windowClosed);
	this.window.addEventListener('resize', this.windowResize);
	on(this.screen, 'keydown', this.screenKeydown);
	this.marquee.addEventListener('pointerdown', this.marqueePointerdown);
	attachDoubleclick(this.marquee, this.marqueeDoubleclick);
};

ImageClip.open = async function (this: typeof ImageClip, ...args: unknown[]) {
	const target = args[0] as CropTarget;
	this.target = target;
	const [x, y, width, height] = read(target);
	useImageClipWindow().open({ x, y, width, height }, (value) => {
		this.target?.input?.(value);
	});

	this.loadImage!();
};

ImageClip.loadImage = function (this: typeof ImageClip) {
	this.window.setTitle('');

	const id = this.target?.getAttribute?.('image');
	const guid = read($('#' + id));
	const path = File.getPath!(guid);
	if (path) {
		const image = this.image;
		image.src = File.route!(path);

		const symbol = (this.symbol = Symbol());
		void new Promise<HTMLImageElement | null>((resolve) => {
			const intervalIndex = setInterval(() => {
				if (image.naturalWidth !== 0) {
					if (this.symbol === symbol) {
						this.updateImage!();
						this.updateMarquee!();
						this.scrollToMarquee!('center');
					}
					clearInterval(intervalIndex);
					resolve(image);
				} else if (image.complete) {
					clearInterval(intervalIndex);
					resolve(null);
				}
			});
		}).then((image) => {
			if (this.symbol === symbol) {
				this.symbol = null;
				this.updateTitle!(path, image);
			}
		});
	} else {
		this.updateTitle!();
	}
};

ImageClip.updateImage = function (this: typeof ImageClip) {
	const screen = this.screen;
	const image = hide(this.image) as HTMLImageElement;
	const marquee = hide(this.marquee) as HTMLElement & { scaleX: number; scaleY: number };

	const dpr = window.devicePixelRatio;
	const width = image.naturalWidth;
	const height = image.naturalHeight;
	const left = Math.max((screen.clientWidth * dpr - width) >> 1, 0);
	const top = Math.max((screen.clientHeight * dpr - height) >> 1, 0);
	image.style.left = `${left / dpr}px`;
	image.style.top = `${top / dpr}px`;
	image.style.width = `${width / dpr}px`;
	image.style.height = `${height / dpr}px`;
	show(image);
	marquee.scaleX = 1 / dpr;
	marquee.scaleY = 1 / dpr;
	marquee.style.left = `${left / dpr}px`;
	marquee.style.top = `${top / dpr}px`;
	marquee.style.width = `${width / dpr}px`;
	marquee.style.height = `${height / dpr}px`;
	show(marquee);
};

ImageClip.updateTitle = function (this: typeof ImageClip, ...args: unknown[]) {
	const path = args[0] as string;
	const image = args[1] as HTMLImageElement | null;
	let info;
	if (path && image) {
		const name = Path.basename!(path);
		const alias = File.filterGUID!(name);
		const width = image.naturalWidth;
		const height = image.naturalHeight;
		info = `${alias} - ${width}x${height}`;
	} else {
		info = t('common.none');
	}
	this.window.setTitle(info);
};

ImageClip.updateMarquee = function (this: typeof ImageClip) {
	const { x, y, width, height } = useImageClipWindow().form;
	this.marquee.select(x, y, width, height);
};

ImageClip.shiftMarquee = function (this: typeof ImageClip, ...args: unknown[]) {
	const ox = args[0] as number;
	const oy = args[1] as number;
	const image = this.image;
	const iw = image.naturalWidth;
	const ih = image.naturalHeight;
	if (iw * ih === 0) return;
	const { form } = useImageClipWindow();
	const sx = form.x;
	const sy = form.y;
	const sw = form.width;
	const sh = form.height;
	const dx = clamp(sx + ox * sw, 0, iw - sw);
	const dy = clamp(sy + oy * sh, 0, ih - sh);
	if (sx !== dx) form.x = dx;
	if (sy !== dy) form.y = dy;
	this.updateMarquee!();
	this.scrollToMarquee!('active');
};

ImageClip.scrollToMarquee = function (this: typeof ImageClip, ...args: unknown[]) {
	const mode = args[0] as string;
	const screen = this.screen;
	const marquee = this.marquee;
	const dpr = window.devicePixelRatio;
	const mx = marquee.x;
	const my = marquee.y;
	const mw = marquee.width;
	const mh = marquee.height;
	const sw = screen.clientWidth * dpr;
	const sh = screen.clientHeight * dpr;
	switch (mode) {
		case 'active': {
			const minSL = (mx + mw - sw) / dpr;
			const maxSL = mx / dpr;
			const minST = (my + mh - sh) / dpr;
			const maxST = my / dpr;
			screen.scrollLeft = clamp(screen.scrollLeft, minSL, maxSL);
			screen.scrollTop = clamp(screen.scrollTop, minST, maxST);
			break;
		}
		case 'center': {
			const x = mx + mw / 2;
			const y = my + mh / 2;
			const sl = x - (sw >> 1);
			const st = y - (sh >> 1);
			screen.scrollLeft = Math.round(sl / dpr);
			screen.scrollTop = Math.round(st / dpr);
			break;
		}
	}
};

ImageClip.startDragging = function (this: typeof ImageClip, event: CropDrag) {
	Cursor.open('cursor-grab');
	this.dragging = event;
	event.mode = 'scroll';
	event.scrollLeft = this.screen.scrollLeft;
	event.scrollTop = this.screen.scrollTop;
	window.addEventListener('pointerup', this.pointerup);
	window.addEventListener('pointermove', this.pointermove);
};

ImageClip.dprchange = function (this: typeof ImageClip, _event: Event) {
	if (!hasClass(this.image, 'hidden')) {
		this.updateImage!();
		this.updateMarquee!();
	}
}.bind(ImageClip);

ImageClip.windowClosed = function (this: typeof ImageClip, _event: Event) {
	if (this.dragging) {
		this.pointerup!(this.dragging);
	}
	this.target = null;
	this.symbol = null;
	this.image.src = '';
	hide(this.image);
	hide(this.marquee);
	useImageClipWindow().onWindowClosed();
}.bind(ImageClip);

ImageClip.windowResize = function (this: typeof ImageClip, _event: Event) {
	if (!hasClass(this.image, 'hidden')) {
		this.updateImage!();
	}
}.bind(ImageClip);

ImageClip.screenKeydown = function (this: typeof ImageClip, event: KeyboardEvent) {
	if (this.dragging) {
		return;
	}
	if (event.ctrlKey || event.metaKey) {
		return;
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'ArrowLeft':
				event.preventDefault();
				this.shiftMarquee!(-1, 0);
				break;
			case 'ArrowUp':
				event.preventDefault();
				this.shiftMarquee!(0, -1);
				break;
			case 'ArrowRight':
				event.preventDefault();
				this.shiftMarquee!(1, 0);
				break;
			case 'ArrowDown':
				event.preventDefault();
				this.shiftMarquee!(0, 1);
				break;
		}
	}
}.bind(ImageClip);

ImageClip.marqueePointerdown = function (this: typeof ImageClip, event: PointerEvent) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (event.altKey) {
				return this.startDragging!(event as CropDrag);
			}
			const marquee = this.marquee;
			const coords = getRelativeCoords(event, marquee);
			const { form } = useImageClipWindow();
			const x = coords.x / marquee.scaleX;
			const y = coords.y / marquee.scaleY;
			const cw = Math.max(form.width, 1);
			const ch = Math.max(form.height, 1);
			const cx = Math.floor(x / cw) * cw;
			const cy = Math.floor(y / ch) * ch;
			form.x = cx;
			form.y = cy;
			this.updateMarquee!();
			break;
		}
		case 2:
			this.startDragging!(event as CropDrag);
			break;
	}
}.bind(ImageClip);

ImageClip.marqueeDoubleclick = function (this: typeof ImageClip, event: MouseEvent) {
	if (!event.altKey) {
		this.confirm!(event);
	}
}.bind(ImageClip);

ImageClip.pointerup = function (this: typeof ImageClip, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'scroll':
				Cursor.close('cursor-grab');
				break;
		}
		this.dragging = null;
		window.removeEventListener('pointerup', this.pointerup);
		window.removeEventListener('pointermove', this.pointermove);
	}
}.bind(ImageClip);

ImageClip.pointermove = function (this: typeof ImageClip, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'scroll':
				this.screen.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX;
				this.screen.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY;
				break;
		}
	}
}.bind(ImageClip);

ImageClip.paramInput = function (this: typeof ImageClip, _event: Event) {
	ImageClip.updateMarquee();
};

ImageClip.confirm = function (this: typeof ImageClip, _event: Event) {
	useImageClipWindow().confirm();
};
