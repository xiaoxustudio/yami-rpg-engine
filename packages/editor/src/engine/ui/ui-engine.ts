import { screenScrollData } from '../screen-scroll-data';
import { getUIStore, loadUI, registerUIEngine } from '@app/stores/ui';
import { getLazyWindow } from '@app/tools/window-registry';
import { engineEls } from '@app/engine/element-registry';
import { getRelativeCoords } from '@app/utils/element-utils';
import { write } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Inspector } from '@app/inspector/inspector.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import type { YamiElement } from '@app/types/element-api';
import type { ControlPoint, UIFacadeShape } from './ui-facade.ts';
import type { UIPointerEvent } from './ui-singleton.ts';
import { clamp, roundTo, dist, modDegrees } from '@app/utils/math';

/**
 * 惰加载的 UI 单例代理。`renderingFunction` 里那 7 个 draw 需要**显式的 UI 接收者** ——
 * 原因见该函数内的注释（它自己被 `Timer` 裸调用，`this` 恒为 `undefined`）。
 * 不能 `import { UI } from '@app/engine/ui/ui-singleton.ts'`：那是静态循环导入；这个代理只在运行时解析。
 */
const UI = getLazyWindow('ui', loadUI);

/**
 * 引擎读 UI 成员的契约在 `ui-facade.ts`（**单一真源**，由台账轴 `ui-facade-gaps` 守着）。
 *
 * 于是「漏声明的成员」与「拼错的成员名」都通过编译，只在运行期表现为 `undefined` ——
 * 那正是本阶段要消灭的静默失效。现在 `this.<x>` 必须在 `UIFacadeShape` 里显式在案，
 * `tsc` 会逐个点名；缺的是**补进契约**，不是把 `any` 加回来。
 */
type UIShape = UIFacadeShape;

/**
 *
 * `history` 在契约与单例上都是**可空**的（`ui-file.ts:147` 关闭文档时真的会写 `null`，
 * `ui-file.ts:82` 打开时赋值），而引擎这 4 个读点（`shiftTarget` / `shiftAnchor` /
 * `resizeTarget` / `rotateTarget`）都只在文档打开后才会被调到。
 * ⇒ 与 `this.planToSave!()` 同一手法：用 `!` 把前提写在**一处**，而不是在 4 个点各写一遍，
 * 也不是让契约宣称一个运行期不成立的形状。
 *
 * `History | null` 对不上，是「两个 `UIShape`」差异里的**最后一条**（另外几条见 `ui-facade.ts`）。
 */
const historyOf = (ui: UIShape) => ui.history!;

/**
 *
 * ## 为什么需要它
 *
 * `Record<string, any>` 让**任何**成员名、**任何**调用形状都通过编译：拼错的名字、
 * 传错个数的实参、`this` 绑到谁，`tsc` 全都看不见（只在运行期变成 `undefined is not a function`）。
 * 实测把那张注解摘掉之后是 **93 条报错、错误码只有一种（TS2339「属性不存在」）**、
 * 非 TS2339 **0 条** ⇒ 缺的正是一张成员表（"容器没有形状"，不是"形状不对"）。
 *
 * ## 签名怎么来的：**不是手抄**
 *
 * 用类型检查器按 AST 取每个 `UIEngine.<name> = <函数表达式>` **右侧表达式的类型**
 * （`scripts/oneoff/gen-engine-members.mjs`，只读）。**不能读属性**：容器本身是
 * `Record<string, any>`，`UIEngine.x` 读出来永远是 `any` —— 有类型的是右侧那个函数表达式。
 *
 * ## 两处**不是**机械抄写的地方
 *
 * 1. `renderingFunction: () => void` —— **它没有 `this`**，且这是刻意的：它被 `Timer` **裸调用**
 *    （`stageRendering(deltaTime)`），`this` 恒为 `undefined`；里面那 7 个 draw 必须走
 *    `UI.drawXxx()`（方法调用）才能把接收者绑到单例上。给它在表里写 `this: UIShape`
 *    等于宣称一个**运行期不存在的接收者** —— 2026-09-18 那次「黑屏且不报错」就是这么来的
 *    （本文件里那段"连错三次"的注释与 `__tests__/ui-rendering-receiver.spec.ts` 守着它）。
 * 2. **`getPointerCoords` 的形参写 `UIPointerEvent`（不是实现里的 `PointerEvent`）** ——
 *    与第 201/210 轮同一条：**契约描述调用方怎么调它**。调用方（`ui-pointer.ts` 的 4 处）
 *    手里是 `UIPointerEvent`（`YamiMouseEvent & {…}`），而实现只用到 `clientX/clientY`
 *    （经 `getRelativeCoords`）⇒ 把实现那一侧的形参一起改成 `UIPointerEvent` 即可，
 *    **不新增任何断言**。
 * 3. 其余成员都写成**函数属性**（`(this: UIShape, …) => R`）而不是方法简写 —— 与第 131/134 轮
 *    同一条：方法简写会让 `typescript(unbound-method)` 在搬运点报出来，而函数属性如实表达
 *    "这是一个独立函数，`this` 由调用方给"。
 *
 * ## 装表之后暴露的两件事（第 216/217 轮实测）
 *
 * 1. `this` 一有类型，「域模块的 `this: UIShape`（单例）交给引擎成员（要 `UIFacadeShape`）」
 *    契约条目、把 `history` 改成如实的可空、并把不变式收进 `historyOf()`）。
 * 2. 调用侧开始被检查 ⇒ 上面第 2 条那个形参分歧显形。
 */
type UIEngineShape = {
	setZoom: (this: UIShape, zoom: number) => void;
	shiftAnchor: (this: UIShape, anchorX: number, anchorY: number) => void;
	shiftTarget: (this: UIShape, x: number, y: number) => void;
	resizeTarget: (this: UIShape, width?: number, height?: number) => void;
	rotateTarget: (this: UIShape, rotation: number) => void;
	setControlPoint: (this: UIShape, point: ControlPoint | null) => void;
	updateControlPoints: (this: UIShape) => void;
	getPointerCoords: (this: UIShape, event: UIPointerEvent) => { x: number; y: number };
	updateCamera: (this: UIShape, x?: number, y?: number) => void;
	updateTransform: (this: UIShape) => void;
	drawBackground: (this: UIShape) => void;
	drawElements: (this: UIShape) => void;
	drawCoordinateAxes: (this: UIShape) => void;
	drawHoverWireframe: (this: UIShape) => void;
	drawTargetWireframe: (this: UIShape) => void;
	drawTargetAnchor: (this: UIShape) => void;
	drawControlPoints: (this: UIShape) => void;
	selectControlPoint: (this: UIShape, x: number, y: number) => ControlPoint | null;
	requestRendering: (this: UIShape) => void;
	/** ⚠️ **无 `this`**（被 `Timer` 裸调用）——理由见本类型上方的第 1 条。 */
	renderingFunction: () => void;
	stopRendering: (this: UIShape) => void;
};

export const UIEngine = {} as UIEngineShape;

UIEngine.setZoom = (function IIFE() {
	return function (this: UIShape, zoom: number) {
		const slider = engineEls.get('ui-zoom') as YamiElement;
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
		// `instance` / `instances` 是装配期用 `Object.defineProperty` 挂上的**不可枚举**运行期成员
		// （不进 JSON ⇒ 数据形状里是可选，见 `element-classes.ts` 顶部那段判定记录）。
		// `getUIStore().target` 一定是画布上**已装配**的节点 —— 本文件这几处 `!`
		// 与 `ui-facade.ts` 的 `HoverNode.instance`（必填）说的是同一条不变式。
		const instances = target.instances!;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = historyOf(this);
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
		UIEngine.requestRendering!.call(this);

		if (editor.target === target) {
			write(editor, { anchorX, anchorY });
		}
	}
};

UIEngine.shiftTarget = function (this: UIShape, x: number, y: number) {
	const target = getUIStore().target;
	if (target !== null) {
		this.planToSave!();
		const instances = target.instances!;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = historyOf(this);
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
		// 这里原先有一块 `[DEBUG-instances]` 探针（`JSON.stringify` 打印 `instances instanceof Map`、
		// `typeof instances.set`、`Object.keys(instances)`），只在 `instances[0].resize` 不是函数时输出。
		// （`Array` 子类，只有 `setProperty` / `resize` / `remove`），压进去的又都是元素实例
		// （基类都有 `resize`）⇒ 那个分支与探针里的 `Map` / `.set` 判断永远不成立。
		// 探针本身是「索引签名什么都能读」时代的产物：`instances.set` / `instances.name`
		// 在具名类型下根本不存在。
		instances.resize();
		UIEngine.requestRendering!.call(this);

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
		const instances = target.instances!;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = historyOf(this);
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
		UIEngine.requestRendering!.call(this);

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
		const instances = target.instances!;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = historyOf(this);
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
		UIEngine.requestRendering!.call(this);

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
				const angle = modDegrees(point.angle + this.controlPointRotation, 180);
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
		const instance = target.instance!;
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
		let rotation = instance.transform.rotation;
		// 沿父链累加旋转，**到「没有 transform 的祖先」为止**。
		//
		// ⚠️ 终止条件必须同时看 `transform`：`52ced02b1` 曾把它写成只判 `parent !== null`，
		// 理由是「`transform` 在具名类型下非可选（`element-base.ts` 的 `transform: TransformShape`）」。**那条前提是错的** ——
		// 根实例就是 `transform: null`（`root-element.ts` 的 `RootElement` 构造时显式传
		// `{ transform: null }`，根不参与 transform 链），而 `element-base.ts` 构造函数里那句
		// `this.transform = data.transform as TransformShape` 把这个 null 断言掉了。
		// 只判 null 的循环会一路走到根并读 `null.rotation`：**每帧抛**
		// `Cannot read properties of null (reading 'rotation')`（`drawControlPoints` 起点），
		// 表现是「选中任意元素后控制点/选中框不再绘制，控制台每帧刷一条」。
		// 这也正是重构前 `while ((element = element.parent)?.transform)` 的语义，此处逐字保留。
		for (let parent = instance.parent; parent?.transform; parent = parent.parent) {
			rotation += parent.transform.rotation;
		}
		this.controlPointRotation = rotation;
	}
};

UIEngine.getPointerCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: UIShape, event: UIPointerEvent) {
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
	screenScrollData(screen).rawScrollLeft =
		clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - GL.width) / dpr;
	screenScrollData(screen).rawScrollTop =
		clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - GL.height) / dpr;
	screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceForDPR) / dpr;
	screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceForDPR) / dpr;
};

UIEngine.updateTransform = function (this: UIShape) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const left = roundTo(screen.scrollLeft * dpr - this.paddingLeft, 4);
	const top = roundTo(screen.scrollTop * dpr - this.paddingTop, 4);
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
	const scrollX = screenScrollData(screen).rawScrollLeft * dpr + this.centerOffsetX;
	const scrollY = screenScrollData(screen).rawScrollTop * dpr + this.centerOffsetY;
	this.centerX = roundTo((scrollX - this.paddingLeft) / this.scaleX, 4);
	this.centerY = roundTo((scrollY - this.paddingTop) / this.scaleY, 4);
};

UIEngine.drawBackground = function (this: UIShape) {
	// 取色读 store（store 是这些字段的真源），不再依赖 `this.background`：
	const background = getUIStore().background;
	if (!background) return;
	const gl = GL;
	gl.clearColor(...background.getGLRGBA());
	gl.clear(gl.COLOR_BUFFER_BIT);
};

UIEngine.drawElements = function (this: UIShape) {
	// 同上：`root` 也走 store（`ui-file.ts` 的 `UI.load` 里赋值、`close` 时置 null）
	getUIStore().root?.draw();
};

UIEngine.drawCoordinateAxes = function (this: UIShape) {
	const target = getUIStore().target;
	if (target !== null) {
		// 坐标轴画的是**父元素**的框（`parent.matrix` / `parent.x`…）。`parent` 非空是不变式：
		// 画布树里的节点都由 `ui-file.ts` 的 `loadElement` 递归挂到根实例之下
		// （`element-base.appendChild` 会给每个元素设 `parent`），只有根实例自己没有父元素，
		// 而根**不是**可选中的 `target`。原先这里靠 `target.instance` 与 `parent` 的索引签名
		// 一路免检，本轮按这条前提写 `!`（破坏时当场抛错，与之前行为一致）。
		const parent = target.instance!.parent!;
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const matrix = gl.matrix.set(getUIStore().matrix!).multiply(parent.matrix);
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
		vertices[5] = dist(x1, y1, x2, y2);
		vertices[6] = x3;
		vertices[7] = y3 + 0.5;
		vertices[8] = 0;
		vertices[9] = x4;
		vertices[10] = y4 + 0.5;
		vertices[11] = dist(x3, y3, x4, y4);
		vertices[12] = x5 + 0.5;
		vertices[13] = y5;
		vertices[14] = 0;
		vertices[15] = x6 + 0.5;
		vertices[16] = y6;
		vertices[17] = dist(x5, y5, x6, y6);
		vertices[18] = x7 + 0.5;
		vertices[19] = y7;
		vertices[20] = 0;
		vertices[21] = x8 + 0.5;
		vertices[22] = y8;
		vertices[23] = dist(x7, y7, x8, y8);
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
		const instance = target.instance!;
		instance.drawWireframe(0xffc0ff00);
	}
};

UIEngine.drawTargetAnchor = function (this: UIShape) {
	const target = getUIStore().target;
	if (target !== null) {
		const instance = target.instance!;
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const matrix = gl.matrix.set(getUIStore().matrix!).multiply(instance.matrix);
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
		UIEngine.updateControlPoints!.call(this);
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
		const matrix = gl.matrix
			.project(gl.flip, gl.width, gl.height)
			.multiply(getUIStore().matrix!);
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.uniform1i(program.u_LightMode, 0);
		gl.uniform1i(program.u_ColorMode, 0);
		gl.uniform4f(program.u_Tint, 0, 0, 0, 0);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		// `texture.base` 在类型上可空，但不变式是「贴图建好后 base 必然已挂上」
		// （`ui-initialize.ts:88` 也是直接 `this.controlPointTexture.base.protected = true`）。
		// 这里 `!` 只是把这条既有前提显式写出来 —— ④-1b 去掉索引签名后它才第一次被 tsc 看见。
		gl.bindTexture(gl.TEXTURE_2D, texture.base!.glTexture);
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
		Timer.appendUpdater!('stageRendering', UIEngine.renderingFunction);
	}
};

UIEngine.renderingFunction = function () {
	if (GL.width * GL.height !== 0) {
		// ⚠️ 这里是全仓**唯一**「接收者不在手」的地方，务必与别处的改写形态区分开。
		//
		//   · 本函数是由 `Timer` 直接调用的：`timer.ts:195` 是
		//     `stageRendering(deltaTime)` —— **裸函数调用，没有接收者**，所以
		//     本函数自己的 `this` 恒为 `undefined`（不是"指向了错的对象"，是根本没有）。
		//   · 因此下面 7 个 draw 只能**显式**指定接收者，且只能是 `UI`
		//     （实现里的 `this.scaleX` / `this.centerX` 等靠它取到值）。
		//   · 曾一度（2026-09-18）改成 `UIEngine.drawXxx!.call(this)` 并加
		//     `if (!this?.renderingFunction) return` 作保护：因为 `this` 恒为 `undefined`，
		//     那个保护**每帧都提前 return** ⇒ **「不报错但整个 UI 画布一片黑」**（连错三次）。
		//
		// `UIEngine.x!.call(this/UI, …)` 时，**这 7 处必须传 `UI`**，不能跟着写成 `.call(this)`：
		// 别处的 `this` 是真实接收者，这里的 `this` 不存在 —— 形式相似，含义相反。
		// 该不变式现在有会失败的用例兜着：`__tests__/ui-rendering-receiver.spec.ts`
		// 裸调用本函数，断言 7 个 draw 全部执行且接收者都不是 `undefined`（改回 `.call(this)` 即红）。
		//
		// 数据源已经迁走：`drawBackground` 读 store 的 `background`、
		// `drawElements` 读 store 的 `root`，所以这两处不再依赖 `this.*`；
		// 其余几个仍读 `this.*`，因此 `UI` 这个接收者依旧是承重的。
		UIEngine.drawBackground!.call(UI);
		UIEngine.drawElements!.call(UI);
		UIEngine.drawCoordinateAxes!.call(UI);
		UIEngine.drawHoverWireframe!.call(UI);
		UIEngine.drawTargetWireframe!.call(UI);
		UIEngine.drawTargetAnchor!.call(UI);
		UIEngine.drawControlPoints!.call(UI);
	}
};

UIEngine.stopRendering = function (this: UIShape) {
	Timer.removeUpdater!('stageRendering', UIEngine.renderingFunction);
};

// 转发优先走这里、而不是 `ui-window.ts` 的镜像。**必须放在文件末尾**（上面所有挂载都已就位）。
// 为什么用注册而不是让 store import 本模块：本模块已静态 import store，反向会成静态环。
// 见 `stores/ui.ts` 里 `registerUIEngine` 的说明。
registerUIEngine(UIEngine);
