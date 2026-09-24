import { drawAndFitImage } from '@app/utils/element-utils';
import { File } from '@app/file/file-system-core.ts';
import { getPaletteStore } from '@app/stores/palette';
import { getAutoTileStore } from '@app/stores/auto-tile';
import type { AutoTile } from '@app/palette/auto-tile.ts';
import { getDevicePixelContentBoxSize } from '@app/utils/css';

type AutoTileNodeData = {
	rule: number;
	frames: number[];
};

type AutoTileTemplateData = {
	id: string;
	name: string;
	cover: number;
	nodes: AutoTileNodeData[];
};

/**
 * `AutoTileEngine` 的成员表 —— 口径收紧（2026-09-22，`any-hatches` 收口）。
 *
 * 此前是 `export const AutoTileEngine: Record<string, any> = {}` 后面跟 5 行赋值。
 * `any` 的代价：这个名字面上**任何**成员名都能编译通过，而唯一的消费方
 * `palette/auto-tile.ts` 是**逐条镜像**到 `AutoTile` 上
 * （`AutoTile.updateCanvas = AutoTileEngine.updateCanvas;` …共 5 条）——
 * 一旦某条拼错，镜像就静默挂了个 `undefined`，要到运行时才发现（本仓反复吃过的「静默失效」）。
 *
 * 5 个成员各自独立（不互相引用、也不引用文件下方的声明），所以按 PHASE-1C「个位数就走本地窄类型」
 * 的办法：**声明本地成员表**，5 个实现一行不动。类型由这里给出，消费方与镜像点从此受检查。
 * （另有一条路线是整体改成对象字面量、让类型全部由实现推断——那是 `scene-draw-engine.ts`
 * 第 63 轮的做法；这里保留赋值式写法是为了把改动限制在声明上。）
 */
interface AutoTileEngineShape {
	// ⚠️ 写成**函数属性**（`x: (this: T, …) => R`）而不是方法简写（`x(this: T, …): R`）：
	// 5 个成员都是**赋值上去的函数表达式**，且被逐条搬运（`AutoTile.x = AutoTileEngine.x`），
	// 它们不是「方法」。方法简写会让 `typescript(unbound-method)` 在那 5 个搬运点报
	// 「引用了未绑定的方法」—— 而 `any` 时代这个信号被一起吞掉了（本仓 lint 视为错误）。
	// 属性写法同样保留 `this` 约束与参数检查，且如实描述「函数值被搬运」这件事。
	shiftTemplateFrames: (
		this: typeof AutoTile,
		template: AutoTileTemplateData,
		offsetX: number,
		offsetY: number
	) => void;
	generateFrames: (
		this: typeof AutoTile,
		id: number,
		strideX: number,
		strideY: number,
		count: number
	) => void;
	createFrameData: (this: typeof AutoTile) => number;
	updateCanvas: (this: typeof AutoTile) => void;
	/**
	 * 实现里有一条 `return File.get!(…).then(…)` 的路径（贴图异步加载后重画），
	 * 但**返回值历来无人消费**（调用点全是语句式调用）⇒ 按 `void` 声明，
	 * 调用方不应依赖这个 Promise（要依赖就显式改成 `void | Promise<void>`）。
	 */
	drawFrame: (this: typeof AutoTile) => void;
}

export const AutoTileEngine = {} as AutoTileEngineShape;

AutoTileEngine.shiftTemplateFrames = function (
	this: typeof AutoTile,
	template: AutoTileTemplateData,
	offsetX: number,
	offsetY: number
) {
	const sprite = this.image;
	if (!(sprite instanceof Image)) {
		return;
	}
	const tileWidth = getPaletteStore().tileset.tileWidth;
	const tileHeight = getPaletteStore().tileset.tileHeight;
	const hframes = Math.floor(sprite.naturalWidth / tileWidth);
	const vframes = Math.floor(sprite.naturalHeight / tileHeight);
	const ox = ((offsetX % hframes) + hframes) % hframes;
	const oy = ((offsetY % vframes) + vframes) % vframes;
	for (const node of template.nodes) {
		const frames = node.frames;
		const length = frames.length;
		for (let i = 0; i < length; i++) {
			const frame = frames[i];
			const sx = frame & 0xff;
			const sy = frame >> 8;
			const dx = (sx + ox) % hframes;
			const dy = (sy + oy) % vframes;
			frames[i] = dx | (dy << 8);
		}
	}
	this.createFrameItems();
	getAutoTileStore().changed = true;
};

AutoTileEngine.generateFrames = function (
	this: typeof AutoTile,
	id: number,
	strideX: number,
	strideY: number,
	count: number
) {
	const sprite = this.image;
	if (!(sprite instanceof Image)) {
		return;
	}
	const tileWidth = getPaletteStore().tileset.tileWidth;
	const tileHeight = getPaletteStore().tileset.tileHeight;
	const hframes = Math.floor(sprite.naturalWidth / tileWidth);
	const vframes = Math.floor(sprite.naturalHeight / tileHeight);
	const ox = ((strideX % hframes) + hframes) % hframes;
	const oy = ((strideY % vframes) + vframes) % vframes;
	const maximum = this.frameMaximum;
	const frames = this.frames;
	const frame = frames[id];
	let x = frame & 0xff;
	let y = frame >> 8;
	count = Math.min(count, maximum - frames.length);
	while (count-- > 0) {
		x = (x + ox) % hframes;
		y = (y + oy) % vframes;
		frames.splice(++id, 0, x | (y << 8));
	}
	this.createFrameItems();
	getAutoTileStore().changed = true;
};

AutoTileEngine.createFrameData = function (this: typeof AutoTile) {
	return 0;
};

AutoTileEngine.updateCanvas = function (this: typeof AutoTile) {
	const canvas = this.canvas;
	const { width, height } = getDevicePixelContentBoxSize(canvas);
	if (canvas.width !== width) {
		canvas.width = width;
	}
	if (canvas.height !== height) {
		canvas.height = height;
	}
};

AutoTileEngine.drawFrame = function (this: typeof AutoTile) {
	const canvas = this.canvas;
	const context = canvas.getContext('2d');
	const width = canvas.width;
	const height = canvas.height;

	context.clearRect(0, 0, width, height);

	if (!(this.image instanceof Image)) {
		if (this.image === this.noImage) return;
		const guid = getAutoTileStore().imageId;
		if (!guid) {
			return;
		}
		const symbol = (this.image = Symbol());
		return File.get!({
			guid: guid,
			type: 'image'
		}).then((image: CanvasImageSource | null) => {
			if (this.image === symbol) {
				if (image) {
					this.image = image;
					this.drawFrame();
				} else {
					this.image = this.noImage;
				}
			}
		});
	}

	const image = this.image;
	const frames = this.frames;
	const frame = frames[getAutoTileStore().frameIndex];
	const tileWidth = getPaletteStore().tileset.tileWidth;
	const tileHeight = getPaletteStore().tileset.tileHeight;
	const x = (getAutoTileStore().offsetX + (frame & 0xff)) * tileWidth;
	const y = (getAutoTileStore().offsetY + (frame >> 8)) * tileHeight;

	drawAndFitImage(context, image, x, y, tileWidth, tileHeight);
};
