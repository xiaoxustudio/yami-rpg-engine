import { relate, getRelativeCoords } from '@/util/element-utils';
import { Window } from '@/tools/window-object.ts';
import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { attachDoubleclick } from '@/util/doubleclick.ts';
import { on, hide, show, hasClass, read } from '@/util/element-utils.ts';
import { File } from '@/file/file-system-core.ts';
import { Local } from './localization.ts';
import { Cursor } from './pointer-object.ts';
import { Path } from '@/util/config.ts';

export const ImageClip = {
	window: null as any,
	screen: null as any,
	image: null as any,
	marquee: null as any,
	target: null as any,
	symbol: null as any,
	dragging: null as any,
	initialize: null as any,
	open: null as any,
	loadImage: null as any,
	updateImage: null as any,
	updateTitle: null as any,
	updateMarquee: null as any,
	shiftMarquee: null as any,
	scrollToMarquee: null as any,
	startDragging: null as any,
	dprchange: null as any,
	windowClosed: null as any,
	windowResize: null as any,
	screenKeydown: null as any,
	marqueePointerdown: null as any,
	marqueeDoubleclick: null as any,
	pointerup: null as any,
	pointermove: null as any,
	paramInput: null as any,
	confirm: null as any
};

function ensureDomBound() {
	if (ImageClip.window) return;
	const win = $('#imageClip');
	if (!win) return;
	ImageClip.window = win;
	ImageClip.screen = $('#imageClip-screen');
	ImageClip.image = $('#imageClip-image');
	hide(ImageClip.image!);
	ImageClip.marquee = $('#imageClip-marquee');
	hide(ImageClip.marquee!);
}

ImageClip.initialize = function (this: any) {
	ensureDomBound();
	if (!this.window) return;
	window.addEventListener('dprchange', this.dprchange);
	this.window.addEventListener('closed', this.windowClosed);
	this.window.addEventListener('resize', this.windowResize);
	on(this.screen, 'keydown', this.screenKeydown);
	this.marquee.addEventListener('pointerdown', this.marqueePointerdown);
	attachDoubleclick(this.marquee, this.marqueeDoubleclick);
	document
		.querySelectorAll('#imageClip-x, #imageClip-y, #imageClip-width, #imageClip-height')
		.forEach((el) => el.addEventListener('input', this.paramInput!));
	on($('#imageClip-confirm'), 'click', this.confirm);
};

ImageClip.open = async function (this: any, target: any) {
	this.target = target;
	Window.open!('imageClip');

	const write = getElementWriter('imageClip');
	const [x, y, width, height] = read(target);
	write('x', x);
	write('y', y);
	write('width', width);
	write('height', height);

	this.loadImage!();
};

ImageClip.loadImage = function (this: any) {
	this.window.setTitle('');

	const id = this.target?.getAttribute?.('image');
	const guid = read($('#' + id));
	const path = File.getPath!(guid);
	if (path) {
		const image = this.image;
		image.src = File.route!(path);

		const symbol = (this.symbol = Symbol());
		new Promise((resolve: any) => {
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
		}).then((image: any) => {
			if (this.symbol === symbol) {
				this.symbol = null;
				this.updateTitle!(path, image);
			}
		});
	} else {
		this.updateTitle!();
	}
};

ImageClip.updateImage = function (this: any) {
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

ImageClip.updateTitle = function (this: any, path: any, image: any) {
	let info;
	if (path && image) {
		const name = Path.basename!(path);
		const alias = File.filterGUID!(name);
		const width = image.naturalWidth;
		const height = image.naturalHeight;
		info = `${alias} - ${width}x${height}`;
	} else {
		info = Local.get!('common.none');
	}
	this.window.setTitle(info);
};

ImageClip.updateMarquee = function (this: any) {
	const read = getElementReader('imageClip');
	const x = read('x');
	const y = read('y');
	const width = read('width');
	const height = read('height');
	this.marquee.select(x, y, width, height);
};

ImageClip.shiftMarquee = function (this: any, ox: any, oy: any) {
	const image = this.image;
	const iw = image.naturalWidth;
	const ih = image.naturalHeight;
	if (iw * ih === 0) return;
	const read = getElementReader('imageClip');
	const write = getElementWriter('imageClip');
	const sx = read('x');
	const sy = read('y');
	const sw = read('width');
	const sh = read('height');
	const dx = Math.clamp(sx + ox * sw, 0, iw - sw);
	const dy = Math.clamp(sy + oy * sh, 0, ih - sh);
	if (sx !== dx) write('x', dx);
	if (sy !== dy) write('y', dy);
	this.updateMarquee!();
	this.scrollToMarquee!('active');
};

ImageClip.scrollToMarquee = function (this: any, mode: any) {
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

ImageClip.startDragging = function (this: any, event: any) {
	Cursor.open('cursor-grab');
	this.dragging = event;
	event.mode = 'scroll';
	event.scrollLeft = this.screen.scrollLeft;
	event.scrollTop = this.screen.scrollTop;
	window.addEventListener('pointerup', this.pointerup);
	window.addEventListener('pointermove', this.pointermove);
};

ImageClip.dprchange = function (this: any, event: any) {
	if (!hasClass(this.image, 'hidden')) {
		this.updateImage!();
		this.updateMarquee!();
	}
}.bind(ImageClip);

ImageClip.windowClosed = function (this: any, event: any) {
	if (this.dragging) {
		this.pointerup!(this.dragging);
	}
	this.target = null;
	this.symbol = null;
	this.image.src = '';
	hide(this.image);
	hide(this.marquee);
}.bind(ImageClip);

ImageClip.windowResize = function (this: any, event: any) {
	if (!hasClass(this.image, 'hidden')) {
		this.updateImage!();
	}
}.bind(ImageClip);

ImageClip.screenKeydown = function (this: any, event: any) {
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

ImageClip.marqueePointerdown = function (this: any, event: any) {
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
			const read = getElementReader('imageClip');
			const write = getElementWriter('imageClip');
			const x = coords.x / marquee.scaleX;
			const y = coords.y / marquee.scaleY;
			const cw = Math.max(read('width'), 1);
			const ch = Math.max(read('height'), 1);
			const cx = Math.floor(x / cw) * cw;
			const cy = Math.floor(y / ch) * ch;
			write('x', cx);
			write('y', cy);
			this.updateMarquee!();
			break;
		}
		case 2:
			this.startDragging!(event);
			break;
	}
}.bind(ImageClip);

ImageClip.marqueeDoubleclick = function (this: any, event: any) {
	if (!event.altKey) {
		this.confirm!(event);
	}
}.bind(ImageClip);

ImageClip.pointerup = function (this: any, event: any) {
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

ImageClip.pointermove = function (this: any, event: any) {
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

ImageClip.paramInput = function (this: any, event: any) {
	ImageClip.updateMarquee();
};

ImageClip.confirm = function (this: any, event: any) {
	const read = getElementReader('imageClip');
	this.target?.input?.([read('x'), read('y'), read('width'), read('height')]);
	Window.close!('imageClip');
}.bind(ImageClip);
