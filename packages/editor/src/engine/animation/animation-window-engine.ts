import { getAnimationStore } from '@app/stores/animation';
import type { Animation } from '@app/animation/animation-window.ts';
import { Timer } from '@app/utils/timer';
import { UI } from '@app/ui/ui-window.ts';
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import type { ParticleEmitterShape } from '@app/particle/particle-window.ts';

// oxlint-disable-next-line no-explicit-any
export const AnimationWindowEngine: Record<string, any> = {};

let animationWindow = null as unknown as typeof Animation;

export function bindAnimationWindow(instance: typeof Animation): void {
	animationWindow = instance;
}

type AnimationFrame = {
	start: number;
	end: number;
	rotation?: number;
	easingId?: string;
	x?: number;
	y?: number;
	key?: HTMLElement & { easing?: boolean };
	[k: string]: unknown;
};
type AnimationContext = {
	layer: { class: string; sprite: string; [k: string]: unknown };
	frame: AnimationFrame;
	matrix: number[];
	anchorX: number;
	anchorY: number;
	pivotX: number;
	pivotY: number;
	emitter?: ParticleEmitterShape;
	parent: AnimationContext | null;
	[k: string]: unknown;
};

AnimationWindowEngine.updateCamera = function (
	this: typeof Animation,
	x = this.centerX,
	y = this.centerY
) {
	const screen = this.screen;
	const dpr = window.devicePixelRatio;
	const scrollX = x * this.scaleX + this.outerWidth / 2;
	const scrollY = y * this.scaleY + this.outerHeight / 2;
	const toleranceForDPR = 0.0001;
	screen.rawScrollLeft =
		Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - GL.width) / dpr;
	screen.rawScrollTop =
		Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - GL.height) / dpr;
	screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceForDPR) / dpr;
	screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceForDPR) / dpr;
};

AnimationWindowEngine.updateTransform = function (this: typeof Animation) {
	const screen = this.screen;
	const dpr = window.devicePixelRatio;
	const left = Math.roundTo(screen.scrollLeft * dpr - (this.outerWidth >> 1), 4);
	const top = Math.roundTo(screen.scrollTop * dpr - (this.outerHeight >> 1), 4);
	const right = left + GL.width;
	const bottom = top + GL.height;
	this.scrollLeft = left / this.scaleX;
	this.scrollTop = top / this.scaleY;
	this.scrollRight = right / this.scaleX;
	this.scrollBottom = bottom / this.scaleY;
	this.updateMatrix!();
	const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX;
	const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY;
	this.centerX = Math.roundTo((scrollX - this.outerWidth / 2) / this.scaleX, 4);
	this.centerY = Math.roundTo((scrollY - this.outerHeight / 2) / this.scaleY, 4);
};

AnimationWindowEngine.updateMatrix = function (this: typeof Animation) {
	const matrix = this.matrix
		.reset()
		.scale(this.scaleX, this.scaleY)
		.translate(-this.scrollLeft, -this.scrollTop);
	if (getAnimationStore().mirror) {
		matrix.mirrorh();
	}
};

AnimationWindowEngine.drawBackground = function (this: typeof Animation) {
	const gl = GL;
	gl.clearColor(...this.background.getGLRGBA());
	gl.clear(gl.COLOR_BUFFER_BIT);
};

AnimationWindowEngine.drawOnionskins = function (this: typeof Animation) {
	if (getAnimationStore().showOnionskin) {
		GL.alpha = 0.25;
		const { prev, next } = this.player.onionskin;
		this.drawSpriteLayers!(prev);
		this.drawSpriteLayers!(next);
		GL.alpha = 1;
	}
};

AnimationWindowEngine.drawSpriteLayers = function (
	this: typeof Animation,
	contexts = this.player.contexts
) {
	const { player } = this;
	const { count } = contexts;
	const gl = GL;
	let ready = false;
	for (let i = 0; i < count; i++) {
		const context = contexts[i];
		const { layer, frame } = context;
		if (layer.class === 'sprite' && !layer.hidden && frame !== null) {
			const key = layer.sprite;
			const texture = player.textures[key];
			if (texture instanceof ImageTexture) {
				if (!ready) {
					ready = true;
					const program = gl.spriteProgram.use();
					const matrix = gl.matrix
						.project(gl.flip, gl.width, gl.height)
						.multiply(animationWindow.matrix);
					gl.batchRenderer.setAttrSize(8);
					gl.bindVertexArray(program.vao);
					gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
					gl.uniform4f(program.u_Tint, 0, 0, 0, 0);
				}
				player.drawSprite(context, texture, 'raw');
			}
		}
	}
	gl.batchRenderer.draw();
};

AnimationWindowEngine.drawEmitters = function (this: typeof Animation) {
	if (!getAnimationStore().showMark) return;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const matrix = gl.matrix;
	const { contexts } = this.player;
	const { count } = contexts;
	for (let i = 0; i < count; i++) {
		const context = contexts[i];
		const { layer, frame } = context;
		if (layer.class === 'particle' && !layer.hidden && frame !== null) {
			matrix.set(animationWindow.matrix).multiply(context.matrix);
			let vi = 0;
			const x = matrix[6];
			const y = matrix[7];
			const scale = Math.min(this.scale, 1);
			const innerRadius = 6 * scale;
			const outerRadius = 20 * scale;
			const angleCount = 8;
			const step = (Math.PI * 2) / angleCount;
			vertices[vi++] = x;
			vertices[vi++] = y;
			for (let i = 0; i < angleCount; i++) {
				const angle1 = i * step - Math.PI / 2;
				const angle2 = angle1 + step / 2;
				vertices[vi] = x + outerRadius * Math.cos(angle1);
				vertices[vi + 1] = y + outerRadius * Math.sin(angle1);
				vertices[vi + 2] = x + innerRadius * Math.cos(angle2);
				vertices[vi + 3] = y + innerRadius * Math.sin(angle2);
				vi += 4;
			}
			vertices[vi++] = vertices[2];
			vertices[vi++] = vertices[3];
			const program = gl.graphicProgram.use();
			matrix.project(gl.flip, gl.width, gl.height);
			gl.bindVertexArray(program.vao.a10);
			gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
			switch (frame) {
				case getAnimationStore().target:
					gl.vertexAttrib4f(program.a_Color, 0, 1, 1, 1);
					break;
				case this.hover:
					gl.vertexAttrib4f(program.a_Color, 0.75, 1, 1, 1);
					break;
				default:
					gl.vertexAttrib4f(program.a_Color, 0.75, 1, 0.75, 1);
					break;
			}
			gl.drawArrays(gl.TRIANGLE_FAN, 0, vi / 2);
		}
	}
};

AnimationWindowEngine.emitParticles = function (this: typeof Animation, deltaTime: number) {
	const { player } = this;
	const { contexts } = player;
	const { count } = contexts;
	for (let i = 0; i < count; i++) {
		const context = contexts[i];
		const { layer } = context;
		if (layer.class === 'particle' && !layer.hidden) {
			const { frame, emitter } = context;
			if (frame !== null && emitter !== undefined) {
				switch (layer.angle) {
					case 'default':
						emitter.angle = 0;
						break;
					case 'inherit': {
						const { matrix } = context;
						const a = matrix[0];
						const b = matrix[1];
						emitter.angle = Math.atan2(b, a);
						break;
					}
				}
				emitter.emitParticles(deltaTime);
			}
		}
	}
};

AnimationWindowEngine.updateParticles = function (this: typeof Animation, deltaTime: number) {
	this.particleUpdating = false;
	const { emitters } = this.player;
	let i = emitters.length;
	while (--i >= 0) {
		const emitter = emitters[i];
		const updating = emitter.updateParticles(deltaTime) !== 0;
		if (updating === false && emitter.disabled) {
			emitter.destroy();
			emitters.splice(i, 1);
		}
		this.particleUpdating ||= updating;
	}
};

AnimationWindowEngine.drawBackParticles = function (this: typeof Animation) {
	if (this.particleUpdating) {
		const { emitters } = this.player;
		for (const emitter of emitters) {
			if (emitter.layer.order === 'before') {
				emitter.draw();
			}
		}
	}
};

AnimationWindowEngine.drawFrontParticles = function (this: typeof Animation) {
	if (this.particleUpdating) {
		const { emitters } = this.player;
		for (const emitter of emitters) {
			if (emitter.layer.order === 'after') {
				emitter.draw();
			}
		}
	}
};

AnimationWindowEngine.drawCoordinateAxes = function (this: typeof Animation) {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const matrix = gl.matrix.set(animationWindow.matrix);
	// 避免缩放时虚线抖动
	const L = -10000 / this.scaleX;
	const T = -10000 / this.scaleY;
	const R = 10000 / this.scaleX;
	const B = 10000 / this.scaleY;
	const a = matrix[0];
	const b = matrix[1];
	const c = matrix[3];
	const d = matrix[4];
	const e = matrix[6];
	const f = matrix[7];
	const x1 = a * L + e;
	const y1 = b * L + f;
	const x2 = a * R + e;
	const y2 = b * R + f;
	const x3 = c * T + e;
	const y3 = d * T + f;
	const x4 = c * B + e;
	const y4 = d * B + f;
	vertices[0] = x1;
	vertices[1] = y1 + 0.5;
	vertices[2] = 0;
	vertices[3] = x2;
	vertices[4] = y2 + 0.5;
	vertices[5] = Math.dist(x1, y1, x2, y2);
	vertices[6] = x3 + 0.5;
	vertices[7] = y3;
	vertices[8] = 0;
	vertices[9] = x4 + 0.5;
	vertices[10] = y4;
	vertices[11] = Math.dist(x3, y3, x4, y4);
	matrix.project(gl.flip, gl.width, gl.height);
	gl.alpha = 1;
	gl.blend = 'normal';
	const program = gl.dashedLineProgram.use();
	gl.bindVertexArray(program.vao);
	gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
	gl.uniform4f(program.u_Color, 0.5, 0, 1, 1);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12);
	gl.drawArrays(gl.LINES, 0, 4);
};

AnimationWindowEngine.drawJointNodes = function (this: typeof Animation) {
	if (!getAnimationStore().showMark) return;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const matrix = gl.matrix;
	const { contexts } = this.player;
	const { count } = contexts;
	for (let i = 0; i < count; i++) {
		const context = contexts[i];
		const { layer, frame } = context;
		if (layer.class === 'joint' && !layer.hidden && frame !== null) {
			matrix.set(animationWindow.matrix).multiply(context.matrix);
			let vi = 0;
			const x = matrix[6];
			const y = matrix[7];
			const scale = Math.min(this.scale, 1);
			const radius = 5.5 * scale;
			const offset = 1.5 * scale;
			const segments = 40;
			const step = (Math.PI * 2) / segments;
			for (let i = 0, j = 1; i < segments; i++, j = -j) {
				const angle = i * step;
				const or = j * offset;
				vertices[vi] = x + (radius + or) * Math.cos(angle);
				vertices[vi + 1] = y + (radius + or) * Math.sin(angle);
				vi += 2;
			}
			vertices[vi] = vertices[0];
			vertices[vi + 1] = vertices[1];
			vertices[vi + 2] = vertices[2];
			vertices[vi + 3] = vertices[3];
			vi += 4;
			const program = gl.graphicProgram.use();
			matrix.project(gl.flip, gl.width, gl.height);
			gl.bindVertexArray(program.vao.a10);
			gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
			switch (frame) {
				case getAnimationStore().target:
					gl.vertexAttrib4f(program.a_Color, 0, 1, 1, 1);
					break;
				case this.hover:
					gl.vertexAttrib4f(program.a_Color, 0.75, 1, 1, 1);
					break;
				default:
					gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1);
					break;
			}
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, vi / 2);
		}
	}
};

AnimationWindowEngine.drawJointArrows = function (this: typeof Animation) {
	if (!getAnimationStore().showMark) return;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const matrix = gl.matrix;
	const { contexts } = this.player;
	const { count } = contexts;
	for (let i = 0; i < count; i++) {
		const context = contexts[i];
		const { layer, frame, parent } = context;
		if (
			layer.class === 'joint' &&
			frame !== null &&
			parent !== null &&
			parent.frame !== null &&
			!parent.layer.hidden
		) {
			matrix.set(animationWindow.matrix).multiply(parent.matrix);
			const sx = matrix[6];
			const sy = matrix[7];
			matrix.set(animationWindow.matrix).multiply(context.matrix);
			const dx = matrix[6];
			const dy = matrix[7];
			if (sx === dx && sy === dy) {
				continue;
			}
			let vi = 0;
			const scale = Math.min(this.scale, 1);
			const jointRadius = 5.5 * scale;
			const smallRadius = 0.5 * scale;
			const largeRadius = 9 * scale;
			const angle = Math.atan2(dy - sy, dx - sx);
			const sAngle1 = angle + Math.PI / 2;
			const eAngle1 = angle - Math.PI / 2;
			const sAngle2 = angle + Math.PI / 4;
			const eAngle2 = angle - Math.PI / 4;
			const x = sx + jointRadius * Math.cos(angle);
			const y = sy + jointRadius * Math.sin(angle);
			vertices[vi] = x;
			vertices[vi + 1] = y;
			vertices[vi + 2] = x + largeRadius * Math.cos(eAngle2);
			vertices[vi + 3] = y + largeRadius * Math.sin(eAngle2);
			vertices[vi + 4] = dx + smallRadius * Math.cos(eAngle1);
			vertices[vi + 5] = dy + smallRadius * Math.sin(eAngle1);
			vertices[vi + 6] = dx + smallRadius * Math.cos(sAngle1);
			vertices[vi + 7] = dy + smallRadius * Math.sin(sAngle1);
			vertices[vi + 8] = x + largeRadius * Math.cos(sAngle2);
			vertices[vi + 9] = y + largeRadius * Math.sin(sAngle2);
			vi += 10;
			const program = gl.graphicProgram.use();
			matrix.project(gl.flip, gl.width, gl.height);
			gl.bindVertexArray(program.vao.a10);
			gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
			switch (parent.frame) {
				case getAnimationStore().target:
					gl.vertexAttrib4f(program.a_Color, 0, 1, 1, 1);
					break;
				case this.hover:
					gl.vertexAttrib4f(program.a_Color, 0.75, 1, 1, 1);
					break;
				default:
					gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1);
					break;
			}
			gl.drawArrays(gl.TRIANGLE_FAN, 0, vi / 2);
		}
	}
};

AnimationWindowEngine.drawJointSpinner = function (this: typeof Animation) {
	const context = this.targetContext;
	const target = getAnimationStore().target;
	if (
		target !== null &&
		context !== null &&
		context.layer.class === 'joint' &&
		!context.layer.hidden
	) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const matrix = gl.matrix.set(animationWindow.matrix).multiply(context.matrix);
		let vi = 0;
		const x = matrix[6];
		const y = matrix[7];
		const scale = Math.min(this.scale, 1);
		const radius = 12 * scale;
		const offset = 2 * scale;
		const segments = 40;
		const step = (Math.PI * 2) / segments;
		for (let i = 0, j = 1; i < segments; i++, j = -j) {
			const angle = i * step;
			const or = j * offset;
			vertices[vi] = x + (radius + or) * Math.cos(angle);
			vertices[vi + 1] = y + (radius + or) * Math.sin(angle);
			vi += 2;
		}
		vertices[vi] = vertices[0];
		vertices[vi + 1] = vertices[1];
		vertices[vi + 2] = vertices[2];
		vertices[vi + 3] = vertices[3];
		vi += 4;
		const mi = vi;
		const innerRadius = 16 * scale;
		const outerRadius = 20 * scale;
		let rotation = target.rotation!;
		let node = context;
		while ((node = node.parent)) {
			const frame = node.frame;
			if (frame !== null) {
				rotation += frame.rotation;
			}
		}
		const angle = Math.radians(rotation);
		const sAngle = angle - Math.PI / 12;
		const eAngle = angle + Math.PI / 12;
		const arrowSegments = 5;
		vertices[vi] = x + outerRadius * Math.cos(angle);
		vertices[vi + 1] = y + outerRadius * Math.sin(angle);
		vi += 2;
		for (let i = 0; i <= arrowSegments; i++) {
			const ratio = i / arrowSegments;
			const angle = sAngle * (1 - ratio) + eAngle * ratio;
			vertices[vi] = x + innerRadius * Math.cos(angle);
			vertices[vi + 1] = y + innerRadius * Math.sin(angle);
			vi += 2;
		}
		const program = gl.graphicProgram.use();
		matrix.project(gl.flip, gl.width, gl.height);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, mi / 2);
		gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
		gl.drawArrays(gl.TRIANGLE_FAN, mi / 2, (vi - mi) / 2);
	}
};

AnimationWindowEngine.drawHoverWireframe = function (this: typeof Animation) {
	const hover = this.hover;
	if (hover !== null && hover !== getAnimationStore().target) {
		const { contexts } = this.player;
		const { count } = contexts;
		for (let i = 0; i < count; i++) {
			const context = contexts[i];
			if (context.frame === hover && !context.layer.hidden) {
				switch (context.layer.class) {
					case 'joint':
					case 'sound':
						break;
					case 'sprite':
						this.drawSpriteWireframe!(context, 0xffffffff);
						break;
					case 'particle':
						this.drawEmitterWireframe!(context, 0xffffffff);
						break;
				}
				return;
			}
		}
	}
};

AnimationWindowEngine.drawTargetWireframe = function (this: typeof Animation) {
	const context = this.targetContext;
	if (context !== null && getAnimationStore().target !== null) {
		switch (context.layer.class) {
			case 'joint':
			case 'sound':
				break;
			case 'sprite':
				this.drawSpriteWireframe!(context, 0xffc0ff00);
				break;
			case 'particle':
				this.drawEmitterWireframe!(context, 0xffc0ff00);
				break;
		}
	}
};

AnimationWindowEngine.drawSpriteWireframe = function (
	this: typeof Animation,
	context: AnimationContext,
	color: number
) {
	const key = context.layer.sprite;
	const texture = this.player.textures[key];
	if (!texture) return;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const colors = gl.arrays[0].uint32;
	const matrix = gl.matrix.set(animationWindow.matrix).multiply(context.matrix);
	const L = -(texture.width * context.anchorX + context.pivotX);
	const T = -(texture.height * context.anchorY + context.pivotY);
	const R = L + texture.width;
	const B = T + texture.height;
	const a = matrix[0];
	const b = matrix[1];
	const c = matrix[3];
	const d = matrix[4];
	const e = matrix[6];
	const f = matrix[7];
	const x1 = a * L + c * T + e;
	const y1 = b * L + d * T + f;
	const x2 = a * L + c * B + e;
	const y2 = b * L + d * B + f;
	const x3 = a * R + c * B + e;
	const y3 = b * R + d * B + f;
	const x4 = a * R + c * T + e;
	const y4 = b * R + d * T + f;
	const angle1 = Math.atan2(y1 - y2, x1 - x2);
	const angle2 = Math.atan2(y2 - y3, x2 - x3);
	const angle3 = Math.atan2(y3 - y4, x3 - x4);
	const angle4 = Math.atan2(y4 - y1, x4 - x1);
	const ox1 = Math.cos(angle1) * 0.5;
	const oy1 = Math.sin(angle1) * 0.5;
	const ox2 = Math.cos(angle2) * 0.5;
	const oy2 = Math.sin(angle2) * 0.5;
	const ox3 = Math.cos(angle3) * 0.5;
	const oy3 = Math.sin(angle3) * 0.5;
	const ox4 = Math.cos(angle4) * 0.5;
	const oy4 = Math.sin(angle4) * 0.5;
	const bx1 = x1 + ox4 - ox1;
	const by1 = y1 + oy4 - oy1;
	const bx2 = x2 + ox1 - ox2;
	const by2 = y2 + oy1 - oy2;
	const bx3 = x3 + ox2 - ox3;
	const by3 = y3 + oy2 - oy3;
	const bx4 = x4 + ox3 - ox4;
	const by4 = y4 + oy3 - oy4;
	vertices[0] = bx1;
	vertices[1] = by1;
	colors[2] = color;
	vertices[3] = bx2;
	vertices[4] = by2;
	colors[5] = color;
	vertices[6] = bx3;
	vertices[7] = by3;
	colors[8] = color;
	vertices[9] = bx4;
	vertices[10] = by4;
	colors[11] = color;
	matrix.project(gl.flip, gl.width, gl.height);
	gl.alpha = 1;
	gl.blend = 'normal';
	const program = gl.graphicProgram.use();
	gl.bindVertexArray(program.vao);
	gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12);
	gl.drawArrays(gl.LINE_LOOP, 0, 4);
};

AnimationWindowEngine.drawEmitterWireframe = function (
	this: typeof Animation,
	context: AnimationContext,
	color: number
) {
	const emitter = context.emitter;
	if (!emitter?.hasArea) return;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const colors = gl.arrays[0].uint32;
	const matrix = gl.matrix.set(animationWindow.matrix).multiply(context.matrix);
	const L = emitter.outerLeft * emitter.scale;
	const T = emitter.outerTop * emitter.scale;
	const R = emitter.outerRight * emitter.scale;
	const B = emitter.outerBottom * emitter.scale;
	const a = matrix[0];
	const b = matrix[1];
	const c = matrix[3];
	const d = matrix[4];
	const e = matrix[6];
	const f = matrix[7];
	const x1 = a * L + c * T + e;
	const y1 = b * L + d * T + f;
	const x2 = a * L + c * B + e;
	const y2 = b * L + d * B + f;
	const x3 = a * R + c * B + e;
	const y3 = b * R + d * B + f;
	const x4 = a * R + c * T + e;
	const y4 = b * R + d * T + f;
	const angle1 = Math.atan2(y1 - y2, x1 - x2);
	const angle2 = Math.atan2(y2 - y3, x2 - x3);
	const angle3 = Math.atan2(y3 - y4, x3 - x4);
	const angle4 = Math.atan2(y4 - y1, x4 - x1);
	const ox1 = Math.cos(angle1) * 0.5;
	const oy1 = Math.sin(angle1) * 0.5;
	const ox2 = Math.cos(angle2) * 0.5;
	const oy2 = Math.sin(angle2) * 0.5;
	const ox3 = Math.cos(angle3) * 0.5;
	const oy3 = Math.sin(angle3) * 0.5;
	const ox4 = Math.cos(angle4) * 0.5;
	const oy4 = Math.sin(angle4) * 0.5;
	const bx1 = x1 + ox4 - ox1;
	const by1 = y1 + oy4 - oy1;
	const bx2 = x2 + ox1 - ox2;
	const by2 = y2 + oy1 - oy2;
	const bx3 = x3 + ox2 - ox3;
	const by3 = y3 + oy2 - oy3;
	const bx4 = x4 + ox3 - ox4;
	const by4 = y4 + oy3 - oy4;
	vertices[0] = bx1;
	vertices[1] = by1;
	colors[2] = color;
	vertices[3] = bx2;
	vertices[4] = by2;
	colors[5] = color;
	vertices[6] = bx3;
	vertices[7] = by3;
	colors[8] = color;
	vertices[9] = bx4;
	vertices[10] = by4;
	colors[11] = color;
	gl.alpha = 1;
	gl.blend = 'normal';
	const program = gl.graphicProgram.use();
	matrix.project(gl.flip, gl.width, gl.height);
	gl.bindVertexArray(program.vao);
	gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12);
	gl.drawArrays(gl.LINE_LOOP, 0, 4);
};

AnimationWindowEngine.drawTargetAnchor = function (this: typeof Animation) {
	const context = this.targetContext;
	if (context !== null && getAnimationStore().target !== null) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const colors = gl.arrays[0].uint32;
		const matrix = gl.matrix.set(animationWindow.matrix).multiply(context.matrix);
		const x = matrix[6];
		const y = matrix[7];
		const crossColor = 0xff0000ff;
		vertices[0] = x + 0.5 - 8;
		vertices[1] = y + 0.5;
		colors[2] = crossColor;
		vertices[3] = x + 0.5 + 9;
		vertices[4] = y + 0.5;
		colors[5] = crossColor;
		vertices[6] = x + 0.5;
		vertices[7] = y + 0.5 - 8;
		colors[8] = crossColor;
		vertices[9] = x + 0.5;
		vertices[10] = y + 0.5 + 9;
		colors[11] = crossColor;
		matrix.project(gl.flip, gl.width, gl.height);
		gl.alpha = 1;
		gl.blend = 'normal';
		const program = gl.graphicProgram.use();
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12);
		gl.drawArrays(gl.LINES, 0, 4);
	}
};

AnimationWindowEngine.drawSpriteControlPoints = function (this: typeof Animation) {
	const context = this.targetContext;
	const target = getAnimationStore().target;
	const texture = UI.controlPointTexture;
	if (!context || !target || !texture) return;
	if (this.updateControlPoints!(context)) {
		const POINT_RADIUS = 4 / this.scale;
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		let vi = 0;
		const { rectList } = this.controlPoints;
		const length = rectList.length;
		for (let i = 4; i < length; i++) {
			const { x, y } = rectList[i];
			const dl = x - POINT_RADIUS;
			const dt = y - POINT_RADIUS;
			const dr = x + POINT_RADIUS;
			const db = y + POINT_RADIUS;
			vertices[vi] = dl;
			vertices[vi + 1] = dt;
			vertices[vi + 2] = 0;
			vertices[vi + 3] = 0;
			vertices[vi + 4] = dl;
			vertices[vi + 5] = db;
			vertices[vi + 6] = 0;
			vertices[vi + 7] = 1;
			vertices[vi + 8] = dr;
			vertices[vi + 9] = db;
			vertices[vi + 10] = 1;
			vertices[vi + 11] = 1;
			vertices[vi + 12] = dr;
			vertices[vi + 13] = dt;
			vertices[vi + 14] = 1;
			vertices[vi + 15] = 0;
			vi += 16;
		}
		gl.blend = 'normal';
		const program = gl.imageProgram.use();
		const matrix = gl.matrix
			.project(gl.flip, gl.width, gl.height)
			.multiply(animationWindow.matrix);
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.uniform1i(program.u_LightMode, 0);
		gl.uniform1i(program.u_ColorMode, 0);
		gl.uniform4f(program.u_Tint, 0, 0, 0, 0);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture);
		gl.drawElements(gl.TRIANGLES, (vi / 16) * 6, gl.UNSIGNED_INT, 0);
	}
};

AnimationWindowEngine.requestAnimation = function (this: typeof Animation) {
	if (getAnimationStore().state === 'open') {
		Timer.appendUpdater!('stageAnimation', this.updateAnimation);
	}
};

AnimationWindowEngine.updateAnimation = function (this: typeof Animation, deltaTime: number) {
	deltaTime *= getAnimationStore().speed ?? 0;
	if (getAnimationStore().playing) {
		const { start, end } = animationWindow.getAnimationRange!();
		const offset = deltaTime / animationWindow.Player.step;
		let index = Math.max(animationWindow.animIndex + offset, start);
		if (index >= end) {
			if (getAnimationStore().loop && end > 0) {
				do {
					index += start - end;
				} while (index >= end);
				animationWindow.resetSoundContexts!();
			} else {
				animationWindow.animIndex = index;
				animationWindow.stop!();
				return;
			}
		}
		animationWindow.animIndex = index;
		animationWindow.loadFrames!(index);
		animationWindow.emitParticles!(deltaTime);
		animationWindow.updateSoundContexts!(index);
	}
	animationWindow.updateParticles!(deltaTime);
	// 不能保证加载帧的时候一定会请求渲染(尾帧截止) 所以在播放状态时再次请求渲染
	if (getAnimationStore().playing || animationWindow.particleUpdating) {
		animationWindow.requestRendering!();
	} else {
		animationWindow.stopAnimation!();
	}
};

AnimationWindowEngine.stopAnimation = function (this: typeof Animation) {
	Timer.removeUpdater!('stageAnimation', this.updateAnimation);
};

AnimationWindowEngine.requestRendering = function (this: typeof Animation) {
	if (getAnimationStore().state === 'open') {
		Timer.appendUpdater!('stageRendering', this.renderingFunction);
	}
};

AnimationWindowEngine.renderingFunction = function (this: typeof Animation) {
	if (GL.width * GL.height !== 0) {
		animationWindow.drawBackground!();
		if (animationWindow.layers !== null) {
			animationWindow.drawOnionskins!();
			animationWindow.drawBackParticles!();
			animationWindow.drawSpriteLayers!();
			animationWindow.drawFrontParticles!();
			animationWindow.drawCoordinateAxes!();
			animationWindow.drawEmitters!();
			animationWindow.drawJointNodes!();
			animationWindow.drawJointArrows!();
			animationWindow.drawJointSpinner!();
			animationWindow.drawHoverWireframe!();
			animationWindow.drawTargetWireframe!();
			animationWindow.drawTargetAnchor!();
			animationWindow.drawSpriteControlPoints!();
		}
	}
};

AnimationWindowEngine.stopRendering = function (this: typeof Animation) {
	Timer.removeUpdater!('stageRendering', this.renderingFunction);
};
