import { $ } from '@/util/dom.ts';
import { addScrollbars, on, show, hide, clear, read, write } from '@/util/element-utils.ts';
import { Timer } from '@/util/timer.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Cursor } from '@/tools/pointer-object.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Palette } from '@/palette/palette.ts';

export const Sprite = {
	state: 'closed',
	body: null as any,
	window: null as any,
	canvas: null as any,
	context: null as any,
	info: null as any,
	slider: null as any,
	screen: null as any,
	marquee: null as any,
	symbol: null as any,
	target: null as any,
	hframes: null as any,
	vframes: null as any,
	image: null as any,
	dragging: null as any,
	showGrid: true,
	gridColor: null as any,
	zoom: null as any,
	zoomTimer: null as any,
	scale: null as any,
	scaleX: null as any,
	scaleY: null as any,
	scaledUnitWidth: null as any,
	scaledUnitHeight: null as any,
	unitWidth: null as any,
	unitHeight: null as any,
	outerWidth: null as any,
	outerHeight: null as any,
	screenWidth: null as any,
	screenHeight: null as any,
	scrollLeft: null as any,
	scrollTop: null as any,
	scrollRight: null as any,
	scrollBottom: null as any,
	centerOffsetX: null as any,
	centerOffsetY: null as any,
	paddingLeft: null as any,
	paddingTop: null as any,
	centerX: null as any,
	centerY: null as any,
	initialize: null as any,
	open: null as any,
	close: null as any,
	suspend: null as any,
	resume: null as any,
	setZoom: null as any,
	loadImage: null as any,
	updateTargetInfo: null as any,
	resize: null as any,
	getUnitCoords: null as any,
	updateCamera: null as any,
	updateTransform: null as any,
	updateBackground: null as any,
	drawSprite: null as any,
	drawSpriteLayer: null as any,
	drawGridLayer: null as any,
	selectSprite: null as any,
	scrollToSelection: null as any,
	requestRendering: null as any,
	renderingFunction: null as any,
	stopRendering: null as any,
	saveToProject: null as any,
	loadFromProject: null as any,
	windowResize: null as any,
	themechange: null as any,
	zoomFocus: null as any,
	zoomInput: null as any,
	screenKeydown: null as any,
	screenWheel: null as any,
	screenUserscroll: null as any,
	marqueePointerdown: null as any,
	pointerup: null as any,
	pointermove: null as any
};

Sprite.initialize = function () {
	this.body = $('#sprite-body');
	this.window = $('#sprite-frame');
	hide(this.window);
	this.canvas = $('#sprite-canvas');
	this.info = $('#sprite-info');
	this.slider = $('#sprite-zoom');
	this.screen = $('#sprite-screen');
	this.marquee = $('#sprite-marquee');
	addScrollbars(this.screen);

	this.context = this.canvas.getContext('2d', { desynchronized: true });

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer) => {
			if (this.state === 'open') {
				const { elapsed, duration, start, end } = timer;
				const time = elapsed / duration;
				this.scale = start * (1 - time) + end * time;
				this.resize();
				this.requestRendering();
			} else {
				this.scale = timer.end;
				return false;
			}
		}
	});

	window.on('themechange', this.themechange);
	on($('#animSpriteFrame-vue-mount'), 'resize', this.windowResize);
	on($('#animSpriteFrame-properties-detail'), 'toggle', this.windowResize);
	on($('#animSpriteFrame-sprite-detail'), 'toggle', this.windowResize);
	on(this.slider, 'focus', this.zoomFocus);
	on(this.slider, 'input', this.zoomInput);
	on(this.screen, 'keydown', this.screenKeydown);
	on(this.screen, 'wheel', this.screenWheel);
	on(this.screen, 'userscroll', this.screenUserscroll);
	on(this.marquee, 'pointerdown', this.marqueePointerdown);
};

Sprite.open = function (target: any) {
	if (this.target !== target) {
		this.close();
		if (Animation.timelineMarquee.layer.sprite) {
			this.state = 'loading';
			this.target = target;
			this.loadImage();
		}
	}
};

Sprite.close = function () {
	if (this.state !== 'closed') {
		this.state = 'closed';
		this.symbol = null;
		this.target = null;
		this.image = null;
		hide(this.window);
		clear(this.info);
		clear(this.marquee);
		this.stopRendering();
	}
};

Sprite.suspend = function () {
	if (this.state === 'open') {
		this.state = 'suspended';
		hide(this.info);
		hide(this.slider);
		this.stopRendering();
	}
};

Sprite.resume = function () {
	if (this.state === 'suspended') {
		this.state = 'open';
		show(this.info);
		show(this.slider);
		this.resize();
		this.requestRendering();
	}
};

Sprite.setZoom = (function IIFE() {
	return function (this: typeof Sprite, zoom: any) {
		if (this.zoom !== zoom) {
			let scale;
			switch (zoom) {
				case 0:
					scale = 0.25;
					break;
				case 1:
					scale = 0.5;
					break;
				case 2:
					scale = 1;
					break;
				case 3:
					scale = 2;
					break;
				case 4:
					scale = 4;
					break;
				default:
					return;
			}
			this.zoom = zoom;
			if (this.slider) write(this.slider, zoom);
			if (this.state === 'open') {
				const timer = this.zoomTimer;
				timer.start = this.scale;
				timer.end = scale;
				timer.elapsed = 0;
				timer.add();
			} else {
				this.scale = scale;
			}
		}
	};
})();

Sprite.loadImage = async function () {
	const symbol = (this.symbol = Symbol());
	const name = Animation.timelineMarquee.layer.sprite;
	let texture = Animation.player.textures[name];
	if (texture instanceof Promise) {
		texture = await texture;
	}
	if (this.symbol === symbol) {
		this.symbol = null;
		if (!texture) {
			return this.close();
		}
		const { image } = texture.base;
		this.image = image;
		this.hframes = texture.hframes;
		this.vframes = texture.vframes;
		this.unitWidth = texture.width;
		this.unitHeight = texture.height;
		show(this.window);
		if (this.body.clientWidth > 0) {
			this.state = 'open';
			this.resize();
			this.requestRendering();
		} else {
			this.state = 'suspended';
		}
	}
};

Sprite.updateTargetInfo = function () {
	const { target } = this;
	if (target) {
		const x = target.spriteX;
		const y = target.spriteY;
		const uw = this.unitWidth;
		const uh = this.unitHeight;
		this.info.textContent = `${x},${y} [${uw}x${uh}]`;
	}
};

Sprite.resize = function () {
	if (this.state === 'open') {
		const scale = this.scale;
		const scaledUnitWidth = Math.round(this.unitWidth * scale);
		const scaledUnitHeight = Math.round(this.unitHeight * scale);
		const innerWidth = this.hframes * scaledUnitWidth;
		const innerHeight = this.vframes * scaledUnitHeight;
		const screenBox = CSS.getDevicePixelContentBoxSize(this.screen);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;
		const paddingLeft = Math.max((screenWidth - innerWidth) >> 1, 0);
		const paddingTop = Math.max((screenHeight - innerHeight) >> 1, 0);
		const outerWidth = Math.max(innerWidth, screenWidth);
		const outerHeight = Math.max(innerHeight, screenHeight);
		const dpr = window.devicePixelRatio;
		this.scaleX = scaledUnitWidth / this.unitWidth;
		this.scaleY = scaledUnitHeight / this.unitHeight;
		this.scaledUnitWidth = scaledUnitWidth;
		this.scaledUnitHeight = scaledUnitHeight;
		this.outerWidth = outerWidth;
		this.outerHeight = outerHeight;
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.centerOffsetX =
			outerWidth > screenWidth ? screenWidth / 2 : paddingLeft + innerWidth / 2;
		this.centerOffsetY =
			outerHeight > screenHeight ? screenHeight / 2 : paddingTop + innerHeight / 2;
		this.paddingLeft = paddingLeft;
		this.paddingTop = paddingTop;

		this.marquee.style.left = `${paddingLeft / dpr}px`;
		this.marquee.style.top = `${paddingTop / dpr}px`;
		this.marquee.style.width = `${innerWidth / dpr}px`;
		this.marquee.style.height = `${innerHeight / dpr}px`;
		this.marquee.scaleX = scaledUnitWidth / dpr;
		this.marquee.scaleY = scaledUnitHeight / dpr;

		if (this.marquee.visible) {
			this.marquee.select();
		} else {
			const target = this.target;
			const hindex = target.spriteX;
			const vindex = target.spriteY;
			this.centerX = hindex + 0.5;
			this.centerY = vindex + 0.5;
			this.marquee.select(hindex, vindex, 1, 1);
			this.updateTargetInfo();
		}

		const canvasWidth = Math.min(innerWidth, screenWidth);
		const canvasHeight = Math.min(innerHeight, screenHeight);
		this.canvas.style.left = `${paddingLeft / dpr}px`;
		this.canvas.style.top = `${paddingTop / dpr}px`;
		if (
			this.canvas.dpr !== dpr ||
			this.canvas.width !== canvasWidth ||
			this.canvas.height !== canvasHeight
		) {
			this.canvas.dpr = dpr;
			this.canvas.width = canvasWidth;
			this.canvas.height = canvasHeight;
			this.canvas.style.width = `${canvasWidth / dpr}px`;
			this.canvas.style.height = `${canvasHeight / dpr}px`;
			this.context.imageSmoothingEnabled = false;
		}
		this.updateCamera();
		this.updateTransform();
		this.screen.updateScrollbars();
	}
};

Sprite.getUnitCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: typeof Sprite, event: any) {
		const coords = event.getRelativeCoords(this.marquee);
		const suw = this.scaledUnitWidth;
		const suh = this.scaledUnitHeight;
		const dpr = window.devicePixelRatio;
		point.x = Math.clamp(Math.floor((coords.x * dpr) / suw), 0, this.hframes - 1);
		point.y = Math.clamp(Math.floor((coords.y * dpr) / suh), 0, this.vframes - 1);
		return point;
	};
})();

Sprite.updateCamera = function (this: typeof Sprite, x = this.centerX, y = this.centerY) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const scrollX = x * this.scaledUnitWidth + this.paddingLeft;
	const scrollY = y * this.scaledUnitHeight + this.paddingTop;
	const toleranceX = this.scaledUnitWidth * 0.0001;
	const toleranceY = this.scaledUnitHeight * 0.0001;
	screen.rawScrollLeft =
		Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - this.screenWidth) / dpr;
	screen.rawScrollTop =
		Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - this.screenHeight) / dpr;
	screen.scrollLeft = (scrollX - (this.screenWidth >> 1) + toleranceX) / dpr;
	screen.scrollTop = (scrollY - (this.screenHeight >> 1) + toleranceY) / dpr;
};

Sprite.updateTransform = function () {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const left = Math.roundTo(screen.scrollLeft * dpr, 4);
	const top = Math.roundTo(screen.scrollTop * dpr, 4);
	const right = left + this.canvas.width;
	const bottom = top + this.canvas.height;
	this.scrollLeft = left;
	this.scrollTop = top;
	this.scrollRight = right;
	this.scrollBottom = bottom;
	this.context.setTransform(1, 0, 0, 1, -left, -top);
	const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX;
	const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY;
	this.centerX = Math.roundTo((scrollX - this.paddingLeft) / this.scaledUnitWidth, 4);
	this.centerY = Math.roundTo((scrollY - this.paddingTop) / this.scaledUnitHeight, 4);
};

Sprite.updateBackground = Palette.updateBackground;

Sprite.drawSprite = function () {
	if (this.body.clientWidth > 0 && this.canvas.width !== 0 && this.canvas.height !== 0) {
		const context = this.context;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		context.clearRect(sl, st, sr - sl, sb - st);

		this.drawSpriteLayer();
		this.drawGridLayer();
	}
};

Sprite.drawSpriteLayer = function () {
	const context = this.context;
	const image = this.image;
	const scaleX = this.scaleX;
	const scaleY = this.scaleY;
	const dx = this.scrollLeft;
	const dy = this.scrollTop;
	const dw = this.scrollRight - dx;
	const dh = this.scrollBottom - dy;
	const sx = dx / scaleX;
	const sy = dy / scaleY;
	const sw = dw / scaleX;
	const sh = dh / scaleY;
	context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
};

Sprite.drawGridLayer = function () {
	if (this.showGrid) {
		const context = this.context;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const uw = this.scaledUnitWidth;
		const uh = this.scaledUnitHeight;
		const bx = Math.floor(sl / uw + 1) * uw;
		const by = Math.floor(st / uh + 1) * uh;
		const ex = Math.ceil(sr / uw) * uw;
		const ey = Math.ceil(sb / uh) * uh;
		context.beginPath();
		for (let y = by; y < ey; y += uh) {
			context.moveTo(sl, y + 0.5);
			context.lineTo(sr, y + 0.5);
		}
		for (let x = bx; x < ex; x += uw) {
			context.moveTo(x + 0.5, st);
			context.lineTo(x + 0.5, sb);
		}
		context.lineWidth = 1;
		context.strokeStyle = this.gridColor;
		context.stroke();
	}
};

Sprite.selectSprite = function (hindex: any, vindex: any) {
	const target = this.target;
	if (target !== null) {
		this.marquee.select(hindex, vindex, 1, 1);
		Animation.planToSave();
		const x = Animation.timelineMarquee.x;
		const history = Animation.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'animation-target-index';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				motion: Animation.motion,
				direction: Animation.direction,
				target: target,
				hindex: target.spriteX,
				vindex: target.spriteY
			});
		}
		target.spriteX = hindex;
		target.spriteY = vindex;
		this.updateTargetInfo();
		Animation.loadFrames(x);
		Animation.requestRendering();
	}
};

Sprite.scrollToSelection = function () {
	const marquee = this.marquee;
	if (marquee.visible) {
		const suw = this.scaledUnitWidth;
		const suh = this.scaledUnitHeight;
		const mx = marquee.x;
		const my = marquee.y;
		const mr = marquee.width + mx;
		const mb = marquee.height + my;
		const wh = this.screenWidth / suw / 2;
		const hh = this.screenHeight / suh / 2;
		const toleranceX = 0.5 / suw;
		const toleranceY = 0.5 / suh;
		const x1 = mr - wh + toleranceX;
		const x2 = mx + wh - toleranceX;
		const y1 = mb - hh + toleranceY;
		const y2 = my + hh - toleranceY;
		const x = Math.min(Math.max(this.centerX, x1), x2);
		const y = Math.min(Math.max(this.centerY, y1), y2);
		if (this.centerX !== x || this.centerY !== y) {
			this.updateCamera(x, y);
			this.updateTransform();
			this.requestRendering();
			this.screen.updateScrollbars();
		}
	}
};

Sprite.requestRendering = function () {
	if (this.state === 'open') {
		Timer.appendUpdater!('sharedRendering', this.renderingFunction);
	}
};

Sprite.renderingFunction = function () {
	Sprite.drawSprite();
};

Sprite.stopRendering = function () {
	Timer.removeUpdater!('sharedRendering', this.renderingFunction);
};

Sprite.saveToProject = function (project: any) {
	const { sprite } = project;
	const zoom = this.zoom;
	if (zoom !== null) {
		sprite.zoom = zoom;
	}
};

Sprite.loadFromProject = function (project: any) {
	const { sprite } = project;
	this.setZoom(sprite.zoom);
};

Sprite.windowResize = function (this: typeof Sprite, event: any) {
	if (this.body.clientWidth === 0) {
		return this.suspend();
	}
	switch (this.state) {
		case 'open':
			this.resize();
			this.requestRendering();
			break;
		case 'suspended':
			this.resume();
			break;
	}
}.bind(Sprite);

Sprite.themechange = function (this: typeof Sprite, event: any) {
	switch (event.value) {
		case 'light':
			this.gridColor = 'rgba(0, 0, 0, 0.5)';
			break;
		case 'dark':
			this.gridColor = 'rgba(255, 255, 255, 0.5)';
			break;
	}
	this.requestRendering();
}.bind(Sprite);

Sprite.zoomFocus = function (event: any) {
	Sprite.screen.focus();
};

Sprite.zoomInput = function (this: any, event: any) {
	Sprite.setZoom(read(this));
};

Sprite.screenKeydown = function (event: any) {
	if (Sprite.state === 'open' && Sprite.dragging === null) {
		switch (event.code) {
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown': {
				let offsetX = 0;
				let offsetY = 0;
				switch (event.code) {
					case 'ArrowLeft':
						offsetX = -1;
						break;
					case 'ArrowUp':
						offsetY = -1;
						break;
					case 'ArrowRight':
						offsetX = +1;
						break;
					case 'ArrowDown':
						offsetY = +1;
						break;
				}
				const marquee = Sprite.marquee;
				const x = Math.clamp(marquee.x + offsetX, 0, Sprite.hframes - 1);
				const y = Math.clamp(marquee.y + offsetY, 0, Sprite.vframes - 1);
				if (marquee.x !== x || marquee.y !== y) {
					Sprite.selectSprite(x, y);
					Sprite.scrollToSelection();
				}
				break;
			}
			case 'Minus':
			case 'NumpadSubtract':
				Sprite.setZoom(Sprite.zoom - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				Sprite.setZoom(Sprite.zoom + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				Sprite.setZoom(2);
				break;
		}
	}
};

Sprite.screenWheel = function (this: typeof Sprite, event: any) {
	event.preventDefault();
	if (event.deltaY !== 0 && this.dragging === null) {
		this.setZoom(this.zoom + (event.deltaY > 0 ? -1 : 1));
	}
}.bind(Sprite);

Sprite.screenUserscroll = function (this: typeof Sprite, event: any) {
	if (this.state === 'open') {
		this.screen.rawScrollLeft = this.screen.scrollLeft;
		this.screen.rawScrollTop = this.screen.scrollTop;
		this.updateTransform();
		this.updateBackground();
		this.requestRendering();
		this.screen.updateScrollbars();
	}
}.bind(Sprite);

Sprite.marqueePointerdown = function (this: typeof Sprite, event: any) {
	// 优先触发检查器输入框的blur事件
	if ((Inspector.manager as any).focusing) {
		document.activeElement!.blur();
	}
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (event.dragKey) {
				this.dragging = event;
				event.mode = 'scroll';
				event.scrollLeft = this.screen.scrollLeft;
				event.scrollTop = this.screen.scrollTop;
				(Cursor.open as any)('cursor-grab');
				window.on('pointerup', this.pointerup);
				window.on('pointermove', this.pointermove);
				return;
			}
			const { x, y } = this.getUnitCoords(event);
			const { marquee } = this;
			if (!marquee.visible || marquee.x !== x || marquee.y !== y) {
				this.selectSprite(x, y);
			}
			break;
		}
		case 2:
			this.dragging = event;
			event.mode = 'scroll';
			event.scrollLeft = this.screen.scrollLeft;
			event.scrollTop = this.screen.scrollTop;
			(Cursor.open as any)('cursor-grab');
			window.on('pointerup', this.pointerup);
			window.on('pointermove', this.pointermove);
			break;
	}
}.bind(Sprite);

Sprite.pointerup = function (this: typeof Sprite, event: any) {
	const { dragging } = this;
	if (dragging.relate(event)) {
		switch (dragging.mode) {
			case 'scroll':
				this.screen.endScrolling();
				(Cursor.close as any)('cursor-grab');
				break;
		}
		this.dragging = null;
		window.off('pointerup', this.pointerup);
		window.off('pointermove', this.pointermove);
	}
}.bind(Sprite);

Sprite.pointermove = function (this: typeof Sprite, event: any) {
	const { dragging } = this;
	if (dragging.relate(event)) {
		switch (dragging.mode) {
			case 'scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				this.screen.beginScrolling();
				this.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				break;
			}
		}
	}
}.bind(Sprite);
