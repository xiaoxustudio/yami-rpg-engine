import { useImageClipWindow } from '@app/composables/useImageClipWindow';
import { relate, getRelativeCoords } from '@app/utils/element-utils';
import { $ } from '@app/utils/dom';
import { attachDoubleclick } from '@app/utils/doubleclick';
import { on, hide, show, hasClass, read } from '@app/utils/element-utils.ts';
import { File } from '@app/file/file-system-core.ts';
import { t } from '@app/i18n';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { Path } from '@app/utils/config';

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

export const ImageClip = {
	window: null as unknown as HTMLElement,
	screen: null as unknown as HTMLElement,
	image: null as unknown as HTMLImageElement,
	marquee: null as unknown as CropMarquee,
	target: null as unknown as CropTarget | null,
	symbol: null as unknown as symbol | null,
	dragging: null as unknown as CropDrag | null,
	initialize: null as unknown as () => void,
	open: null as unknown as (...args: unknown[]) => Promise<void>,
	loadImage: null as unknown as () => void,
	updateImage: null as unknown as () => void,
	updateTitle: null as unknown as (...args: unknown[]) => void,
	updateMarquee: null as unknown as () => void,
	shiftMarquee: null as unknown as (...args: unknown[]) => void,
	scrollToMarquee: null as unknown as (...args: unknown[]) => void,
	startDragging: null as unknown as (event: CropDrag) => void,
	dprchange: null as unknown as (event: Event) => void,
	windowClosed: null as unknown as (event: Event) => void,
	windowResize: null as unknown as (event: Event) => void,
	screenKeydown: null as unknown as (event: KeyboardEvent) => void,
	marqueePointerdown: null as unknown as (event: PointerEvent) => void,
	marqueeDoubleclick: null as unknown as (event: MouseEvent) => void,
	pointerup: null as unknown as (event: PointerEvent) => void,
	pointermove: null as unknown as (event: PointerEvent) => void,
	paramInput: null as unknown as (event: Event) => void,
	confirm: null as unknown as (event: Event) => void
};

function ensureDomBound() {
	if (ImageClip.window) return;
	const win = $('#imageClip');
	if (!win) return;
	ImageClip.window = win;
	ImageClip.screen = $('#imageClip-screen');
	ImageClip.image = $('#imageClip-image') as HTMLImageElement;
	hide(ImageClip.image!);
	ImageClip.marquee = $('#imageClip-marquee') as CropMarquee;
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
		new Promise((resolve: (img: HTMLImageElement) => void) => {
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
					resolve(null as unknown as HTMLImageElement);
				}
			});
		}).then((image: HTMLImageElement | null) => {
			if (this.symbol === symbol) {
				this.symbol = null;
				this.updateTitle!(path, image ?? (null as unknown as HTMLImageElement));
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
	const dx = Math.clamp(sx + ox * sw, 0, iw - sw);
	const dy = Math.clamp(sy + oy * sh, 0, ih - sh);
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
			screen.scrollLeft = Math.clamp(screen.scrollLeft, minSL, maxSL);
			screen.scrollTop = Math.clamp(screen.scrollTop, minST, maxST);
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

ImageClip.dprchange = function (this: typeof ImageClip, event: Event) {
	if (!hasClass(this.image, 'hidden')) {
		this.updateImage!();
		this.updateMarquee!();
	}
}.bind(ImageClip);

ImageClip.windowClosed = function (this: typeof ImageClip, event: Event) {
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

ImageClip.windowResize = function (this: typeof ImageClip, event: Event) {
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
				return this.startDragging!(event);
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
			this.startDragging!(event);
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

ImageClip.paramInput = function (this: typeof ImageClip, event: Event) {
	ImageClip.updateMarquee();
};

ImageClip.confirm = function (this: typeof ImageClip, event: Event) {
	useImageClipWindow().confirm();
};
