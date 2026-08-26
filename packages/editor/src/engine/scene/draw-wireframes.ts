import { INTRGBA } from '@app/utils/color-utils';
import { Data } from '@app/data/data-object.ts';
import { Scene } from '@app/scene/scene-window.ts';

export const drawTilemapWireframe = function (this: typeof Scene) {
	if (this.target?.class === 'tilemap') {
		const tilemap = this.target;
		const anchor = this.getParallaxAnchor!(tilemap);
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const mx = tilemap.x;
		const my = tilemap.y;
		const mw = tilemap.width;
		const mh = tilemap.height;
		const ox = tilemap.offsetX;
		const oy = tilemap.offsetY;
		const pw = mw * tw;
		const ph = mh * th;
		const ax = tilemap.anchorX * pw;
		const ay = tilemap.anchorY * ph;
		const dl = anchor.x - ax + ox;
		const dt = anchor.y - ay + oy;
		const dr = dl + pw;
		const db = dt + ph;
		if (dl < sr && dt < sb && dr > sl && db > st) {
			const ml = dl / tw;
			const mt = dt / th;
			this.drawRectWireframeOnTilemap!(ml, mt, mw, mh, mx, my, 0);
			this.drawTargetAnchor!(tilemap, 0);
		}
	}
};

export const drawAnimationWireframe = function (this: typeof Scene) {
	switch (this.target?.class) {
		case 'actor':
		case 'animation': {
			const target = this.target;
			const data = target.data;
			if (data === undefined) {
				return;
			}
			const sl = this.scrollLeft;
			const st = this.scrollTop;
			const sr = this.scrollRight;
			const sb = this.scrollBottom;
			const tw = this.tileWidth;
			const th = this.tileHeight;
			const ax = target.x;
			const ay = target.y;
			const as = target.class === 'actor' ? Math.max(data.size * target.player.scale, 1) : 1;
			const ar = as / 2;
			const ml = (ax - ar) * tw;
			const mt = (ay - ar) * th;
			const mr = (ax + ar) * tw;
			const mb = (ay + ar) * th;
			if (mr > sl && ml < sr && mb > st && mt < sb) {
				this.drawRectWireframeOnTilemap!(ax - ar, ay - ar, as, as, ax, ay, 0);
			}
			break;
		}
	}
};

export const drawAnimationAnchor = function (this: typeof Scene) {
	switch (this.target?.class) {
		case 'actor': {
			const team = Data.teams.map[this.target.teamId];
			const color = INTRGBA(team?.color ?? 'ffffffff');
			this.drawTargetAnchor!(this.target, 0, color);
			break;
		}
		case 'animation':
			this.drawTargetAnchor!(this.target, 0);
			break;
	}
};

export const drawRegionWireframe = function (this: typeof Scene) {
	if (this.target?.class === 'region') {
		const region = this.target;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const rx = region.x;
		const ry = region.y;
		const rw = region.width;
		const rh = region.height;
		const rl = rx - rw / 2;
		const rt = ry - rh / 2;
		const dl = rl * tw;
		const dt = rt * th;
		const dr = (rl + rw) * tw;
		const db = (rt + rh) * th;
		if (dl < sr && dt < sb && dr > sl && db > st) {
			this.drawRectWireframeOnTilemap!(rl, rt, rw, rh, rx, ry, 0);
			this.drawTargetAnchor!(region, 0);
		}
	}
};

export const drawParticleEmitterWireframe = function (this: typeof Scene) {
	if (this.target?.class === 'particle') {
		const particle = this.target;
		const rect = particle.emitter?.bounding;
		const angle = Math.radians(particle.angle);
		if (rect?.hasArea) {
			const coords = this.getConvertedCoords!(particle);
			const ax = coords.x;
			const ay = coords.y;
			const rl = ax + rect.left * particle.scale;
			const rt = ay + rect.top * particle.scale;
			const rr = ax + rect.right * particle.scale;
			const rb = ay + rect.bottom * particle.scale;
			this.drawRectWireframe!(rl, rt, rr, rb, ax, ay, angle);
		}
		this.drawTargetAnchor!(particle, angle);
	}
};

export const drawParallaxWireframe = function (this: typeof Scene) {
	if (this.target?.class === 'parallax') {
		const parallax = this.target;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const texture = parallax.player.texture;
		const width = texture?.width ?? 128;
		const height = texture?.height ?? 128;
		const anchor = this.getParallaxAnchor!(parallax);
		const pw = parallax.scaleX * parallax.repeatX * width;
		const ph = parallax.scaleY * parallax.repeatY * height;
		const ox = parallax.offsetX;
		const oy = parallax.offsetY;
		const ax = parallax.anchorX * pw;
		const ay = parallax.anchorY * ph;
		const dl = anchor.x - ax + ox;
		const dt = anchor.y - ay + oy;
		const dr = dl + pw;
		const db = dt + ph;
		if (dl < sr && dt < sb && dr > sl && db > st) {
			const { x, y } = this.getConvertedCoords!(parallax);
			this.drawRectWireframe!(dl, dt, dr, db, x, y, 0);
			this.drawTargetAnchor!(parallax, 0);
		}
	}
};
