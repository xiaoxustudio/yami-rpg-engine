import { uiElClasses } from './element-classes.ts';
import { getUIStore } from '@app/stores/ui';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { radians } from '@app/utils/math';
import { append, remove } from '@app/utils/array';

/**
 * 「元素」的公共面（第 164 轮收口）。
 *
 * 此前这里是**空接口 + `[k: string]: any`** —— 本文件 `:249` 那条 2026-09-18 的注释写得很清楚：
 * 「索引签名让 tsc 在这一层**完全瞎**」。本轮按实测把它收成 7 个成员：把索引签名摘掉后，
 * `tsc` 报的 **20 条 TS2339 全部在这一个文件里**，点名要的正是这 7 个
 * （`parent`9 · `connect`3 · `resize`3 · `connected`2 · `destroy` · `disconnect` · `draw`）。
 *
 * `draw` 声明成**可选**，与上面 `requestResizing` 同一处理（`:54`）：基类实例本身没有它
 * （只有具体元素类有），而 `remove()` 会把 `this`（基类实例）传进 `this.parent!.children`
 * 这类 `UIElementShape[]` 里。调用点配 `?.`（`:217`）—— 实际 children 全是具体元素类，
 * 所以那条路径运行期不会走到，`?.` 只是把「类型看不见的事实」写成不崩的形态。
 *
 * 写成**函数属性**而不是方法简写 —— 与同文件 `:16` / `:54` 的写法一致。
 */
interface UIElementShape {
	parent: UIParentShape | null;
	connected: boolean;
	connect: () => void;
	disconnect: () => void;
	draw?: () => void;
	resize: () => void;
	destroy: () => void;
}

interface UINodeShape {
	class: string;
	children: UINodeShape[];
	instances: { remove: (element: unknown) => void };
	[k: string]: unknown;
}

interface UIParentShape {
	x: number;
	y: number;
	width: number;
	height: number;
	opacity: number;
	matrix: Matrix;
	children: UIElementShape[];
	/**
	 * 父元素。第 152 轮补声明：`contains()` 沿它上溯（`:312` 的 `element = element.parent`），
	 * 原先靠 `[k: string]: any` 索引签名兜着。基类字段本身就是 `UIParentShape | null`（`:61`）。
	 */
	parent: UIParentShape | null;
	/**
	 * 请求重算尺寸 —— **只有窗口类元素**有它：调用点 `remove()` 在
	 * `this.parent instanceof uiElClasses.Window` 之后才调（`:257`）。
	 * 声明成可选即如实描述；调用点配 `?.`（那个 `instanceof` 守卫就是它安全的理由）。
	 */
	requestResizing?: () => void;
}

interface TransformShape {
	x: number;
	y: number;
	x2: number;
	y2: number;
	width: number;
	width2: number;
	height: number;
	height2: number;
	anchorX: number;
	anchorY: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	skewX: number;
	skewY: number;
	opacity: number;
	[k: string]: unknown;
}

uiElClasses.Element = class UIElement {
	declare node: UINodeShape | null;
	x: number;
	y: number;
	width: number;
	height: number;
	matrix: Matrix;
	opacity: number;
	/**
	 * 第 140 轮补声明：基类的 `drawDefaultImage()` 会读它，但**不是所有**元素都有 ——
	 * 真正声明它的是 `image-element` / `text-element` / `progress-bar-element` / `video-element`
	 * （各自 `blend: string`）。所以这里用可选 + `declare`（与上面 `node` / `resize` 同一手法）：
	 * 只说「基类方法会读到一个可能是 string 的 blend」，**不产生任何运行期字段**（无 defineProperty、
	 * 不改实例自有键集合），也不新增断言 —— 原先读侧写的是
	 * `(this as unknown as { blend: string }).blend`。
	 */
	declare blend?: string;
	transform: TransformShape;
	parent: UIParentShape | null;
	children: UIElementShape[];
	visible: boolean;
	connected: boolean;
	declare resize: () => void;

	constructor(data: { transform?: TransformShape | null; hidden?: boolean } = {}) {
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.matrix = new Matrix();
		this.opacity = 1;
		this.transform = data.transform as TransformShape;
		this.parent = null;
		this.children = [];
		this.visible = !data.hidden;
		this.connected = false;
	}

	/**
	 * 画虚线框。`color` 是**颜色数值**：实现把它写进 `colors[i]`（`gl.arrays[0].uint32` 视图），
	 * 那个 uint32 槽位就是它的口径。原先声明成 `Array<number> | string`，比实现宽
	 * （写进 uint32 只会得到 NaN）；两处调用点（`ui-engine.ts` 的悬停/选中虚线框）传的都是
	 * `0x…` 数值 ⇒ 第 232 轮按实现收紧（`UIElementInstance.drawWireframe` 同步为 `number`）。
	 */
	drawWireframe(color: number) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const colors = gl.arrays[0].uint32;
		const matrix = gl.matrix.set(getUIStore().matrix!).multiply(this.matrix);
		const L = this.x;
		const T = this.y;
		const R = L + this.width;
		const B = T + this.height;
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
	}

	drawDefaultImage() {
		GL.alpha = this.opacity;
		GL.blend = this.blend;
		GL.matrix.set(getUIStore().matrix!).multiply(this.matrix);
		GL.fillRect(this.x, this.y, this.width, this.height, 0x80ffffff);
	}

	connect() {
		this.connected = true;
		this.connectChildren();
	}

	disconnect() {
		this.connected = false;
		this.disconnectChildren();
	}

	connectChildren() {
		const children = this.children;
		const length = children.length;
		for (let i = 0; i < length; i++) {
			children[i].connect();
		}
	}

	disconnectChildren() {
		const children = this.children;
		const length = children.length;
		for (let i = 0; i < length; i++) {
			children[i].disconnect();
		}
	}

	drawChildren() {
		const children = this.children;
		const length = children.length;
		for (let i = 0; i < length; i++) {
			children[i].draw?.();
		}
	}

	resizeChildren() {
		const children = this.children;
		const length = children.length;
		for (let i = 0; i < length; i++) {
			children[i].resize();
		}
	}

	destroyChildren() {
		const children = this.children;
		const length = children.length;
		for (let i = 0; i < length; i++) {
			children[i].destroy();
		}
	}

	destroy() {
		const { node } = this;
		if (!node) return;
		if (this === node.instance) {
			delete node.instance;
		}
		node.instances.remove(this);
	}

	appendChild(element: UIElementShape) {
		if (element && append(this.children, element)) {
			// ⚠️ `children` 是**普通数组**（`this.children = []`），没有 `remove` 方法；
			// 必须与下一行同形的自由函数 `remove(arr, value)`。
			// 写成 `children.remove(x)` 会抛 `... .remove is not a function`
			// —— `UIElementShape` 是 `[k: string]: any`，所以 tsc 永远看不见（2026-09-18）。
			if (element.parent instanceof uiElClasses.Element!)
				remove(element.parent!.children, element);
			element.parent = this;
			if (this.connected) {
				if (!element.connected) element.connect();
				element.resize();
			}
		}
	}

	appendChildTo(element: UIElementShape, index: number) {
		if (element instanceof uiElClasses.Element!) {
			if (element.parent instanceof uiElClasses.Element!) {
				getUIStore().root!.tryUpdateReferenceElements!(element.parent);
				remove(element.parent!.children, element);
			}
			if (element.parent instanceof uiElClasses.Window!) {
				element.parent!.requestResizing?.();
			}
			element.parent = this;
			this.children.splice(index, 0, element);
			if (this.connected) {
				if (!element.connected) element.connect();
				element.resize();
			}
			// `tryUpdateReferenceElements` 只有根元素有（`UIElementInstance` 是共同视图 ⇒ 可选）；
			// 这里拿的就是 `getUIStore().root` ⇒ 按本仓惯例用 `!`（保持不变式破坏时当场抛错的行为）
			getUIStore().root!.tryUpdateReferenceElements!(this);
		}
	}

	remove() {
		if (this.parent instanceof uiElClasses.Element! && remove(this.parent!.children, this)) {
			getUIStore().root!.tryUpdateReferenceElements!(this.parent);
			if (this.parent instanceof uiElClasses.Window!) {
				this.parent!.requestResizing?.();
			}
			this.parent = null;
			if (this.connected) {
				this.disconnect();
			}
		}
	}

	calculatePosition() {
		if (this.connected === false) {
			return;
		}

		const parent = this.parent!;
		const matrix = this.matrix.set(parent.matrix);
		const transform = this.transform;
		const parentWidth = parent.width;
		const parentHeight = parent.height;
		const x = parent.x + transform.x + transform.x2 * parentWidth;
		const y = parent.y + transform.y + transform.y2 * parentHeight;
		const width = Math.max(transform.width + transform.width2 * parentWidth, 0);
		const height = Math.max(transform.height + transform.height2 * parentHeight, 0);
		const anchorX = transform.anchorX * width;
		const anchorY = transform.anchorY * height;
		const rotation = transform.rotation;
		const scaleX = transform.scaleX;
		const scaleY = transform.scaleY;
		const skewX = transform.skewX;
		const skewY = transform.skewY;
		const opacity = transform.opacity * parent.opacity;

		this.x = x - anchorX;
		this.y = y - anchorY;
		this.width = width;
		this.height = height;
		this.opacity = opacity;

		if (rotation !== 0) {
			matrix.rotateAt(x, y, radians(rotation));
		}
		if (scaleX !== 1 || scaleY !== 1) {
			matrix.scaleAt(x, y, scaleX, scaleY);
		}
		if (skewX !== 0 || skewY !== 0) {
			matrix.skewAt(x, y, skewX, skewY);
		}
	}

	contains(element: UIParentShape | null) {
		while (element) {
			if (element === this) {
				return true;
			}
			element = element.parent;
		}
		return false;
	}

	isPointIn(x: number, y: number) {
		const W = this.width;
		const H = this.height;
		if (W * H === 0) {
			return false;
		}

		const matrix = this.matrix;
		const L = this.x;
		const T = this.y;
		const R = L + W;
		const B = T + H;
		const a = matrix[0];
		const b = matrix[1];
		const c = matrix[3];
		const d = matrix[4];
		const e = matrix[6];
		const f = matrix[7];
		const x1 = a * L + c * T + e - x;
		const y1 = b * L + d * T + f - y;
		const x2 = a * L + c * B + e - x;
		const y2 = b * L + d * B + f - y;
		const x3 = a * R + c * B + e - x;
		const y3 = b * R + d * B + f - y;
		const x4 = a * R + c * T + e - x;
		const y4 = b * R + d * T + f - y;
		const cross1 = x1 * y2 - y1 * x2;
		const cross2 = x2 * y3 - y2 * x3;
		const cross3 = x3 * y4 - y3 * x4;
		const cross4 = x4 * y1 - y4 * x1;
		return (
			cross1 * cross2 >= 0 &&
			cross2 * cross3 >= 0 &&
			cross3 * cross4 >= 0 &&
			cross4 * cross1 >= 0
		);
	}
};
