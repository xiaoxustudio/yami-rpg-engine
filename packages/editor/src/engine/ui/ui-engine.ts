import { getUIStore } from '@app/stores/ui';
import { $ } from '@app/utils/dom';
import { getRelativeCoords } from '@app/utils/element-utils';
import { write } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import type { History } from '@app/legacy/tools/history.ts';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';
import type { StageColor } from '@app/utils/stage-color';

export const UIEngine: Record<string, any> = {};

interface ControlPoint {
	x: number;
	y: number;
	angle: number;
}

interface UIControlPoints {
	rotate: Record<'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	resize: Record<'T' | 'L' | 'R' | 'B' | 'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	list: ControlPoint[];
}

interface UIShape {
	page: HTMLElement;
	head: HTMLElement;
	body: HTMLElement;
	screen: HTMLElement & { rawScrollLeft: number; rawScrollTop: number };
	history: History;
	controlPoints: UIControlPoints | null;
	controlPointActive: ControlPoint | null;
	controlPointRotation: number;
	translationKey: number;
	translationTimer: Timer | null;
	zoomTimer: Timer | null;
	background: StageColor;
	foreground: StageColor;
	matrix: Matrix;
	scale: number;
	scaleX: number;
	scaleY: number;
	outerWidth: number;
	outerHeight: number;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
	centerX: number;
	centerY: number;
	centerOffsetX: number;
	centerOffsetY: number;
	padding: number;
	paddingLeft: number;
	paddingTop: number;
	inspectorTypeMap: Record<string, string>;
	[k: string]: any;
}

UIEngine.setZoom = (function IIFE() {
	return function (this: UIShape, zoom: number) {
		const slider = $('#ui-zoom');
		if (getUIStore().zoom !== zoom) {
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
			getUIStore().zoom = zoom;
			if (slider) write(slider, zoom);
			if (getUIStore().state === 'open') {
				const timer = this.zoomTimer!;
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

UIEngine.shiftAnchor = function (this: UIShape, anchorX: number, anchorY: number) {
	const target = getUIStore().target;
	if (target !== null) {
		this.planToSave!();
		const instances = target.instances;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'ui-target-anchor';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				anchorX: transform.anchorX,
				anchorY: transform.anchorY
			});
		}
		// transform.anchorX = anchorX transform.anchorY = anchorY
		instances.setProperty('transform-anchorX', anchorX);
		instances.setProperty('transform-anchorY', anchorY);
		instances.resize();
		this.requestRendering!();

		if (editor.target === target) {
			write(editor, { anchorX, anchorY });
		}
	}
};

UIEngine.shiftTarget = function (this: UIShape, x: number, y: number) {
	const target = getUIStore().target;
	if (target !== null) {
		this.planToSave!();
		const instances = target.instances;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'ui-target-shift';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				x: transform.x,
				y: transform.y
			});
		}
		// transform.x = x transform.y = y
		instances.setProperty('transform-x', x);
		instances.setProperty('transform-y', y);
		if (instances.length > 0 && typeof instances[0]?.resize !== 'function') {
			console.error(
				'[DEBUG-instances]',
				JSON.stringify({
					targetKeys: target ? Object.keys(target).slice(0, 25) : 'none',
					targetClass: target?.class,
					targetName: target?.name,
					hasChildren: Array.isArray(target?.children),
					transform: target?.transform ? 'yes' : 'no',
					instanceCtor: target?.instance?.constructor?.name,
					instancesCtor: instances?.constructor?.name,
					instancesProto: Object.getPrototypeOf(instances)?.constructor?.name,
					instancesContent: Array.isArray(instances)
						? instances.map((e: unknown) => `${typeof e}:${e}`)
						: String(instances),
					instancesSetType: typeof instances.set,
					instancesSetName: instances.set?.name,
					instancesIsMap: instances instanceof Map,
					instancesIsArray: Array.isArray(instances),
					instancesOwnKeys: Object.keys(instances)
				})
			);
		}
		instances.resize();
		this.requestRendering!();

		if (editor.target === target) {
			write(editor, {
				x: x,
				y: y
			});
		}
	}
};

UIEngine.resizeTarget = function (this: UIShape, width?: number, height?: number) {
	const target = getUIStore().target;
	if (target !== null) {
		this.planToSave!();
		const instances = target.instances;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'ui-target-resize';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				width: transform.width,
				height: transform.height
			});
		}
		if (width !== undefined) {
			// transform.width = width
			instances.setProperty('transform-width', width);
		}
		if (height !== undefined) {
			// transform.height = height
			instances.setProperty('transform-height', height);
		}
		instances.resize();
		this.requestRendering!();

		if (editor.target === target) {
			write(editor, {
				width: width,
				height: height
			});
		}
	}
};

UIEngine.rotateTarget = function (this: UIShape, rotation: number) {
	const target = getUIStore().target;
	if (target !== null) {
		this.planToSave!();
		const instances = target.instances;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'ui-target-rotate';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				rotation: transform.rotation
			});
		}
		// transform.rotation = rotation
		instances.setProperty('transform-rotation', rotation);
		instances.resize();
		this.requestRendering!();

		if (editor.target === target) {
			write(editor, { rotation });
		}
	}
};

UIEngine.setControlPoint = function (this: UIShape, point: ControlPoint | null) {
	if (this.controlPointActive !== point) {
		this.controlPointActive = point;
		const points = this.controlPoints!;
		let cursor;
		switch (point) {
			case null:
				cursor = '';
				break;
			case points.rotate.TL:
			case points.rotate.TR:
			case points.rotate.BL:
			case points.rotate.BR:
				cursor = 'alias';
				break;
			case points.resize.T:
			case points.resize.L:
			case points.resize.R:
			case points.resize.B:
			case points.resize.TL:
			case points.resize.TR:
			case points.resize.BL:
			case points.resize.BR: {
				const angle = Math.modDegrees(point.angle + this.controlPointRotation, 180);
				if (angle < 22.5 || angle >= 157.5) {
					cursor = 'ew-resize';
				} else if (angle < 67.5) {
					cursor = 'nwse-resize';
				} else if (angle < 112.5) {
					cursor = 'ns-resize';
				} else {
					cursor = 'nesw-resize';
				}
				break;
			}
		}
		this.body.style.cursor = cursor!;
	}
};

UIEngine.updateControlPoints = function (this: UIShape) {
	const target = getUIStore().target;
	if (target !== null) {
		const POINT_RADIUS = 4 / this.scale;
		const { instance } = target;
		const points = this.controlPoints!;
		const matrix = instance.matrix;
		const L = instance.x;
		const T = instance.y;
		const R = L + instance.width;
		const B = T + instance.height;
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
		const ox1 = -Math.cos(angle3) * POINT_RADIUS;
		const oy1 = Math.sin(angle1) * POINT_RADIUS;
		const ox2 = -Math.cos(angle4) * POINT_RADIUS;
		const oy2 = Math.sin(angle2) * POINT_RADIUS;
		const ox3 = Math.cos(angle3) * POINT_RADIUS;
		const oy3 = Math.sin(angle3) * POINT_RADIUS;
		const ox4 = Math.cos(angle4) * POINT_RADIUS;
		const oy4 = Math.sin(angle4) * POINT_RADIUS;

		const { rotate } = points;
		rotate.TL.x = x1 + (ox1 - ox4) * 3;
		rotate.TL.y = y1 + (oy1 - oy4) * 3;
		rotate.TR.x = x4 + (ox4 - ox3) * 3;
		rotate.TR.y = y4 + (oy4 - oy3) * 3;
		rotate.BL.x = x2 + (ox2 - ox1) * 3;
		rotate.BL.y = y2 + (oy2 - oy1) * 3;
		rotate.BR.x = x3 + (ox3 - ox2) * 3;
		rotate.BR.y = y3 + (oy3 - oy2) * 3;
		const { resize } = points;
		resize.T.x = (x4 + x1) / 2 + ox1;
		resize.T.y = (y4 + y1) / 2 + oy1;
		resize.L.x = (x1 + x2) / 2 + ox2;
		resize.L.y = (y1 + y2) / 2 + oy2;
		resize.R.x = (x3 + x4) / 2 + ox4;
		resize.R.y = (y3 + y4) / 2 + oy4;
		resize.B.x = (x2 + x3) / 2 + ox3;
		resize.B.y = (y2 + y3) / 2 + oy3;
		resize.TL.x = x1 + ox1 - ox4;
		resize.TL.y = y1 + oy1 - oy4;
		resize.TR.x = x4 + ox4 - ox3;
		resize.TR.y = y4 + oy4 - oy3;
		resize.BL.x = x2 + ox2 - ox1;
		resize.BL.y = y2 + oy2 - oy1;
		resize.BR.x = x3 + ox3 - ox2;
		resize.BR.y = y3 + oy3 - oy2;
		let element = instance;
		let rotation = element.transform.rotation;
		while ((element = element.parent)?.transform) {
			rotation += element.transform.rotation;
		}
		this.controlPointRotation = rotation;
	}
};

UIEngine.getPointerCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: UIShape, event: PointerEvent) {
		const coords = getRelativeCoords(event, this.marquee);
		const dpr = window.devicePixelRatio;
		point.x = (coords.x * dpr - this.paddingLeft) / this.scaleX;
		point.y = (coords.y * dpr - this.paddingTop) / this.scaleY;
		return point;
	};
})();

UIEngine.updateCamera = function (this: UIShape, x = this.centerX, y = this.centerY) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const scrollX = x * this.scaleX + this.paddingLeft;
	const scrollY = y * this.scaleY + this.paddingTop;
	const toleranceForDPR = 0.0001;
	screen.rawScrollLeft =
		Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - GL.width) / dpr;
	screen.rawScrollTop =
		Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - GL.height) / dpr;
	screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceForDPR) / dpr;
	screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceForDPR) / dpr;
};

UIEngine.updateTransform = function (this: UIShape) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const left = Math.roundTo(screen.scrollLeft * dpr - this.paddingLeft, 4);
	const top = Math.roundTo(screen.scrollTop * dpr - this.paddingTop, 4);
	const right = left + GL.width;
	const bottom = top + GL.height;
	this.scrollLeft = left / this.scaleX;
	this.scrollTop = top / this.scaleY;
	this.scrollRight = right / this.scaleX;
	this.scrollBottom = bottom / this.scaleY;
	this.matrix
		.reset()
		.scale(this.scaleX, this.scaleY)
		.translate(-this.scrollLeft, -this.scrollTop);
	const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX;
	const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY;
	this.centerX = Math.roundTo((scrollX - this.paddingLeft) / this.scaleX, 4);
	this.centerY = Math.roundTo((scrollY - this.paddingTop) / this.scaleY, 4);
};

UIEngine.drawBackground = function (this: UIShape) {
	const gl = GL;
	gl.clearColor(...this.background.getGLRGBA());
	gl.clear(gl.COLOR_BUFFER_BIT);
};

UIEngine.drawElements = function (this: UIShape) {
	this.root.draw();
};

UIEngine.drawCoordinateAxes = function (this: UIShape) {
	const target = getUIStore().target;
	if (target !== null) {
		const { parent } = target.instance;
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const matrix = gl.matrix.set(UI.matrix).multiply(parent.matrix);
		const PL = parent.x;
		const PT = parent.y;
		const PR = PL + parent.width;
		const PB = PT + parent.height;
		const TL = PL - 10000 / this.scaleX;
		const TT = PT - 10000 / this.scaleY;
		const TR = PR + 10000 / this.scaleX;
		const TB = PB + 10000 / this.scaleY;
		const a = matrix[0];
		const b = matrix[1];
		const c = matrix[3];
		const d = matrix[4];
		const e = matrix[6];
		const f = matrix[7];
		const x1 = a * TL + c * PT + e;
		const y1 = b * TL + d * PT + f;
		const x2 = a * TR + c * PT + e;
		const y2 = b * TR + d * PT + f;
		const x3 = a * TL + c * PB + e;
		const y3 = b * TL + d * PB + f;
		const x4 = a * TR + c * PB + e;
		const y4 = b * TR + d * PB + f;
		const x5 = a * PL + c * TT + e;
		const y5 = b * PL + d * TT + f;
		const x6 = a * PL + c * TB + e;
		const y6 = b * PL + d * TB + f;
		const x7 = a * PR + c * TT + e;
		const y7 = b * PR + d * TT + f;
		const x8 = a * PR + c * TB + e;
		const y8 = b * PR + d * TB + f;
		vertices[0] = x1;
		vertices[1] = y1 + 0.5;
		vertices[2] = 0;
		vertices[3] = x2;
		vertices[4] = y2 + 0.5;
		vertices[5] = Math.dist(x1, y1, x2, y2);
		vertices[6] = x3;
		vertices[7] = y3 + 0.5;
		vertices[8] = 0;
		vertices[9] = x4;
		vertices[10] = y4 + 0.5;
		vertices[11] = Math.dist(x3, y3, x4, y4);
		vertices[12] = x5 + 0.5;
		vertices[13] = y5;
		vertices[14] = 0;
		vertices[15] = x6 + 0.5;
		vertices[16] = y6;
		vertices[17] = Math.dist(x5, y5, x6, y6);
		vertices[18] = x7 + 0.5;
		vertices[19] = y7;
		vertices[20] = 0;
		vertices[21] = x8 + 0.5;
		vertices[22] = y8;
		vertices[23] = Math.dist(x7, y7, x8, y8);
		matrix.project(gl.flip, gl.width, gl.height);
		gl.alpha = 1;
		gl.blend = 'normal';
		const program = gl.dashedLineProgram.use();
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.uniform4f(program.u_Color, 0.5, 0, 1, 1);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 24);
		gl.drawArrays(gl.LINES, 0, 8);
	}
};

UIEngine.drawHoverWireframe = function (this: UIShape) {
	if (this.hover !== null && this.hover !== getUIStore().target) {
		const { instance } = this.hover;
		if (instance.visible) {
			instance.drawWireframe(0xffffffff);
		}
	}
};

UIEngine.drawTargetWireframe = function (this: UIShape) {
	const target = getUIStore().target;
	if (target !== null) {
		const { instance } = target;
		instance.drawWireframe(0xffc0ff00);
	}
};

UIEngine.drawTargetAnchor = function (this: UIShape) {
	const target = getUIStore().target;
	if (target !== null) {
		const { instance } = target;
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const matrix = gl.matrix.set(UI.matrix).multiply(instance.matrix);
		const transform = instance.transform;
		const X = instance.x + instance.width * transform.anchorX;
		const Y = instance.y + instance.height * transform.anchorY;
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
		matrix.project(gl.flip, gl.width, gl.height);
		gl.alpha = 1;
		gl.blend = 'normal';
		const program = gl.graphicProgram.use();
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 8);
		gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
		gl.drawArrays(gl.LINES, 0, 4);
	}
};

UIEngine.drawControlPoints = function (this: UIShape) {
	const target = getUIStore().target;
	const texture = this.controlPointTexture;
	if (target !== null && texture !== null) {
		this.updateControlPoints!();
		const POINT_RADIUS = 4 / this.scale;
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		let vi = 0;
		const { list } = this.controlPoints!;
		const length = list.length;
		for (let i = 4; i < length; i++) {
			const { x, y } = list[i];
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
		const matrix = gl.matrix.project(gl.flip, gl.width, gl.height).multiply(UI.matrix);
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

UIEngine.selectControlPoint = function (this: UIShape, x: number, y: number) {
	const target = getUIStore().target;
	if (target !== null && !(target.class === 'reference' && target.synchronous)) {
		const radius = 6 / this.scale;
		const { list } = this.controlPoints!;
		for (let i = list.length - 1; i >= 0; i--) {
			const point = list[i];
			const sx = point.x - radius;
			const ex = point.x + radius;
			const sy = point.y - radius;
			const ey = point.y + radius;
			if (x >= sx && x < ex && y >= sy && y < ey) {
				return point;
			}
		}
	}
	return null;
};

UIEngine.requestRendering = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		Timer.appendUpdater!('stageRendering', this.renderingFunction);
	}
};

UIEngine.renderingFunction = function (this: UIShape) {
	if (GL.width * GL.height !== 0) {
		UI.drawBackground!();
		UI.drawElements!();
		UI.drawCoordinateAxes!();
		UI.drawHoverWireframe!();
		UI.drawTargetWireframe!();
		UI.drawTargetAnchor!();
		UI.drawControlPoints!();
	}
};

UIEngine.stopRendering = function (this: UIShape) {
	Timer.removeUpdater!('stageRendering', this.renderingFunction);
};
