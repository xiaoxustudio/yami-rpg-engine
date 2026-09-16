import { Data } from '@app/data/data-object.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { elementDataOf } from '@ui-kit';

/**
 * P4b：选框元素上的 `key`（当前选框状态名：tile / terrain / object…）走显式元素数据。
 * 同一元素上的 `visible` / `x` / `y` 等不是元素数据——它们由 `YMMarqueeArea.vue` 定义成
 * **组件自己的实例属性**（实例属性优先于原型访问器）。
 */
interface SceneMarqueeData {
	key: string | null;
}
const marqueeData = (el: unknown): SceneMarqueeData => elementDataOf<SceneMarqueeData>(el);

// oxlint-disable-next-line no-explicit-any
export const SceneMarqueeEngine: Record<string, any> = {};
// 选框 - 保存状态
SceneMarqueeEngine.save = function (this: typeof Scene.marquee, key = 'default') {
	let data;
	switch (key) {
		case 'object':
			data = {} as Record<string, unknown>;
			break;
		case 'tile':
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				tiles: this.tiles
			};
			break;
		case 'terrain':
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				terrain: this.terrain
			};
			break;
		case 'eraser':
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				tiles: this.tiles,
				terrain: 0b00
			};
			break;
		default:
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY
			};
			break;
	}
	this.saveData[key as string] = data;
};

// 选框 - 切换状态
SceneMarqueeEngine.switch = function (this: typeof Scene.marquee, key: string) {
	const data = marqueeData(this);
	if (data.key !== key) {
		this.save(data.key);
		this.restore((data.key = key));
	}
};

// 选框 - 调整位置
SceneMarqueeEngine.resize = function (this: typeof Scene.marquee) {
	if (this.pointerevent !== null) {
		Scene.marqueePointermove!(this.pointerevent);
	}
};

// 选框 - 擦除矩形
SceneMarqueeEngine.clear = function (this: typeof Scene.marquee) {
	if (this.visible) {
		this.visible = false;
		Scene.requestRendering!();
	}
	if (Scene.info.textContent && !(Scene.layer === 'object' && Scene.target !== null)) {
		Scene.info.textContent = '';
	}
};

// 选框 - 选取矩形
SceneMarqueeEngine.select = function (
	this: typeof Scene.marquee,
	x = this.x,
	y = this.y,
	width = this.width,
	height = this.height
) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.visible = true;
	Scene.requestRendering!();
};

// 选框 - 选取矩形: 橡皮, 铅笔, 填充模式
SceneMarqueeEngine.selectInPencilMode = function (
	this: typeof Scene.marquee,
	x: number,
	y: number,
	width: number,
	height: number
) {
	this.backgroundColor = this.backgroundColorNormal;
	this.borderColor = this.borderColorNormal;
	this.previewTiles = true;
	this.select(x, y, width, height);
	const left = this.x - this.offsetX;
	const top = this.y - this.offsetY;
	Scene.info.textContent = `${left},${top}`;
};

// 选框 - 选取矩形: 矩形, 椭圆模式
SceneMarqueeEngine.selectInRectMode = function (
	this: typeof Scene.marquee,
	x: number,
	y: number,
	width: number,
	height: number
) {
	this.backgroundColor = this.backgroundColorRect;
	this.borderColor = this.borderColorRect;
	this.previewTiles = false;
	this.select(x, y, width, height);
	Scene.info.textContent = `${this.width} x ${this.height}`;
};

// 选框 - 选取矩形: 复制模式
SceneMarqueeEngine.selectInCopyMode = function (
	this: typeof Scene.marquee,
	x: number,
	y: number,
	width: number,
	height: number
) {
	this.backgroundColor = this.backgroundColorCopy;
	this.borderColor = this.borderColorCopy;
	this.previewTiles = false;
	this.select(x, y, width, height);
	Scene.info.textContent = `${this.width} x ${this.height}`;
};

// 选框 - 选取矩形: 对象模式
SceneMarqueeEngine.selectInObjectMode = function (
	this: typeof Scene.marquee,
	x: number,
	y: number
) {
	Scene.info.textContent = `${x},${y}`;
};

// 选框 - 获取图块数据
SceneMarqueeEngine.getTiles = function (this: typeof Scene.marquee, raw: boolean) {
	const sTiles = this.tiles;
	if (raw) return sTiles;
	let dTiles = sTiles.standard;
	if (dTiles === undefined) {
		dTiles = sTiles;
		const tilesetMap = this.tilesetMap;
		const tilesets = Data.tilesets;
		const length = sTiles.length;
		for (let i = 0; i < length; i++) {
			let tile = sTiles[i];
			if (tile === 0) continue;
			const guid = tilesetMap[tile >> 24];
			const tileset = tilesets[guid];
			if (tileset?.type === 'auto') {
				if (dTiles === sTiles) {
					dTiles = Scene.cloneTiles!(sTiles);
				}
				dTiles[i] = tile & 0xffffffc0;
			}
		}
		sTiles.standard = dTiles;
	}
	return dTiles;
};
