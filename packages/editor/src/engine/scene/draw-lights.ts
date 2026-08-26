import { Scene } from '@app/scene/scene-window.ts';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

export const drawLightTextures = function (this: typeof Scene) {
	if (this.showLight) {
		const gl = GL;
		const ambient = this.ambient;
		const ambientRed = ambient.red / 255;
		const ambientGreen = ambient.green / 255;
		const ambientBlue = ambient.blue / 255;
		const ambientDirect = ambient.direct;
		const cx = gl.reflectedLightMap.clipX;
		const cy = gl.reflectedLightMap.clipY;
		const cw = gl.reflectedLightMap.clipWidth;
		const ch = gl.reflectedLightMap.clipHeight;
		gl.bindFBO(gl.reflectedLightMap.fbo);
		gl.setViewport(cx, cy, cw, ch);
		gl.clearColor(ambientRed, ambientGreen, ambientBlue, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		const queue = gl.arrays[1].uint16;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const twh = tw / 2;
		const vs = tw / th;
		const sl = this.lightLeft;
		const st = this.lightTop;
		const sr = this.lightRight;
		const sb = this.lightBottom;
		const lights = this.lights;
		const length = lights.length;
		let qi0 = 0;
		let qi1 = 0;
		let qi2 = 0;
		let qi3 = 0;
		for (let i = 0; i < length; i++) {
			const light = lights[i];
			if (light.hidden) continue;
			const ox = light.x * tw;
			const oy = light.y * th;
			switch (light.type) {
				case 'point': {
					const hr = light.range * twh;
					const px = ox < sl ? sl : ox > sr ? sr : ox;
					const py = oy < st ? st : oy > sb ? sb : oy;
					if ((px - ox) ** 2 + ((py - oy) * vs) ** 2 < hr ** 2) {
						switch (light.blend) {
							case 'max':
								queue[qi0++] = i;
								continue;
							case 'screen':
								queue[qi1++ | 0x10000] = i;
								continue;
							case 'additive':
								queue[qi2++ | 0x20000] = i;
								continue;
							case 'subtract':
								queue[qi3++ | 0x30000] = i;
								continue;
						}
					}
					continue;
				}
				case 'area': {
					const instance = light.instance;
					const ml = ox + instance.measureOffsetX * tw;
					const mt = oy + instance.measureOffsetY * th;
					const mr = ml + instance.measureWidth * tw;
					const mb = mt + instance.measureHeight * th;
					if (ml < sr && mt < sb && mr > sl && mb > st) {
						switch (light.blend) {
							case 'max':
								queue[qi0++] = i;
								continue;
							case 'screen':
								queue[qi1++ | 0x10000] = i;
								continue;
							case 'additive':
								queue[qi2++ | 0x20000] = i;
								continue;
							case 'subtract':
								queue[qi3++ | 0x30000] = i;
								continue;
						}
					}
					continue;
				}
			}
		}
		const count = qi0 + qi1 + qi2 + qi3;
		if (count !== 0) {
			for (let i = 0; i < qi1; i++) {
				queue[qi0 + i] = queue[i | 0x10000];
			}
			for (let i = 0; i < qi2; i++) {
				queue[qi0 + qi1 + i] = queue[i | 0x20000];
			}
			for (let i = 0; i < qi3; i++) {
				queue[qi0 + qi1 + qi2 + i] = queue[i | 0x30000];
			}
		}
		if (count !== 0) {
			const projMatrix = Matrix.instance
				.project(gl.flip, sr - sl, sb - st)
				.translate(-sl, -st)
				.scale(tw, th);
			for (let i = 0; i < count; i++) {
				const light = lights[queue[i]];
				light.instance.draw(projMatrix, 1);
			}
			gl.blend = 'normal';
		}
		gl.resetViewport();
		const directRed = ambientRed * ambientDirect;
		const directGreen = ambientGreen * ambientDirect;
		const directBlue = ambientBlue * ambientDirect;
		// 避免使用直射光纹理
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFBO(gl.directLightMap.fbo);
		gl.clearColor(directRed, directGreen, directBlue, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		if (count !== 0) {
			const sl = this.scrollLeft;
			const st = this.scrollTop;
			const sr = this.scrollRight;
			const sb = this.scrollBottom;
			const projMatrix = Matrix.instance
				.project(gl.flip, sr - sl, sb - st)
				.translate(-sl, -st)
				.scale(tw, th);
			for (let i = 0; i < count; i++) {
				const light = lights[queue[i]];
				light.instance.draw(projMatrix, light.direct);
			}
			gl.blend = 'normal';
		}
		gl.unbindFBO();
	}
};

export const drawLightWireframe = function (this: typeof Scene) {
	if (this.target?.class === 'light') {
		const light = this.target;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		switch (light.type) {
			case 'point': {
				const ox = light.x * tw;
				const oy = light.y * th;
				const hr = (light.range / 2) * tw;
				const vs = tw / th;
				const px = ox < sl ? sl : ox > sr ? sr : ox;
				const py = oy < st ? st : oy > sb ? sb : oy;
				if ((px - ox) ** 2 + ((py - oy) * vs) ** 2 < hr ** 2) {
					const vr = (light.range / 2) * th;
					this.drawOvalWireframe!(ox, oy, hr, vr, 0xffffffff);
					this.drawTargetAnchor!(light, 0);
				}
				break;
			}
			case 'area': {
				const instance = light.instance;
				const ax = light.x;
				const ay = light.y;
				const ox = light.x * tw;
				const oy = light.y * th;
				const ml = ox + instance.measureOffsetX * tw;
				const mt = oy + instance.measureOffsetY * th;
				const mr = ml + instance.measureWidth * tw;
				const mb = mt + instance.measureHeight * th;
				if (ml < sr && mt < sb && mr > sl && mb > st) {
					const rl = light.x - instance.anchorOffsetX;
					const rt = light.y - instance.anchorOffsetY;
					const rw = light.width;
					const rh = light.height;
					const angle = instance.angle;
					this.drawRectWireframeOnTilemap!(rl, rt, rw, rh, ax, ay, angle);
					this.drawTargetAnchor!(light, angle);
				}
				break;
			}
		}
	}
};
