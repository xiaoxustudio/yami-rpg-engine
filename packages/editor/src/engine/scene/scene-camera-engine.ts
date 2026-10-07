import { screenScrollData } from '../screen-scroll-data';
import { getRelativeCoords } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { clamp, roundTo } from '@app/utils/math';

type ScenePoint = { x: number; y: number };

type RasterizeScrollThis = Pick<
	typeof Scene,
	'scaleX' | 'scaleY' | 'scrollLeft' | 'scrollTop' | 'scrollRight' | 'scrollBottom'
>;

type SceneCameraEngineShape = {
	getTileCoords: (this: typeof Scene, event: WheelEvent, integer?: boolean) => ScenePoint;
	getConvertedCoords: (tile: ScenePoint) => ScenePoint;
	getParallaxAnchor: (
		this: typeof Scene,
		parallax: ScenePoint & { parallaxFactorX: number; parallaxFactorY: number },
		tiled?: boolean
	) => ScenePoint;
	getGridContext: (this: typeof Scene) => {
		width: number;
		height: number;
		offsetX: number;
		offsetY: number;
	};
	rasterizeScrollPosition: (
		this: RasterizeScrollThis,
		ox: number,
		oy: number
	) => { left: number; top: number; right: number; bottom: number };
	updateLightTexParameters: (this: typeof Scene) => void;
	updateCamera: (this: typeof Scene, x?: number, y?: number) => void;
	updateTransform: (this: typeof Scene) => void;
};

export const SceneCameraEngine: SceneCameraEngineShape = {} as SceneCameraEngineShape;
SceneCameraEngine.getTileCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: typeof Scene, event: WheelEvent, integer = false) {
		const coords = getRelativeCoords(event, this.marquee);
		const stw = this.scaledTileWidth;
		const sth = this.scaledTileHeight;
		const dpr = window.devicePixelRatio;
		let sx = coords.x * dpr - this.paddingLeft;
		let sy = coords.y * dpr - this.paddingTop;
		if (this.layer === 'tilemap') {
			const context = this.getGridContext();
			sx -= context.offsetX * this.scaleX;
			sy -= context.offsetY * this.scaleY;
		}
		let x = sx / stw;
		let y = sy / sth;
		if (integer) {
			x = Math.floor(x);
			y = Math.floor(y);
		}
		point.x = x;
		point.y = y;
		return point;
	};
})();

SceneCameraEngine.getConvertedCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return (tile: { x: number; y: number }) => {
		point.x = tile.x * Scene.tileWidth;
		point.y = tile.y * Scene.tileHeight;
		return point;
	};
})();

SceneCameraEngine.getParallaxAnchor = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (
		this: typeof Scene,
		parallax: { x: number; y: number; parallaxFactorX: number; parallaxFactorY: number },
		tiled = false
	) {
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const cx = this.scrollCenterX;
		const cy = this.scrollCenterY;
		const px = parallax.x * tw;
		const py = parallax.y * th;
		const fx = parallax.parallaxFactorX;
		const fy = parallax.parallaxFactorY;
		const ax = cx + fx * (px - cx);
		const ay = cy + fy * (py - cy);
		if (tiled) {
			point.x = ax / tw;
			point.y = ay / th;
		} else {
			point.x = ax;
			point.y = ay;
		}
		return point;
	};
})();

SceneCameraEngine.getGridContext = (function IIFE() {
	const context = { width: 0, height: 0, offsetX: 0, offsetY: 0 };
	return function (this: typeof Scene) {
		if (this.layer === 'tilemap') {
			const tilemap = this.tilemap;
			const anchor = this.getParallaxAnchor(tilemap);
			const tw = this.tileWidth;
			const th = this.tileHeight;
			const mw = tilemap.width;
			const mh = tilemap.height;
			const ox = tilemap.offsetX;
			const oy = tilemap.offsetY;
			const ax = tilemap.anchorX * mw * tw;
			const ay = tilemap.anchorY * mh * th;
			context.width = mw;
			context.height = mh;
			context.offsetX = anchor.x - ax + ox;
			context.offsetY = anchor.y - ay + oy;
		} else {
			context.width = this.width;
			context.height = this.height;
			context.offsetX = 0;
			context.offsetY = 0;
		}
		return context;
	};
})();

SceneCameraEngine.rasterizeScrollPosition = (function IIFE() {
	const scroll = { left: 0, top: 0, right: 0, bottom: 0 };
	return function (this: RasterizeScrollThis, ox: number, oy: number) {
		const sx = this.scaleX;
		const sy = this.scaleY;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		scroll.left = Math.round((sl + ox) * sx) / sx;
		scroll.top = Math.round((st + oy) * sy) / sy;
		scroll.right = scroll.left + sr - sl;
		scroll.bottom = scroll.top + sb - st;
		return scroll;
	};
})();

SceneCameraEngine.updateLightTexParameters = function (this: typeof Scene) {
	const light = Data.config.lightArea;
	const texture = GL.reflectedLightMap;
	const scaleX = this.scaleX;
	const scaleY = this.scaleY;
	if (texture.scaleX !== scaleX || texture.scaleY !== scaleY) {
		texture.scaleX = scaleX;
		texture.scaleY = scaleY;
		const { ceil, min } = Math;
		const pl = texture.paddingLeft;
		const pt = texture.paddingTop;
		const pr = texture.paddingRight;
		const pb = texture.paddingBottom;
		const el = ceil(min(light.expansionLeft * scaleX, pl));
		const et = ceil(min(light.expansionTop * scaleY, pt));
		const er = ceil(min(light.expansionRight * scaleX, pr));
		const eb = ceil(min(light.expansionBottom * scaleY, pb));
		texture.expansionLeft = el / scaleX;
		texture.expansionTop = et / scaleY;
		texture.expansionRight = er / scaleX;
		texture.expansionBottom = eb / scaleY;
		texture.maxExpansionLeft = pl / scaleX;
		texture.maxExpansionTop = pt / scaleY;
		texture.maxExpansionRight = pr / scaleX;
		texture.maxExpansionBottom = pb / scaleY;
		texture.clipX = pl - el;
		texture.clipY = pt - et;
		texture.clipWidth = GL.width + el + er;
		texture.clipHeight = GL.height + et + eb;
	}
};

SceneCameraEngine.updateCamera = function (this: typeof Scene, x = this.meta.x, y = this.meta.y) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const scrollX = x * this.scaledTileWidth + this.paddingLeft;
	const scrollY = y * this.scaledTileHeight + this.paddingTop;
	const toleranceX = this.scaledTileWidth * 0.0001;
	const toleranceY = this.scaledTileHeight * 0.0001;
	screenScrollData(screen).rawScrollLeft =
		clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - GL.width) / dpr;
	screenScrollData(screen).rawScrollTop =
		clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - GL.height) / dpr;
	screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceX) / dpr;
	screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceY) / dpr;
};

SceneCameraEngine.updateTransform = function (this: typeof Scene) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const left = roundTo(screen.scrollLeft * dpr - this.paddingLeft, 4);
	const top = roundTo(screen.scrollTop * dpr - this.paddingTop, 4);
	const right = left + GL.width;
	const bottom = top + GL.height;
	const scaleX = this.scaleX;
	const scaleY = this.scaleY;
	const lightmap = GL.reflectedLightMap;
	this.scrollLeft = left / scaleX;
	this.scrollTop = top / scaleY;
	this.scrollRight = right / scaleX;
	this.scrollBottom = bottom / scaleY;
	this.scrollCenterX = (this.scrollLeft + this.scrollRight) / 2;
	this.scrollCenterY = (this.scrollTop + this.scrollBottom) / 2;
	this.lightLeft = this.scrollLeft - lightmap.expansionLeft;
	this.lightTop = this.scrollTop - lightmap.expansionTop;
	this.lightRight = this.scrollRight + lightmap.expansionRight;
	this.lightBottom = this.scrollBottom + lightmap.expansionBottom;
	this.matrix.reset().scale(scaleX, scaleY).translate(-this.scrollLeft, -this.scrollTop);
	const scrollX = screenScrollData(screen).rawScrollLeft * dpr + this.centerOffsetX;
	const scrollY = screenScrollData(screen).rawScrollTop * dpr + this.centerOffsetY;
	this.meta.x = roundTo((scrollX - this.paddingLeft) / this.scaledTileWidth, 4);
	this.meta.y = roundTo((scrollY - this.paddingTop) / this.scaledTileHeight, 4);
	Data.manifest.changed = true;
};
