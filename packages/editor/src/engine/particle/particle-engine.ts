import { Scene } from '@app/scene/scene-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { Easing } from '@app/data/transition-window.ts';
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import { PARTICLE_APPEAR_TIMEOUT_MS } from '@app/constants/editor.ts';
import { debounce } from '@app/utils/safe';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';
import { randomBetween, radians } from '@app/utils/math';
import { empty as fnEmpty } from '@app/utils/function';

/**
 * 粒子引擎的**类注册表**：三个类在本文件末尾（各自的 class 声明之后）装配，
 * 唯一消费方 `particle-initialize.ts` 在初始化期取用 —— 那时三者都已就位。
 * 成员因此声明为**可选**（装配前确实缺席），读点用 `!` 把这个不变式写明。
 */
interface ParticleEngineShape {
	Emitter?: typeof ParticleEmitter;
	Layer?: typeof ParticleLayer;
	Element?: typeof ParticleElement;
}

export const ParticleEngine: ParticleEngineShape = {};

const debouncedStageRender = debounce(() => Scene.requestRendering!(), 60);

interface ParticleEmitterData {
	layers: ParticleLayerData[];
	[k: string]: unknown;
}

/**
 * 粒子图层数据（`layer.data`）。
 *
 * 第 145 轮合并：此前这里有**两份**声明描述同一个运行期对象 —— 本接口只写引擎发射逻辑用到的
 * `interval` / `delay` / `area`，而 `ParticleElementLayerData`（原 `:95`）写元素读到的
 * `lifetime` / `anchor` / `rotation` / … —— 于是 `new ParticleElement(this)` 处
 * `this` 不满足 `ParticleElementLayer`（`TS2345`：`ParticleLayerData` 缺 `lifetime`、
 * `lifetimeDev`、`fadeout`、`anchor` 等 9 个成员），只能写 `this as unknown as ParticleElementLayer`
 * 从半边跳到另半边（与第 118/144 轮同一病症）。合并成一份之后两处共用它，断言消失。
 *
 * 字段类型取原 `ParticleElementLayerData` 的写法：随机参数字段是 `[standard, deviation]` 元组，
 * 纯值字段是 `number`。
 *
 * **导出**：窗口侧 `particle-window.ts` 的 `ParticleLayerDataShape` 现在直接引用它
 * （此前那两份同名声明各自漂移 —— 合并之后由本文件一处定义）。
 */
/**
 * 「当前舞台」（`ParticleElement.stage` / `Particle.Element.stage`）的面。
 *
 * 第 237 轮从类里的内联类型提出来并**导出**：窗口侧 `particle-window.ts` 的
 * `ParticleComponentShape.Element.stage` 此前是 `Record<string, any>`（`any-hatches` 的一个站点），
 * 现在两边引用同一个类型，写入点也就有了检查。
 *
 * ⚠️ 这里**不收 `requestRendering`**：`ParticleElement.stage` 的读点只有 `matrix` 与四处 `scroll*`
 * （`particle-engine.ts:629/1225-1228/1271-1274`），全仓没有一处读 `stage.requestRendering`
 * ⇒ 舞台面只描述**真正被读的面**（原先内联声明里那个 `requestRendering` 是多余的，
 * 而它正是三个写入点里两个报「缺成员」的原因）。
 */
export interface ParticleStageShape {
	matrix: Matrix;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
}

export interface ParticleLayerData {
	/** 图层名（`particle-motion.ts` 的信息栏、图层列表读） */
	name?: string;
	/** 隐藏标记（`particle-motion.ts` 的绘制循环 `if (layer.data.hidden) continue`） */
	hidden?: boolean;
	interval: number;
	delay: number;
	area: {
		type: 'edge' | 'point' | 'rectangle' | 'circle';
		x?: number;
		y?: number;
		width?: number;
		height?: number;
		radius?: number;
	} & Record<string, unknown>;
	lifetime: number;
	lifetimeDev: number;
	fadeout: number;
	anchor: {
		x: [number, number];
		y: [number, number];
		speedX: [number, number];
		speedY: [number, number];
	};
	rotation: {
		angle: [number, number];
		speed: [number, number];
		accel: [number, number];
	};
	hRotation: {
		offsetX: number;
		offsetY: number;
		radius: [number, number];
		expansionSpeed: [number, number];
		expansionAccel: [number, number];
		angle: [number, number];
		angularSpeed: [number, number];
		angularAccel: [number, number];
	};
	movement: {
		angle: [number, number];
		speed: [number, number];
		accelAngle: [number, number];
		accel: [number, number];
		// 兼容旧调用路径
		speedX?: number;
		speedY?: number;
		accelX?: number;
		accelY?: number;
	};
	scale: {
		factor: [number, number];
		speed: [number, number];
		accel: [number, number];
	};
	sprite: {
		mode: string;
		hframes: number;
		vframes: number;
		interval: number;
	};
	// —— 以下六个字段是第 151 轮**从读点逆推**出来的：本接口原先靠 `[k: string]: any` 兜着，
	//    摘掉那行索引签名后 tsc 只报了 12 条 TS2339、全在本文件，正好给出候选清单 ——
	/** 排序模式：`draw` 里 `switch (data.sort)` 的三个 case（值来自工程数据，故不收成联合类型） */
	sort: string;
	/** 混合模式：直接赋给 `gl.blend` */
	blend: string;
	/** 光照模式键：`ParticleLayer.lightSamplingModes` 的下标 */
	light: string;
	/** 贴图 guid：`loadTexture` 里与 `texture.base.guid` 比对 */
	image: string;
	/** 元素数量：`updateCount` 里 `0` 表示不限（改成 `1e16`） */
	count: number;
	/**
	 * 颜色分组：`mode` 决定用哪一组（`fixed`→`rgba`、`random`→`min`/`max`、
	 * `easing`→`easingId`+`start*`/`end*`、`texture`→`tint`）。
	 *
	 * ⚠️ 四组在运行期**互斥存在**（inspector 切模式时会删掉不用的组，见
	 * `inspector/particle-layer-page.ts:285`），但引擎只在**对应 mode 的分支**里读对应那组
	 * （`updateMethods` 按 mode 装载 `setStartColor*`）⇒ 这里按「全组可读」声明，
	 * 以免给十来个字段各加一次非空断言；这条取舍是明写的，不是默认。
	 */
	color: {
		mode: string;
		tint: number[];
		easingId: string;
		rgba: number[];
		min: number[];
		max: number[];
		startMin: number[];
		startMax: number[];
		endMin: number[];
		endMax: number[];
	};
}

interface OuterRect {
	left: number;
	top: number;
	right: number;
	bottom: number;
	width: number;
	height: number;
	hasArea: boolean;
}

interface ParticleElementRef {
	initialize: () => void;
	// oxlint-disable-next-line no-explicit-any
	update: (deltaTime: number) => any;
	updateMethods: () => void;
	draw: (vi: number) => void;
	scaleFactor: number;
	spriteX: number;
	spriteY: number;
	// 渲染读点（`animation-motion.ts` / `particle-motion.ts` 的 wireframe 绘制）——
	// 此前只在窗口侧那份 `ParticleElementShape` 里写着，两份声明各自漂移；本轮合并到这一处。
	x: number;
	y: number;
	anchorX: number;
	anchorY: number;
	rotationAngle: number;
}

interface ParticleEmitterShape {
	speed: number;
	opacity: number;
	scale: number;
	angle: number;
	startX: number;
	startY: number;
	layers: ParticleLayerShape[];
	matrix: Matrix | null;
}

export interface ParticleLayerShape {
	emitter: ParticleEmitterShape;
	data: ParticleLayerData;
	texture: ImageTexture | null;
	textureWidth: number;
	textureHeight: number;
	unitWidth: number;
	unitHeight: number;
	elapsed: number;
	easing: { ease(t: number): number } | null;
	capacity: number;
	count: number;
	stocks: number;
	elements: ParticleElementRef[] & { count: number };
	reserves: ParticleElementRef[] & { count: number };
	/** 引擎装配时把 `ParticleEngine.*` 的实现挂到图层对象上（读点见 render/update 循环） */
	emitParticles: (deltaTime: number) => void;
	updateParticles: (deltaTime: number) => number;
	/** `opacity` 可省：类的实现就是 `draw(opacity = 1)`（编辑器预览走 `layer.draw()`） */
	draw: (opacity?: number) => void;
	updateEasing: () => void;
	clear: () => void;
	destroy: () => void;
	/** —— inspector 改参数后逐个调用（`particle-layer-page.ts`；实现都在 `ParticleLayer` 上）—— */
	updateElementMethods: () => void;
	updateCount: () => void;
	loadTexture: () => void;
	calculateElementSize: () => void;
	resizeElementIndices: () => void;
}

interface ParticleEmitterRef {
	scale: number;
	angle: number;
	startX: number;
	startY: number;
	matrix: Matrix | null;
}

export interface ParticleElementLayer {
	emitter: ParticleEmitterRef;
	data: ParticleLayerData;
	/** 渲染尺寸：由精灵帧尺寸算出（读点见 render 循环，赋点见 unitWidth/unitHeight） */
	unitWidth: number;
	unitHeight: number;
	textureWidth: number;
	textureHeight: number;
	/**
	 * 缓动器：只用到 `ease(0..1)`（`Easing` 是值不是类型，故按结构写）。
	 *
	 * 第 145 轮补 `| null`：图层只在 `color.mode === 'easing'` 时才赋值（`:632`），
	 * 而元素侧 `updateColor` 也只在同一模式下被装成 `updateColorEasing`（`:1057`）
	 * ⇒ 读点（`:1281`）带 `!` 表达这条不变式；这样「类可空、元素要求非空」不再互斥，
	 * `new ParticleElement(this)` 的断言得以删除，且不变式一旦被破坏仍是**当场抛错**（与改动前一致）。
	 */
	easing: { ease(t: number): number } | null;
}

class ParticleEmitter {
	alwaysEmit: boolean;
	visible: boolean;
	anchorY: number;
	data: ParticleEmitterData;
	startX: number;
	startY: number;
	angle: number;
	scale: number;
	speed: number;
	opacity: number;
	matrix: Matrix | null;
	layers: ParticleLayerShape[];

	// —— 编辑器侧在这些实例上挂的运行期状态（`declare` 不产生运行期代码；装配点见各条注释）——
	/** 包围盒快照：`scene-context.ts` 用 `calculateOuterRect()` 的结果写，`animation-motion.ts` 逐个回写 */
	declare bounding: OuterRect;
	declare hasArea: boolean;
	declare outerLeft: number;
	declare outerTop: number;
	declare outerRight: number;
	declare outerBottom: number;
	declare outerWidth: number;
	declare outerHeight: number;
	/** 编辑器选中态（粒子列表 / 指针用它高亮当前发射器） */
	declare active: boolean;
	declare selected: boolean;
	/** 元素清空后由调用方置位（`animation-player.ts`） */
	declare disabled: boolean;
	/** 来源图层（动画播放器装配时挂上；唯一读点 `emitter.layer.order`） */
	declare layer: { order?: 'before' | 'after' };

	constructor(data: ParticleEmitterData) {
		let alwaysEmit = false;
		const sLayers = data.layers;
		const sLength = sLayers.length;
		const dLayers = Array.from<ParticleLayerShape>({ length: sLength });
		for (let i = 0; i < sLength; i++) {
			const sLayer = sLayers[i];
			// 如果有一个粒子层的发射区域是屏幕边缘，设为总是发射和绘制
			if (sLayer.area.type === 'edge') {
				alwaysEmit = true;
			}
			dLayers[i] = new ParticleLayer(this, sLayers[i]);
		}
		this.alwaysEmit = alwaysEmit;
		this.visible = false;
		this.anchorY = 0;
		this.data = data;
		this.startX = 0;
		this.startY = 0;
		this.angle = 0;
		this.scale = 1;
		this.speed = 1;
		this.opacity = 1;
		this.matrix = null;
		this.layers = dLayers;
	}

	calculateOuterRect(): OuterRect {
		let L = Infinity;
		let T = Infinity;
		let R = -Infinity;
		let B = -Infinity;
		for (const { area } of this.data.layers) {
			switch (area.type) {
				case 'edge':
					continue;
				case 'point':
					L = Math.min(L, area.x!);
					T = Math.min(T, area.y!);
					R = Math.max(R, area.x!);
					B = Math.max(B, area.y!);
					break;
				case 'rectangle':
					L = Math.min(L, area.x! - area.width! * 0.5);
					T = Math.min(T, area.y! - area.height! * 0.5);
					R = Math.max(R, area.x! + area.width! * 0.5);
					B = Math.max(B, area.y! + area.height! * 0.5);
					continue;
				case 'circle':
					L = Math.min(L, area.x! - area.radius!);
					T = Math.min(T, area.y! - area.radius!);
					R = Math.max(R, area.x! + area.radius!);
					B = Math.max(B, area.y! + area.radius!);
					continue;
			}
		}
		// 最小外部矩形宽度32
		if (L > R) {
			L = R = 0;
		} else if (R - L < 32) {
			const padding = 32 - (R - L);
			L += -padding >> 1;
			R += +padding >> 1;
		}
		// 最小外部矩形高度32
		if (T > B) {
			T = B = 0;
		} else if (B - T < 32) {
			const padding = 32 - (B - T);
			T += -padding >> 1;
			B += +padding >> 1;
		}
		return {
			left: L,
			top: T,
			right: R,
			bottom: B,
			width: R - L,
			height: B - T,
			hasArea: L !== R && T !== B
		};
	}

	/**
	 * 按**数据对象同一性**取图层实例（`layer.data === layerData`）。
	 * 因此入参写成 `object` 而不是 `ParticleLayerData`：调用方给的是「自己手上那份数据」
	 * （inspector 的 `particle-layer-page.ts` 用的是它自己的宽松视图），这里只做引用比较。
	 */
	getLayer(layerData: object): ParticleLayerShape | undefined {
		for (const layer of this.layers) {
			if (layer.data === layerData) {
				return layer;
			}
		}
	}

	updateLayers(): void {
		const map = new Map();
		for (const layer of this.layers) {
			map.set(layer.data, layer);
		}
		const sLayers = this.data.layers;
		const sLength = sLayers.length;
		const dLayers = Array.from<ParticleLayerShape>({ length: sLength });
		for (let i = 0; i < sLength; i++) {
			const sLayer = sLayers[i];
			let dLayer = map.get(sLayer);
			if (dLayer) map.delete(sLayer);
			else dLayer = new ParticleLayer(this, sLayer);
			dLayers[i] = dLayer;
		}
		for (const entries of map) {
			entries[1].destroy();
		}
		this.layers = dLayers;
	}

	update(deltaTime: number): void {
		this.emitParticles(deltaTime);
		this.updateParticles(deltaTime);
	}

	emitParticles(deltaTime: number): void {
		for (const layer of this.layers) {
			layer.emitParticles(deltaTime);
		}
	}

	updateParticles(deltaTime: number): number {
		let count = 0;
		for (const layer of this.layers) {
			count += layer.updateParticles(deltaTime);
		}
		return count;
	}

	/**
	 * 派发到各图层。`opacity` 有默认值：动画播放器那边就是 `emitter.draw()`（不传），
	 * 而图层自己的实现是 `draw(opacity = 1)` ⇒ 不传时本来就按 1 走，这里只是把**声明**对齐运行期。
	 */
	draw(opacity = 1): void {
		for (const layer of this.layers) {
			layer.draw(opacity);
		}
	}

	updateEasing(): void {
		for (const layer of this.layers) {
			layer.updateEasing();
		}
	}

	isEmpty(): boolean {
		for (const { elements } of this.layers) {
			if (elements.count !== 0) {
				return false;
			}
		}
		return true;
	}

	clear(): void {
		for (const layer of this.layers) {
			layer.clear();
		}
	}

	destroy(): void {
		for (const layer of this.layers) {
			layer.destroy();
		}
	}
}

class ParticleLayer {
	emitter: ParticleEmitterShape;
	data: ParticleLayerData;
	texture: ImageTexture | null;
	textureWidth: number;
	textureHeight: number;
	unitWidth: number;
	unitHeight: number;
	elapsed: number;
	/**
	 * 颜色缓动器。第 145 轮修正：原先声明 `Float32Array | null`，但 `:626` 赋的是
	 * `Easing.get(color.easingId)`（`transition-window.ts:121` 的 `EasingMapInstance`，
	 * 有 `ease(time): number`）；`:1268` 的读点也确实是 `easing.ease(...)`。
	 * 声明成 `Float32Array` 之所以一直没报错，是因为赋值右侧是 `any` 面 —— 又一次
	 * 「被 `any` 吞掉的错误声明」（同第 141 轮 `Curve.index`）。
	 */
	easing!: { ease(t: number): number } | null;
	capacity: number;
	count: number;
	stocks: number;
	elements: ParticleElementRef[] & { count: number };
	reserves: ParticleElementRef[] & { count: number };

	constructor(emitter: ParticleEmitterShape, data: ParticleLayerData) {
		this.emitter = emitter;
		this.data = data;
		this.texture = null;
		this.textureWidth = 0;
		this.textureHeight = 0;
		this.unitWidth = 0;
		this.unitHeight = 0;
		this.elapsed = data.interval - data.delay;
		this.capacity = 0;
		this.count = 0;
		this.stocks = 0;
		// 断言之后紧跟着把断言里声称的字段写上去 ⇒ `Object.assign` 一次写完，零断言（第 82/84 轮规则）。
		this.elements = Object.assign([], { count: 0 });
		this.reserves = Object.assign([], { count: 0 });

		this.updateCount!();

		this.updateEasing!();

		this.loadTexture!();
	}

	emitParticles(deltaTime: number) {
		let stocks = this.stocks;
		if (stocks === 0) return;
		this.elapsed += deltaTime * this.emitter.speed;
		const data = this.data;
		const dInterval = data.interval;
		let count = Math.floor(this.elapsed / dInterval);
		if (count > 0) {
			// 0 * Infinity returns NaN
			this.elapsed -= dInterval * count || 0;
			const elements = this.elements;
			const maximum = ParticleLayer.maximum;
			let eCount = elements.count;
			if (eCount === maximum) return;
			const reserves = this.reserves;
			let rCount = reserves.count;
			spawn: {
				while (rCount > 0) {
					const element = reserves[--rCount];
					elements[eCount++] = element;
					element.initialize();
					count--;
					stocks--;
					// 由于Infinity * 0返回NaN，这里分开判断
					if (count === 0 || stocks === 0) {
						break spawn;
					}
				}
				for (let i = this.capacity; i < maximum; i++) {
					elements[eCount++] = new ParticleElement(this);
					this.capacity = i + 1;
					count--;
					stocks--;
					if (count === 0 || stocks === 0) {
						break spawn;
					}
				}
			}
			elements.count = eCount;
			reserves.count = rCount;
			this.stocks = stocks;
		}
	}

	updateParticles(deltaTime: number) {
		const elements = this.elements;
		const eCount = elements.count;
		if (eCount === 0) return 0;
		const reserves = this.reserves;
		let rCount = reserves.count;
		let offset = 0;
		deltaTime *= this.emitter.speed;
		for (let i = 0; i < eCount; i++) {
			const element = elements[i];
			switch (element.update(deltaTime)) {
				case false:
					reserves[rCount + offset] = element;
					offset++;
					continue;
				default:
					if (offset !== 0) {
						elements[i - offset] = element;
					}
					continue;
			}
		}
		if (offset !== 0) {
			// 为了通知动画舞台继续更新画面 这里不对返回的粒子数量做更新(零粒子数停止播放)
			elements.count = eCount - offset;
			reserves.count = rCount + offset;
		}
		return eCount;
	}

	draw(opacity = 1) {
		const gl = GL;
		const data = this.data;
		const texture = this.texture;
		const elements = this.elements;
		const count = elements.count;
		let vi = 0;
		switch (data.sort) {
			case 'youngest-in-front':
				for (let i = 0; i < count; i++) {
					elements[i].draw(vi);
					vi += 20;
				}
				break;
			case 'oldest-in-front':
				for (let i = count - 1; i >= 0; i--) {
					elements[i].draw(vi);
					vi += 20;
				}
				break;
			case 'by-scale-factor': {
				const { min, abs, round } = Math;
				const layers = ParticleLayer.layers;
				const starts = ParticleLayer.zeros;
				const ends = ParticleLayer.sharedUint32A;
				const set = ParticleLayer.sharedUint32B;
				const times = 0x3ffff / 10;
				let li = 0;
				let si = 2;
				for (let i = 0; i < count; i++) {
					const element = elements[i];
					const key = min(0x3ffff, round(abs(element.scaleFactor) * times));
					if (starts[key] === 0) {
						starts[key] = si;
						layers[li++] = key;
					} else {
						set[ends[key] + 1] = si;
					}
					ends[key] = si;
					set[si++] = i;
					set[si++] = 0;
				}
				const queue = new Uint32Array(layers.buffer, 0, li).sort();
				for (let i = 0; i < li; i++) {
					const key = queue[i];
					let si = starts[key];
					starts[key] = 0;
					do {
						elements[set[si]].draw(vi);
						vi += 20;
					} while ((si = set[si + 1]) !== 0);
				}
				break;
			}
		}

		if (vi !== 0) {
			gl.alpha = this.emitter.opacity * opacity;
			gl.blend = data.blend;
			const program = gl.particleProgram.use();
			const vertices = gl.arrays[0].float32;
			const matrix = gl.matrix
				.project(gl.flip, gl.width, gl.height)
				.multiply(ParticleElement.stage.matrix);
			gl.bindVertexArray(program.vao);
			gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
			switch (data.color.mode) {
				default:
					gl.uniform1i(program.u_Mode, 0);
					break;
				case 'texture': {
					const tint = data.color.tint;
					const red = tint[0] / 255;
					const green = tint[1] / 255;
					const blue = tint[2] / 255;
					const gray = tint[3] / 255;
					gl.uniform1i(program.u_Mode, 1);
					gl.uniform4f(program.u_Tint, red, green, blue, gray);
					break;
				}
			}
			const lightMode = Scene.state === 'open' && Scene.showLight ? data.light : 'raw';
			gl.uniform1i(program.u_LightMode, ParticleLayer.lightSamplingModes[lightMode]);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
			gl.bindTexture(gl.TEXTURE_2D, texture!.base!.glTexture);
			gl.drawElements(gl.TRIANGLES, (vi / 20) * 6, gl.UNSIGNED_INT, 0);
			gl.alpha = 1;
			gl.blend = 'normal';
		}
	}

	loadTexture() {
		const guid = this.data.image;
		const texture = this.texture;
		if (texture instanceof ImageTexture) {
			if (texture.complete && texture.base!.guid === guid) {
				this.calculateElementSize!();
				return;
			}
			texture.destroy();
			this.texture = null;
			this.unitWidth = 0;
			this.unitHeight = 0;
		}
		if (guid) {
			const texture = new ImageTexture(guid);
			if (texture.complete) {
				this.texture = texture;
				this.calculateElementSize!();
				delete (this as Record<string, unknown>).draw;
				return;
			}
			this.texture = texture;
			texture.on('load', () => {
				if (this.texture === texture) {
					this.texture = texture;
					this.calculateElementSize!();
					debouncedStageRender();
					delete (this as Record<string, unknown>).draw;
				} else {
					texture.destroy();
				}
			});
		}
		this.draw = fnEmpty;
	}

	calculateElementSize() {
		const { data, texture } = this;
		if (!texture) return;
		this.textureWidth = texture.width;
		this.textureHeight = texture.height;
		this.unitWidth = Math.floor(texture.width / data.sprite.hframes);
		this.unitHeight = Math.floor(texture.height / data.sprite.vframes);
	}

	resizeElementIndices() {
		const sprite = this.data.sprite;
		const hframes = sprite.hframes;
		const vframes = sprite.vframes;
		const elements = this.elements;
		const count = elements.count;
		for (let i = 0; i < count; i++) {
			const element = elements[i];
			element.spriteX %= hframes;
			element.spriteY %= vframes;
		}
	}

	updateCount() {
		let { count } = this.data;
		if (count === 0) {
			count = 1e16;
		}
		this.count = count;
		this.stocks = count;
	}

	updateEasing() {
		const { color } = this.data;
		if (color.mode === 'easing') {
			this.easing = Easing.get(color.easingId);
		}
	}

	updateElementMethods() {
		this.clear!();
		const reserves = this.reserves;
		const count = reserves.count;
		for (let i = 0; i < count; i++) {
			reserves[i].updateMethods();
		}
	}

	clear() {
		const elements = this.elements;
		const reserves = this.reserves;
		const eCount = elements.count;
		let rCount = reserves.count;
		for (let i = 0; i < eCount; i++) {
			reserves[rCount++] = elements[i];
		}
		elements.count = 0;
		reserves.count = rCount;
		this.elapsed = this.data.interval - this.data.delay;
		this.stocks = this.count;
	}

	destroy() {
		if (this.texture instanceof ImageTexture) {
			this.texture.destroy();
			this.texture = null;
		}
	}

	static _sharedUint32A: Uint32Array | null;
	static _sharedUint32B: Uint32Array | null;

	static maximum = 1000;

	static layers = new Uint32Array(0x40000);

	// 静态 - 零值数组(用完后要确保所有值归零)
	static zeros = new Uint32Array(0x40000);

	static get sharedUint32A() {
		if (!this._sharedUint32A) {
			this._sharedUint32A = new Uint32Array(
				GL.arrays[0].uint32.buffer,
				512 * 512 * 88,
				512 * 512
			);
		}
		return this._sharedUint32A;
	}
	static get sharedUint32B() {
		if (!this._sharedUint32B) {
			this._sharedUint32B = new Uint32Array(
				GL.arrays[0].uint32.buffer,
				512 * 512 * 92,
				512 * 512
			);
		}
		return this._sharedUint32B;
	}

	static lightSamplingModes: Record<string, number> = { raw: 0, global: 1, ambient: 2 };
}

class ParticleElement {
	emitter!: ParticleEmitterRef;
	layer!: ParticleElementLayer;
	data!: ParticleLayerData;
	elapsed!: number;
	appeared!: boolean;
	lifetime!: number;
	fadeout!: number;
	fadeoutTime!: number;
	globalAngle!: number;
	x!: number;
	y!: number;
	anchorX!: number;
	anchorY!: number;
	anchorSpeedX!: number;
	anchorSpeedY!: number;
	movementSpeedX!: number;
	movementSpeedY!: number;
	movementAccelX!: number;
	movementAccelY!: number;
	rotationAngle!: number;
	rotationSpeed!: number;
	rotationAccel!: number;
	hRotationOffsetX!: number;
	hRotationOffsetY!: number;
	hRotationRadius!: number;
	hRotationExpansionSpeed!: number;
	hRotationExpansionAccel!: number;
	hRotationAngle!: number;
	hRotationAngularSpeed!: number;
	hRotationAngularAccel!: number;
	scaleFactor!: number;
	scaleSpeed!: number;
	scaleAccel!: number;
	spriteMode!: string;
	spriteHframes!: number;
	spriteVframes!: number;
	spriteInterval!: number;
	spriteElapsed!: number;
	spriteFrame!: number;
	spriteCount!: number;
	spriteX!: number;
	spriteY!: number;
	opacity!: number;
	// color 是 Uint32Array(5)，但运行时额外挂载 .start/.end/.changed 字段（setStartColor/updateColor 用） 注：.start/.end 运行时挂的是 Uint8Array(4)（非 number[]）
	color!: Uint32Array & {
		start?: Uint8Array | number[];
		end?: Uint8Array | number[];
		changed?: boolean;
	};
	// 运行时挂载的方法（updateMethods 内赋值）
	setStartPosition!: ((movementAngle: number) => void) | null;
	postProcessing!: (() => void) | null;
	setStartColor!: (() => void) | null;
	updateColor!: (() => void) | null;

	constructor(layer: ParticleElementLayer) {
		this.emitter = layer.emitter;
		this.layer = layer;
		this.data = layer.data;
		this.elapsed = 0;
		this.lifetime = 0;
		this.fadeout = 0;
		this.fadeoutTime = 0;
		this.globalAngle = 0;
		this.x = 0;
		this.y = 0;
		this.anchorX = 0;
		this.anchorY = 0;
		this.anchorSpeedX = 0;
		this.anchorSpeedY = 0;
		this.movementSpeedX = 0;
		this.movementSpeedY = 0;
		this.movementAccelX = 0;
		this.movementAccelY = 0;
		this.rotationAngle = 0;
		this.rotationSpeed = 0;
		this.rotationAccel = 0;
		this.hRotationOffsetX = 0;
		this.hRotationOffsetY = 0;
		this.hRotationRadius = 0;
		this.hRotationExpansionSpeed = 0;
		this.hRotationExpansionAccel = 0;
		this.hRotationAngle = 0;
		this.hRotationAngularSpeed = 0;
		this.hRotationAngularAccel = 0;
		this.scaleFactor = 0;
		this.scaleSpeed = 0;
		this.scaleAccel = 0;
		this.spriteMode = '';
		this.spriteHframes = 0;
		this.spriteVframes = 0;
		this.spriteInterval = 0;
		this.spriteElapsed = 0;
		this.spriteFrame = 0;
		this.spriteCount = 0;
		this.spriteX = 0;
		this.spriteY = 0;
		this.opacity = 0;
		this.color = new Uint32Array(5);
		this.updateMethods!();
		this.initialize!();
	}

	initialize() {
		const { emitter } = this;
		const {
			lifetime,
			lifetimeDev,
			fadeout,
			anchor,
			rotation,
			hRotation,
			movement,
			scale,
			sprite
		} = this.data;

		this.elapsed = 0;
		this.lifetime = lifetime + lifetimeDev * (Math.random() * 2 - 1);
		this.fadeout = fadeout;
		this.fadeoutTime = this.lifetime - fadeout;
		this.globalAngle = emitter.angle;
		this.scaleFactor = ParticleElement.getRandomParameter(scale.factor) * emitter.scale;
		this.scaleSpeed = (ParticleElement.getRandomParameter(scale.speed) / 1e3) * emitter.scale;
		this.scaleAccel = (ParticleElement.getRandomParameter(scale.accel) / 1e6) * emitter.scale;
		this.anchorX = ParticleElement.getRandomParameter(anchor.x);
		this.anchorY = ParticleElement.getRandomParameter(anchor.y);
		this.anchorSpeedX = ParticleElement.getRandomParameter(anchor.speedX) / 1e3;
		this.anchorSpeedY = ParticleElement.getRandomParameter(anchor.speedY) / 1e3;
		this.rotationAngle =
			radians(ParticleElement.getRandomParameter(rotation.angle)) + emitter.angle;
		this.rotationSpeed = radians(ParticleElement.getRandomParameter(rotation.speed)) / 1e3;
		this.rotationAccel = radians(ParticleElement.getRandomParameter(rotation.accel)) / 1e6;
		this.hRotationOffsetX = 0;
		this.hRotationOffsetY = 0;
		this.hRotationRadius = ParticleElement.getRandomParameter(hRotation.radius) * emitter.scale;
		this.hRotationExpansionSpeed =
			(ParticleElement.getRandomParameter(hRotation.expansionSpeed) * emitter.scale) / 1e3;
		this.hRotationExpansionAccel =
			(ParticleElement.getRandomParameter(hRotation.expansionAccel) * emitter.scale) / 1e6;
		this.hRotationAngle = radians(ParticleElement.getRandomParameter(hRotation.angle));
		this.hRotationAngularSpeed =
			radians(ParticleElement.getRandomParameter(hRotation.angularSpeed)) / 1e3;
		this.hRotationAngularAccel =
			radians(ParticleElement.getRandomParameter(hRotation.angularAccel)) / 1e6;
		const movementAngle =
			radians(ParticleElement.getRandomParameter(movement.angle)) + emitter.angle;
		const movementSpeed =
			(ParticleElement.getRandomParameter(movement.speed) * emitter.scale) / 1e3;
		this.movementSpeedX = movementSpeed * Math.cos(movementAngle);
		this.movementSpeedY = movementSpeed * Math.sin(movementAngle);
		const movementAccelAngle =
			radians(ParticleElement.getRandomParameter(movement.accelAngle)) + emitter.angle;
		const movementAccel =
			(ParticleElement.getRandomParameter(movement.accel) * emitter.scale) / 1e6;
		this.movementAccelX = movementAccel * Math.cos(movementAccelAngle);
		this.movementAccelY = movementAccel * Math.sin(movementAccelAngle);
		this.opacity = 1;
		this.spriteMode = sprite.mode;
		this.spriteHframes = sprite.hframes;
		this.spriteVframes = sprite.vframes;
		this.spriteInterval = sprite.interval;
		this.spriteElapsed = 0;
		this.spriteCount = sprite.hframes * sprite.vframes;

		switch (this.spriteMode) {
			case 'random':
				this.spriteFrame = Math.floor(Math.random() * this.spriteCount);
				this.updateSpriteFrame!();
				break;
			case 'animation':
			case 'animation-loop':
				this.spriteFrame = 0;
				this.spriteX = 0;
				this.spriteY = 0;
				break;
		}

		this.setStartPosition!(movementAngle);

		this.setStartColor!();
	}

	update(deltaTime: number) {
		this.elapsed += deltaTime;
		this.scaleSpeed += this.scaleAccel * deltaTime;
		this.scaleFactor += this.scaleSpeed * deltaTime;
		this.rotationSpeed += this.rotationAccel * deltaTime;
		this.rotationAngle += this.rotationSpeed * deltaTime;
		this.movementSpeedX += this.movementAccelX * deltaTime;
		this.movementSpeedY += this.movementAccelY * deltaTime;
		this.anchorX += this.anchorSpeedX * deltaTime;
		this.anchorY += this.anchorSpeedY * deltaTime;
		this.x += this.movementSpeedX * deltaTime;
		this.y += this.movementSpeedY * deltaTime;

		this.hRotationExpansionSpeed += this.hRotationExpansionAccel * deltaTime;
		this.hRotationRadius += this.hRotationExpansionSpeed * deltaTime;
		this.hRotationAngularSpeed += this.hRotationAngularAccel * deltaTime;
		this.hRotationAngle += this.hRotationAngularSpeed * deltaTime;
		const hRotationOffset = this.hRotationRadius * Math.cos(this.hRotationAngle);
		const hRotationOffsetX = hRotationOffset * Math.cos(this.globalAngle);
		const hRotationOffsetY = hRotationOffset * Math.sin(this.globalAngle);
		this.x += hRotationOffsetX - this.hRotationOffsetX;
		this.y += hRotationOffsetY - this.hRotationOffsetY;
		this.hRotationOffsetX = hRotationOffsetX;
		this.hRotationOffsetY = hRotationOffsetY;

		switch (this.spriteMode) {
			case 'random':
				break;
			case 'animation':
				if (
					this.spriteFrame < this.spriteCount - 1 &&
					(this.spriteElapsed += deltaTime) >= this.spriteInterval
				) {
					this.spriteElapsed -= this.spriteInterval;
					this.spriteFrame++;
					this.updateSpriteFrame!();
				}
				break;
			case 'animation-loop':
				if ((this.spriteElapsed += deltaTime) >= this.spriteInterval) {
					this.spriteElapsed -= this.spriteInterval;
					this.spriteFrame = (this.spriteFrame + 1) % this.spriteCount;
					this.updateSpriteFrame!();
				}
				break;
		}

		this.updateColor!();

		return this.postProcessing!();
	}

	draw(vi: number) {
		const layer = this.layer;
		const sw = layer.unitWidth;
		const sh = layer.unitHeight;
		const tw = layer.textureWidth;
		const th = layer.textureHeight;
		const ax = this.anchorX + 0.5;
		const ay = this.anchorY + 0.5;
		const vertices = GL.arrays[0].float32;
		const colors = GL.arrays[0].uint32;
		const matrix = GL.matrix
			.reset()
			.translate(this.x, this.y)
			.rotate(this.rotationAngle)
			.scale(this.scaleFactor, this.scaleFactor)
			.translate(-ax * sw, -ay * sh);
		const R = sw;
		const B = sh;
		const a = matrix[0];
		const b = matrix[1];
		const c = matrix[3];
		const d = matrix[4];
		const e = matrix[6];
		const f = matrix[7];
		const sx = this.spriteX * sw;
		const sy = this.spriteY * sh;
		const color = this.getColorInt!();
		const sl = sx / tw;
		const st = sy / th;
		const sr = (sx + sw) / tw;
		const sb = (sy + sh) / th;
		vertices[vi] = e;
		vertices[vi + 1] = f;
		vertices[vi + 2] = sl;
		vertices[vi + 3] = st;
		colors[vi + 4] = color;
		vertices[vi + 5] = c * B + e;
		vertices[vi + 6] = d * B + f;
		vertices[vi + 7] = sl;
		vertices[vi + 8] = sb;
		colors[vi + 9] = color;
		vertices[vi + 10] = a * R + c * B + e;
		vertices[vi + 11] = b * R + d * B + f;
		vertices[vi + 12] = sr;
		vertices[vi + 13] = sb;
		colors[vi + 14] = color;
		vertices[vi + 15] = a * R + e;
		vertices[vi + 16] = b * R + f;
		vertices[vi + 17] = sr;
		vertices[vi + 18] = st;
		colors[vi + 19] = color;
	}

	getColorInt() {
		const { color } = this;
		if (color.changed) {
			color.changed = false;
			const r = color[0];
			const g = color[1];
			const b = color[2];
			const a = Math.round(color[3] * this.opacity);
			color[4] = r + (g + (b + a * 256) * 256) * 256;
		}
		return color[4];
	}

	updateSpriteFrame() {
		this.spriteX = this.spriteFrame % this.spriteHframes;
		this.spriteY = Math.floor(this.spriteFrame / this.spriteHframes);
	}

	updateMethods() {
		const { area, color } = this.data;
		// 给不同的发射区域设置特有的方法
		switch (area.type) {
			case 'point':
				// oxlint-disable-next-line unbound-method
				this.setStartPosition = this.setStartPositionPoint;
				// oxlint-disable-next-line unbound-method
				this.postProcessing = this.postProcessingCommon;
				break;
			case 'rectangle':
				// oxlint-disable-next-line unbound-method
				this.setStartPosition = this.setStartPositionRectangle;
				// oxlint-disable-next-line unbound-method
				this.postProcessing = this.postProcessingCommon;
				break;
			case 'circle':
				// oxlint-disable-next-line unbound-method
				this.setStartPosition = this.setStartPositionCircle;
				// oxlint-disable-next-line unbound-method
				this.postProcessing = this.postProcessingCommon;
				break;
			case 'edge':
				// oxlint-disable-next-line unbound-method
				this.setStartPosition = this.setStartPositionEdge;
				// oxlint-disable-next-line unbound-method
				this.postProcessing = this.postProcessingEdge;
				break;
		}
		// 给不同的颜色模式设置特有的方法
		switch (color.mode) {
			case 'fixed':
				// oxlint-disable-next-line unbound-method
				this.setStartColor = this.setStartColorFixed;
				this.updateColor = fnEmpty;
				break;
			case 'random':
				// oxlint-disable-next-line unbound-method
				this.setStartColor = this.setStartColorRandom;
				this.updateColor = fnEmpty;
				break;
			case 'easing':
				if (this.color.start === undefined) {
					this.color.start = new Uint8Array(4);
					this.color.end = new Uint8Array(4);
				}
				// oxlint-disable-next-line unbound-method
				this.setStartColor = this.setStartColorEasing;
				// oxlint-disable-next-line unbound-method
				this.updateColor = this.updateColorEasing;
				break;
			case 'texture':
				// oxlint-disable-next-line unbound-method
				this.setStartColor = this.setStartColorTexture;
				this.updateColor = fnEmpty;
				break;
		}
	}

	transformStartPosition() {
		const { matrix } = this.emitter;
		if (matrix !== null) {
			const a = matrix[0];
			const b = matrix[1];
			const c = matrix[3];
			const d = matrix[4];
			const e = matrix[6];
			const f = matrix[7];
			const { x, y } = this;
			this.x = a * x + c * y + e;
			this.y = b * x + d * y + f;
		}
	}

	getAreaPosition() {
		const array = ParticleElement.sharedFloat64Array;
		const emitter = this.emitter;
		const area = this.data.area;
		const cos = Math.cos(emitter.angle);
		const sin = Math.sin(emitter.angle);
		const x = area.x! * emitter.scale;
		const y = area.y! * emitter.scale;
		array[0] = x * cos - y * sin;
		array[1] = x * sin + y * cos;
		return array;
	}

	setStartPositionPoint() {
		const { emitter } = this;
		const pos = this.getAreaPosition!();
		this.x = emitter.startX + pos[0];
		this.y = emitter.startY + pos[1];
		this.transformStartPosition!();
	}

	setStartPositionRectangle() {
		const { emitter } = this;
		const { area } = this.data;
		const pos = this.getAreaPosition!();
		const x = emitter.startX + pos[0];
		const y = emitter.startY + pos[1];
		const wh = (area.width! * emitter.scale) / 2;
		const hh = (area.height! * emitter.scale) / 2;
		this.x = randomBetween(x - wh, x + wh);
		this.y = randomBetween(y - hh, y + hh);
		this.transformStartPosition!();
	}

	setStartPositionCircle() {
		const { emitter } = this;
		const { area } = this.data;
		const pos = this.getAreaPosition!();
		const x = emitter.startX + pos[0];
		const y = emitter.startY + pos[1];
		const angle = Math.random() * Math.PI * 2;
		const distance = Math.random() * area.radius! * emitter.scale;
		this.x = x + distance * Math.cos(angle);
		this.y = y + distance * Math.sin(angle);
		this.transformStartPosition!();
	}

	setStartPositionEdge(movementAngle: number) {
		const stage = ParticleElement.stage;
		const scrollLeft = stage.scrollLeft;
		const scrollTop = stage.scrollTop;
		const scrollRight = stage.scrollRight;
		const scrollBottom = stage.scrollBottom;
		const width = scrollRight - scrollLeft;
		const height = scrollBottom - scrollTop;
		const weightX = Math.abs(Math.sin(movementAngle) * width);
		const weightY = Math.abs(Math.sin(movementAngle - Math.PI / 2) * height);
		const threshold = weightX / (weightX + weightY);
		const random = Math.random();
		if (random < threshold) {
			const forward = this.movementSpeedY >= 0;
			this.x = scrollLeft + (random / threshold) * width;
			this.y = forward ? scrollTop : scrollBottom;
			const vertices = this.computeBoundingRectangle!();
			this.x -= (vertices[0] + vertices[2]) / 2 - this.x;
			this.y -= forward ? vertices[3] - this.y : vertices[1] - this.y;
		} else {
			const forward = this.movementSpeedX >= 0;
			this.y = scrollTop + ((random - threshold) / (1 - threshold)) * height;
			this.x = forward ? scrollLeft : scrollRight;
			const vertices = this.computeBoundingRectangle!();
			this.y -= (vertices[1] + vertices[3]) / 2 - this.y;
			this.x -= forward ? vertices[2] - this.x : vertices[0] - this.x;
		}
	}

	// 后期处理 - 通用
	postProcessingCommon() {
		if (this.elapsed >= this.lifetime) {
			return false;
		}

		if (this.elapsed > this.fadeoutTime) {
			const elapsed = this.elapsed - this.fadeoutTime;
			const time = elapsed / this.fadeout;
			this.opacity = Math.max(1 - time, 0);
			this.color.changed = true;
		}
	}

	// 后期处理 - 屏幕边缘
	postProcessingEdge() {
		const stage = ParticleElement.stage;
		const vertices = this.computeBoundingRectangle!();
		if (
			vertices[0] < stage.scrollRight &&
			vertices[1] < stage.scrollBottom &&
			vertices[2] > stage.scrollLeft &&
			vertices[3] > stage.scrollTop &&
			this.elapsed < this.lifetime
		) {
			this.appeared = true;

			if (this.elapsed > this.fadeoutTime) {
				const elapsed = this.elapsed - this.fadeoutTime;
				const time = elapsed / this.fadeout;
				this.opacity = Math.max(1 - time, 0);
				this.color.changed = true;
			}
			return;
		}

		if (
			this.appeared ||
			this.elapsed > PARTICLE_APPEAR_TIMEOUT_MS ||
			this.elapsed >= this.lifetime
		) {
			this.appeared = false;
			return false;
		}
	}

	computeBoundingRectangle() {
		const layer = this.layer;
		const sw = layer.unitWidth;
		const sh = layer.unitHeight;
		const ax = this.anchorX + 0.5;
		const ay = this.anchorY + 0.5;
		const matrix = GL.matrix
			.reset()
			.translate(this.x, this.y)
			.rotate(this.rotationAngle)
			.scale(this.scaleFactor, this.scaleFactor)
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
		const vertices = ParticleElement.sharedFloat64Array;
		vertices[0] = Math.min(x1, x2, x3, x4);
		vertices[1] = Math.min(y1, y2, y3, y4);
		vertices[2] = Math.max(x1, x2, x3, x4);
		vertices[3] = Math.max(y1, y2, y3, y4);
		return vertices;
	}

	setStartColorFixed() {
		const { rgba } = this.data.color;
		const { color } = this;
		color.changed = true;
		color[0] = rgba[0];
		color[1] = rgba[1];
		color[2] = rgba[2];
		color[3] = rgba[3];
	}

	setStartColorRandom() {
		const { min, max } = this.data.color;
		const { color } = this;
		color.changed = true;
		color[0] = randomBetween(min[0], max[0]);
		color[1] = randomBetween(min[1], max[1]);
		color[2] = randomBetween(min[2], max[2]);
		color[3] = randomBetween(min[3], max[3]);
	}

	setStartColorEasing() {
		const { startMin, startMax, endMin, endMax } = this.data.color;
		const start = this.color.start!;
		const end = this.color.end!;
		start[0] = randomBetween(startMin[0], startMax[0]);
		start[1] = randomBetween(startMin[1], startMax[1]);
		start[2] = randomBetween(startMin[2], startMax[2]);
		start[3] = randomBetween(startMin[3], startMax[3]);
		end[0] = randomBetween(endMin[0], endMax[0]);
		end[1] = randomBetween(endMin[1], endMax[1]);
		end[2] = randomBetween(endMin[2], endMax[2]);
		end[3] = randomBetween(endMin[3], endMax[3]);
	}

	updateColorEasing() {
		const { easing } = this.layer;
		const { color } = this;
		const start = color.start!;
		const end = color.end!;
		const clamp = ParticleElement.sharedClampedArray;
		// 不变式：本方法只在 `color.mode === 'easing'` 时被装成 `updateColor`（`:1057`），
		// 而该模式下图层的 `easing` 必然已赋值（`:632`）—— 故此处 `!` 不是「圆过去」，
		// 而是把「谁保证了它非空」写在了读点上；若不变式被破坏，行为与改动前完全相同（抛错）。
		const time = Math.min(easing!.ease(this.elapsed / this.lifetime), 1);
		color.changed = true;
		clamp[0] = start[0] * (1 - time) + end[0] * time;
		clamp[1] = start[1] * (1 - time) + end[1] * time;
		clamp[2] = start[2] * (1 - time) + end[2] * time;
		clamp[3] = start[3] * (1 - time) + end[3] * time;
		color[0] = clamp[0];
		color[1] = clamp[1];
		color[2] = clamp[2];
		color[3] = clamp[3];
	}

	setStartColorTexture() {
		const { color } = this;
		color.changed = true;
		color[3] = 255;
	}

	// oxlint-disable-next-line no-explicit-any
	static stage: ParticleStageShape;

	static sharedFloat64Array = new Float64Array(4);
	static sharedClampedArray = new Uint8ClampedArray(4);

	static getRandomParameter([standard, deviation]: [number, number]) {
		return standard + deviation * (Math.random() * 2 - 1);
	}
}

ParticleEngine.Emitter = ParticleEmitter;
ParticleEngine.Layer = ParticleLayer;
ParticleEngine.Element = ParticleElement;
