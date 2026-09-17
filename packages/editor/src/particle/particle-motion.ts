import { screenScrollData } from '@app/engine/screen-scroll-data';
import { Particle } from './particle-window.ts';
import { particleEls } from '@app/particle/element-registry';
import type { ParticleShape } from './particle-window.ts';
import { Command } from '@app/commands/command-object.ts';
import { headNavOf, lastNavItemOf } from '@app/engine/layout/layout.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { getParticleStore, type ParticleTargetShape } from '@app/stores/particle';
import { addClass, read, rect, removeClass, write } from '@app/utils/element-utils.ts';
import { getRelativeCoords } from '@app/utils/element-utils';
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { Timer } from '@app/utils/timer';
import type { YamiElement } from '@app/types/element-api';
import { clamp, roundTo, dist } from '@app/utils/math';
import { getDevicePixelContentBoxSize } from '@app/utils/css';

Particle.undo = function () {
	if (getParticleStore().state === 'open' && !this.dragging && this.history!.canUndo()) {
		this.history!.restore('undo');
	}
};

Particle.redo = function () {
	if (getParticleStore().state === 'open' && !this.dragging && this.history!.canRedo()) {
		this.history!.restore('redo');
	}
};

Particle.setSpeed = (function IIFE() {
	return function (this: ParticleShape, speed: number) {
		getParticleStore().speed = speed;
		const numberBox = particleEls.get('particle-speed') as YamiElement;
		if (numberBox) write(numberBox, speed);
	};
})();

Particle.setZoom = (function IIFE() {
	return function (this: ParticleShape, zoom: number) {
		const slider = particleEls.get('particle-zoom') as YamiElement;
		if (getParticleStore().zoom !== zoom) {
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
			getParticleStore().zoom = zoom;
			if (slider) write(slider, zoom);
			if (getParticleStore().state === 'open') {
				const timer = this.zoomTimer!;
				timer.start = this.scale!;
				timer.end = scale;
				timer.elapsed = 0;
				timer.add();
			} else {
				this.scale = scale;
			}
		}
	};
})();

Particle.setTarget = function (target: ParticleTargetShape) {
	if (getParticleStore().target !== target) {
		getParticleStore().target = target;
		this.updateTargetItem!();
		this.requestRendering!();
		if (target) {
			Inspector.open('particleLayer', target);
		} else {
			Inspector.close();
		}
	}
};

Particle.updateTarget = function () {
	const item = read(this.list);
	if (item !== getParticleStore().target) {
		this.setTarget!(item);
	}
};

Particle.updateTargetItem = function () {
	const { target } = getParticleStore();
	if (target !== null) {
		const { list } = this;
		if (read(list) !== target) {
			list.selectWithNoEvent(target);
			if (target) {
				list.scrollToSelection();
			}
		}
	}
};

Particle.updateParticleInfo = function () {
	const { emitter, info } = this;
	const words = Command.words;
	for (const layer of emitter.layers) {
		const { name } = layer.data;
		const { count } = layer.elements;
		words.push(`${name} ${count}`);
	}
	const content = words.join('\n');
	if (info.textContent !== content) {
		info.textContent = content;
	}
};

Particle.updateHead = function () {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const nav = headNavOf(head);
		const item = lastNavItemOf(nav);
		if (!nav || !item) return;
		const nRect = rect(nav);
		const iRect = rect(item);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
		const width = nRect.right - iRect.right;
		if (head.width !== width) {
			head.width = width;
			const [start, center, end] = head.children as unknown as HTMLElement[];
			end.style.marginLeft = '';
			const sRect = rect(start);
			const cRect = rect(center);
			const eRect = rect(end);
			const spacing = eRect.left - sRect.right - cRect.width;
			const difference = sRect.right - nRect.left - eRect.width;
			const margin = Math.min(spacing, difference);
			end.style.marginLeft = `${margin}px`;
		}
	}
};

Particle.resize = function () {
	if (getParticleStore().state === 'open' && this.screen && this.screen.clientWidth !== 0) {
		const scale = this.scale!;
		const screenBox = getDevicePixelContentBoxSize(this.screen);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;
		const stageWidth = screenWidth + this.padding!;
		const stageHeight = screenHeight + this.padding!;
		const innerWidth = Math.round(stageWidth * scale);
		const innerHeight = Math.round(stageHeight * scale);
		const outerWidth = Math.max(screenWidth, innerWidth);
		const outerHeight = Math.max(screenHeight, innerHeight);
		const dpr = window.devicePixelRatio;
		this.outerWidth = outerWidth;
		this.outerHeight = outerHeight;
		this.centerOffsetX = screenWidth / 2;
		this.centerOffsetY = screenHeight / 2;
		getParticleStore().scaleX = innerWidth / stageWidth;
		getParticleStore().scaleY = innerHeight / stageHeight;
		this.marquee.style.width = `${outerWidth / dpr}px`;
		this.marquee.style.height = `${outerHeight / dpr}px`;
		GL.resize(screenWidth, screenHeight);
		this.updateCamera!();
		this.updateTransform!();
	}
};

Particle.getPointerCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: ParticleShape, event: PointerEvent) {
		const coords = getRelativeCoords(event, this.marquee);
		const dpr = window.devicePixelRatio;
		point.x = (coords.x * dpr - (this.outerWidth! >> 1)) / getParticleStore().scaleX!;
		point.y = (coords.y * dpr - (this.outerHeight! >> 1)) / getParticleStore().scaleY!;
		return point;
	};
})();

Particle.updateCamera = function (
	this: ParticleShape,
	x: number = this.centerX!,
	y: number = this.centerY!
) {
	const screen = this.screen;
	const dpr = window.devicePixelRatio;
	const scrollX = x * getParticleStore().scaleX! + this.outerWidth! / 2;
	const scrollY = y * getParticleStore().scaleY! + this.outerHeight! / 2;
	const toleranceForDPR = 0.0001;
	screenScrollData(screen).rawScrollLeft =
		clamp(scrollX - this.centerOffsetX!, 0, this.outerWidth! - GL.width) / dpr;
	screenScrollData(screen).rawScrollTop =
		clamp(scrollY - this.centerOffsetY!, 0, this.outerHeight! - GL.height) / dpr;
	screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceForDPR) / dpr;
	screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceForDPR) / dpr;
};

Particle.updateTransform = function () {
	const screen = this.screen;
	const dpr = window.devicePixelRatio;
	const left = roundTo(screen.scrollLeft * dpr - (this.outerWidth! >> 1), 4);
	const top = roundTo(screen.scrollTop * dpr - (this.outerHeight! >> 1), 4);
	const right = left + GL.width;
	const bottom = top + GL.height;
	this.scrollLeft = left / getParticleStore().scaleX!;
	this.scrollTop = top / getParticleStore().scaleY!;
	this.scrollRight = right / getParticleStore().scaleX!;
	this.scrollBottom = bottom / getParticleStore().scaleY!;
	this.matrix!.reset()
		.scale(getParticleStore().scaleX!, getParticleStore().scaleY!)
		.translate(-this.scrollLeft!, -this.scrollTop!);
	const scrollX = screenScrollData(screen).rawScrollLeft * dpr + this.centerOffsetX!;
	const scrollY = screenScrollData(screen).rawScrollTop * dpr + this.centerOffsetY!;
	this.centerX = roundTo((scrollX - this.outerWidth! / 2) / getParticleStore().scaleX!, 4);
	this.centerY = roundTo((scrollY - this.outerHeight! / 2) / getParticleStore().scaleY!, 4);
};

Particle.updateElements = function (deltaTime: number) {
	this.emitter.update(deltaTime * getParticleStore().speed!);
};

Particle.drawElements = function () {
	for (const layer of this.emitter.layers) {
		if (!layer.data.hidden) layer.draw();
	}
};

Particle.drawBackground = function () {
	const gl = GL;
	gl.clearColor(...this.background.getGLRGBA());
	gl.clear(gl.COLOR_BUFFER_BIT);
};

Particle.drawCoordinateAxes = function () {
	if (this.showAxes) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const matrix = gl.matrix.set(Particle.matrix);
		// 避免缩放时虚线抖动
		const L = -10000 / getParticleStore().scaleX!;
		const T = -10000 / getParticleStore().scaleY!;
		const R = 10000 / getParticleStore().scaleX!;
		const B = 10000 / getParticleStore().scaleY!;
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
		vertices[5] = dist(x1, y1, x2, y2);
		vertices[6] = x3 + 0.5;
		vertices[7] = y3;
		vertices[8] = 0;
		vertices[9] = x4 + 0.5;
		vertices[10] = y4;
		vertices[11] = dist(x3, y3, x4, y4);
		matrix.project(gl.flip, gl.width, gl.height);
		gl.alpha = 1;
		gl.blend = 'normal';
		const program = gl.dashedLineProgram.use();
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.uniform4f(program.u_Color, 0.5, 0, 1, 1);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12);
		gl.drawArrays(gl.LINES, 0, 4);
	}
};

Particle.drawEmitterWireframe = function () {
	let color;
	const emitter = this.emitter;
	if (emitter.active) color = 0xffffffff;
	if (emitter.selected) color = 0xffc0ff00;
	if (
		(emitter.outerLeft === 0 &&
			emitter.outerTop === 0 &&
			emitter.outerRight === 0 &&
			emitter.outerBottom === 0) ||
		color === undefined
	) {
		return;
	}
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const colors = gl.arrays[0].uint32;
	const ox = 0.5 / getParticleStore().scaleX!;
	const oy = 0.5 / getParticleStore().scaleY!;
	const L = emitter.outerLeft + ox;
	const T = emitter.outerTop + oy;
	const R = emitter.outerRight - ox;
	const B = emitter.outerBottom - oy;
	vertices[0] = L;
	vertices[1] = T;
	colors[2] = color;
	vertices[3] = L;
	vertices[4] = B;
	colors[5] = color;
	vertices[6] = R;
	vertices[7] = B;
	colors[8] = color;
	vertices[9] = R;
	vertices[10] = T;
	colors[11] = color;
	const program = gl.graphicProgram.use();
	const matrix = gl.matrix.project(gl.flip, gl.width, gl.height).multiply(Particle.matrix);
	gl.bindVertexArray(program.vao);
	gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12);
	gl.drawArrays(gl.LINE_LOOP, 0, 4);
};

Particle.drawEmitterAnchor = function () {
	const emitter = this.emitter;
	if (!emitter.selected) return;
	const X = emitter.startX;
	const Y = emitter.startY;
	if (!this.selectEmitter!(X, Y)) {
		emitter.selected = false;
		return;
	}
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const matrix = this.matrix!;
	const a = matrix[0];
	const b = matrix[1];
	const c = matrix[3];
	const d = matrix[4];
	const e = matrix[6];
	const f = matrix[7];
	const x = a * X + c * Y + e;
	const y = b * X + d * Y + f;
	vertices[0] = x + 0.5 - 8;
	vertices[1] = y + 0.5;
	vertices[2] = x + 0.5 + 9;
	vertices[3] = y + 0.5;
	vertices[4] = x + 0.5;
	vertices[5] = y + 0.5 - 8;
	vertices[6] = x + 0.5;
	vertices[7] = y + 0.5 + 9;
	gl.matrix.project(gl.flip, gl.width, gl.height);
	gl.alpha = 1;
	gl.blend = 'normal';
	const program = gl.graphicProgram.use();
	gl.bindVertexArray(program.vao.a10);
	gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 8);
	gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
	gl.drawArrays(gl.LINES, 0, 4);
};

Particle.drawAreaWireframe = function () {
	if (!getParticleStore().showWireframe || !getParticleStore().target) return;
	let vi = 0;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const { area } = getParticleStore().target!;
	switch (area.type) {
		case 'rectangle': {
			const ax = area.x;
			const ay = area.y;
			const aw = area.width;
			const ah = area.height;
			const ox = 0.5 / getParticleStore().scaleX!;
			const oy = 0.5 / getParticleStore().scaleY!;
			const L = ax - aw * 0.5 + ox;
			const T = ay - ah * 0.5 + oy;
			const R = Math.max(L, ax + aw * 0.5 - ox);
			const B = Math.max(T, ay + ah * 0.5 - oy);
			vertices[0] = L;
			vertices[1] = T;
			vertices[2] = L;
			vertices[3] = B;
			vertices[4] = R;
			vertices[5] = B;
			vertices[6] = R;
			vertices[7] = T;
			vi = 8;
			break;
		}
		case 'circle': {
			const ax = area.x;
			const ay = area.y;
			const ar = area.radius;
			const segments = 100;
			const step = (Math.PI * 2) / segments;
			for (let i = 0; i < segments; i++) {
				const angle = i * step;
				vertices[vi] = ax + ar * Math.cos(angle);
				vertices[vi + 1] = ay + ar * Math.sin(angle);
				vi += 2;
			}
			break;
		}
		default:
			return;
	}
	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		const matrix = gl.matrix.project(gl.flip, gl.width, gl.height).multiply(Particle.matrix);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
		gl.drawArrays(gl.LINE_LOOP, 0, vi / 2);
	}
};

Particle.drawElementWireframes = function () {
	if (!getParticleStore().showWireframe) return;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const matrix = gl.matrix;
	let vi = 0;
	for (const layer of this.emitter.layers) {
		if (layer.data.hidden) continue;
		const { texture } = layer;
		if (texture instanceof ImageTexture) {
			const elements = layer.elements;
			const count = elements.count;
			const sw = layer.unitWidth;
			const sh = layer.unitHeight;
			for (let i = 0; i < count; i++) {
				const element = elements[i];
				const ax = element.anchorX + 0.5;
				const ay = element.anchorY + 0.5;
				matrix
					.set(Particle.matrix)
					.translate(element.x, element.y)
					.rotate(element.rotationAngle)
					.scale(element.scaleFactor, element.scaleFactor)
					.translate(-ax * sw, -ay * sh);
				const R = sw;
				const B = sh;
				const a = matrix[0];
				const b = matrix[1];
				const c = matrix[3];
				const d = matrix[4];
				const e = matrix[6];
				const f = matrix[7];
				const x1 = e;
				const y1 = f;
				const x2 = c * B + e;
				const y2 = d * B + f;
				const x3 = a * R + c * B + e;
				const y3 = b * R + d * B + f;
				const x4 = a * R + e;
				const y4 = b * R + f;
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
				vertices[vi] = bx1;
				vertices[vi + 1] = by1;
				vertices[vi + 2] = bx2;
				vertices[vi + 3] = by2;
				vertices[vi + 4] = bx2;
				vertices[vi + 5] = by2;
				vertices[vi + 6] = bx3;
				vertices[vi + 7] = by3;
				vertices[vi + 8] = bx3;
				vertices[vi + 9] = by3;
				vertices[vi + 10] = bx4;
				vertices[vi + 11] = by4;
				vertices[vi + 12] = bx4;
				vertices[vi + 13] = by4;
				vertices[vi + 14] = bx1;
				vertices[vi + 15] = by1;
				vi += 16;
			}
		}
	}
	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		matrix.project(gl.flip, gl.width, gl.height);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1);
		gl.drawArrays(gl.LINES, 0, vi / 2);
	}
};

Particle.drawElementAnchors = function () {
	if (!getParticleStore().showAnchor) return;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const lines = gl.arrays[1].float32;
	const matrix = gl.matrix;
	let vi = 0;
	let li = 0;
	for (const layer of this.emitter.layers) {
		const elements = layer.elements;
		const count = elements.count;
		const sw = layer.unitWidth;
		const sh = layer.unitHeight;
		for (let i = 0; i < count; i++) {
			const element = elements[i];
			matrix.set(Particle.matrix).translate(element.x, element.y);
			const x = matrix[6];
			const y = matrix[7];
			vertices[vi] = x + 0.5 - 8;
			vertices[vi + 1] = y + 0.5;
			vertices[vi + 2] = x + 0.5 + 9;
			vertices[vi + 3] = y + 0.5;
			vertices[vi + 4] = x + 0.5;
			vertices[vi + 5] = y + 0.5 - 8;
			vertices[vi + 6] = x + 0.5;
			vertices[vi + 7] = y + 0.5 + 9;
			vi += 8;
			const ax = element.anchorX;
			const ay = element.anchorY;
			if (ax === 0 && ay === 0) {
				continue;
			}
			matrix
				.rotate(element.rotationAngle)
				.scale(element.scaleFactor, element.scaleFactor)
				.translate(-ax * sw, -ay * sh);
			const cx = matrix[6];
			const cy = matrix[7];
			lines[li] = x + 0.5;
			lines[li + 1] = y + 0.5;
			lines[li + 2] = cx + 0.5;
			lines[li + 3] = cy + 0.5;
			li += 4;
		}
	}
	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		matrix.project(gl.flip, gl.width, gl.height);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
		gl.drawArrays(gl.LINES, 0, vi / 2);
		if (li !== 0) {
			gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STREAM_DRAW, 0, li);
			gl.vertexAttrib4f(program.a_Color, 0, 1, 0, 1);
			gl.drawArrays(gl.LINES, 0, li / 2);
		}
	}
};

Particle.computeOuterRect = function () {
	const emitter = this.emitter;
	const sx = emitter.startX;
	const sy = emitter.startY;
	const rect = emitter.calculateOuterRect();
	emitter.outerLeft = sx + rect.left;
	emitter.outerTop = sy + rect.top;
	emitter.outerRight = sx + rect.right;
	emitter.outerBottom = sy + rect.bottom;
	if (rect.hasArea) {
		this.requestRendering!();
	}
};

Particle.selectEmitter = function (x: number, y: number) {
	const emitter = this.emitter;
	if (
		x >= emitter.outerLeft &&
		y >= emitter.outerTop &&
		x < emitter.outerRight &&
		y < emitter.outerBottom
	) {
		return true;
	}
	return false;
};

Particle.requestAnimation = function () {
	if (getParticleStore().state === 'open' && !getParticleStore().paused) {
		Timer.appendUpdater!('stageAnimation', this.updateAnimation!);
	}
};

Particle.updateAnimation = function (deltaTime: number) {
	Particle.updateElements!(deltaTime);
	Particle.updateParticleInfo!();
	if (Timer.updaters.stageRendering !== Particle.renderingFunction) {
		Particle.renderingFunction!();
	}
};

Particle.stopAnimation = function () {
	Timer.removeUpdater!('stageAnimation', this.updateAnimation!);
};

Particle.requestRendering = function () {
	if (getParticleStore().state === 'open') {
		Timer.appendUpdater!('stageRendering', this.renderingFunction!);
	}
};

Particle.renderingFunction = function () {
	if (GL.width * GL.height !== 0) {
		Particle.drawBackground!();
		Particle.drawElements!();
		Particle.drawCoordinateAxes!();
		Particle.drawAreaWireframe!();
		Particle.drawElementWireframes!();
		Particle.drawElementAnchors!();
		Particle.drawEmitterWireframe!();
		Particle.drawEmitterAnchor!();
	}
};

Particle.stopRendering = function () {
	Timer.removeUpdater!('stageRendering', this.renderingFunction!);
};

Particle.switchWireframe = (function IIFE() {
	return function (this: ParticleShape, enabled: boolean = !getParticleStore().showWireframe) {
		const item = particleEls.get('particle-view-wireframe') as YamiElement;
		if (enabled) {
			addClass(item, 'selected');
		} else {
			removeClass(item, 'selected');
		}
		getParticleStore().showWireframe = enabled;
		this.requestRendering!();
	};
})();

Particle.switchAnchor = (function IIFE() {
	return function (this: ParticleShape, enabled: boolean = !getParticleStore().showAnchor) {
		const item = particleEls.get('particle-view-anchor') as YamiElement;
		if (enabled) {
			addClass(item, 'selected');
		} else {
			removeClass(item, 'selected');
		}
		getParticleStore().showAnchor = enabled;
		this.requestRendering!();
	};
})();

Particle.switchPause = (function IIFE() {
	return function (this: ParticleShape, enabled: boolean = !getParticleStore().paused) {
		const item = particleEls.get('particle-control-pause') as YamiElement;
		getParticleStore().paused = enabled;
		if (enabled) {
			addClass(item, 'selected');
			this.stopAnimation!();
		} else {
			removeClass(item, 'selected');
			this.requestAnimation!();
		}
	};
})();
