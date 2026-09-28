import { elementDataOf } from '@ui-kit';
import { getElementWriter } from '@app/utils/dom';
import { inspectorEls } from './element-registry.ts';
import { clear, read, write } from '@app/utils/element-utils';
import { Codec } from '@app/engine/codec/codec.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import type { InspectorChange } from '@app/inspector/inspector.ts';
import type { YamiElement } from '@app/types/element-api';
import { Scene } from '@app/scene/scene-window.ts';

/** inspector 页管理器元素上的元素数据（`focusing` 原先靠原型访问器透明落到 WeakMap） */
interface InspectorManagerData {
	focusing: HTMLElement | null;
}
const managerData = (el: unknown): InspectorManagerData => elementDataOf<InspectorManagerData>(el);

{
	interface SceneTilemapLightItem {
		name?: string;
		tip?: string;
		value: string | number;
	}
	/**
	 * light 选择框元素（`#sceneTilemap-light`）的视图。
	 *
	 * 一个 DOM 元素（本文件的 `SceneTilemap` 用 `inspectorEls.get()` 拿到它），原声明却是纯手写
	 * 形状、连 `HTMLElement` 都不含，于是「写变更记录」处（`input: lightBox`）无法满足
	 * `InspectorChange.input: YamiElement`（实测 TS2322：`SceneTilemapLightBox` 缺 318 个成员）。
	 * 交叉写法一次补上元素身份与 API 面，又不必让本地这几个成员去和 `YamiElementApi` 的宽松
	 * 签名逐一兼容（换成 `interface extends YamiElement` 会报「incorrectly extends」：
	 * 本地的 `update(): void` 与基类的 `update(...args: unknown[]): Loose` 不兼容）。
	 */
	type SceneTilemapLightBox = YamiElement & {
		lightItems: {
			all: SceneTilemapLightItem[];
			tile: SceneTilemapLightItem[];
			sprite: SceneTilemapLightItem[];
		};
		dataItems: SceneTilemapLightItem[] | null;
		dataValue: unknown;
		loadItems(items: SceneTilemapLightItem[]): void;
		update(): void;
		setItemNames:
			| ((
					this: SceneTilemapLightBox,
					options: Record<string, string | { name?: string; tip?: string }>
			  ) => void)
			| null;
		[k: string]: unknown;
	};
	/** light 选择框元素上的元素数据（`dataItems` 原先靠原型访问器透明落到 WeakMap） */
	interface SceneTilemapLightData {
		dataItems: SceneTilemapLightItem[] | null;
	}
	const lightData = (el: unknown): SceneTilemapLightData =>
		elementDataOf<SceneTilemapLightData>(el);
	interface SceneTilemapShape {
		nameBox: HTMLElement | null;
		lightBox: SceneTilemapLightBox | null;
		target: Record<string, unknown> | null;
		update: ((tilemap: Record<string, unknown>, key: string, value: unknown) => void) | null;
		layerWrite: ((event: Event & { value: unknown }) => void) | null;
		layerInput: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	const SceneTilemap: SceneTilemapShape = {
		owner: Scene,
		target: null,
		nameBox: null,
		lightBox: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		layerWrite: null,
		layerInput: null
	};

	SceneTilemap.initialize = function () {};

	SceneTilemap.create = function (this: typeof SceneTilemap, width = 4, height = 4) {
		const tiles = Scene.createTiles!(width, height);
		return Codec.decodeTilemap!({
			class: 'tilemap',
			name: 'Tilemap',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			tilesetMap: {},
			shortcut: Scene.tilemaps.shortcuts.getEmptyIndex(),
			layer: 'background',
			order: 0,
			light: 'global',
			blend: 'normal',
			x: 0,
			y: 0,
			width: width,
			height: height,
			anchorX: 0,
			anchorY: 0,
			offsetX: 0,
			offsetY: 0,
			parallaxFactorX: 1,
			parallaxFactorY: 1,
			opacity: 1,
			code: Codec.encodeTiles!(tiles),
			conditions: [],
			events: [],
			scripts: []
		});
	};

	SceneTilemap.open = function (this: typeof SceneTilemap, tilemap: Record<string, unknown>) {
		if (this.target !== tilemap) {
			this.target = tilemap;

			const write = getElementWriter('sceneTilemap', tilemap);
			write('conditions');
			write('events');
			write('scripts');
			(
				inspectorEls.get('sceneTilemap-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	SceneTilemap.close = function (this: typeof SceneTilemap) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear(inspectorEls.get('sceneTilemap-conditions'));
			clear(inspectorEls.get('sceneTilemap-events'));
			clear(inspectorEls.get('sceneTilemap-scripts'));
			clear(inspectorEls.get('sceneTilemap-parameter-pane'));
		}
	};

	SceneTilemap.write = function (this: typeof SceneTilemap, _options: Record<string, unknown>) {
		(
			inspectorEls.get('sceneTilemap-vue-mount') as HTMLElement & {
				sync?: () => void;
			}
		)?.sync?.();
	};

	SceneTilemap.update = function (
		this: typeof SceneTilemap,
		tilemap: Record<string, unknown>,
		key: string,
		value: unknown
	) {
		Scene.planToSave!();
		switch (key) {
			case 'name':
				if (tilemap.name !== value) {
					tilemap.name = value;
					Scene.updateTargetInfo!();
					Scene.list.updateItemName(tilemap);
				}
				break;
			case 'layer':
			case 'order':
				if (tilemap[key] !== value) {
					tilemap[key] = value;
					Scene.loadObjects!();
				}
				break;
			case 'light':
			case 'blend':
			case 'x':
			case 'y':
			case 'anchorX':
			case 'anchorY':
			case 'offsetX':
			case 'offsetY':
			case 'parallaxFactorX':
			case 'parallaxFactorY':
			case 'opacity':
				if (tilemap[key] !== value) {
					tilemap[key] = value;
				}
				break;
			case 'width':
				if (tilemap.width !== value) {
					Scene.setTilemapSize!(tilemap, value, tilemap.height);
				}
				break;
			case 'height':
				if (tilemap.height !== value) {
					Scene.setTilemapSize!(tilemap, tilemap.width, value);
				}
				break;
		}
		Scene.requestRendering!();
	};

	SceneTilemap.layerWrite = function (
		this: typeof SceneTilemap,
		event: Event & { value: unknown }
	) {
		const lightBox =
			SceneTilemap.lightBox ??
			(inspectorEls.get('sceneTilemap-light') as typeof SceneTilemap.lightBox);
		if (!lightBox?.lightItems) return;
		SceneTilemap.lightBox = lightBox;
		const type = event.value === 'object' ? 'sprite' : 'tile';
		const items = lightBox.lightItems[type];
		if (lightData(lightBox).dataItems !== items) {
			lightBox.loadItems(items);
		}
	};

	SceneTilemap.layerInput = function (
		this: YamiElement & { changes?: InspectorChange[] },
		_event: Event
	) {
		// 运行时 `this` 是 lightBox 元素（`SceneTilemapPage.vue:373` 把本方法注册成 elLayer 的
		// `input` 监听），并有元素成员 `changes`（inspector 的历史处理器读它）。
		// `Inspector.inputBlur` 返回值同一手法）⇒ 原先那句
		// `const element = this as unknown as HTMLElement` 整条消失。
		if (managerData(Inspector.manager).focusing === this) {
			const lightBox = SceneTilemap.lightBox!;
			const value = read(lightBox);
			for (const item of lightData(lightBox).dataItems ?? []) {
				if (item.value === value) {
					return;
				}
			}
			write(lightBox, 'raw');
			this.changes = [
				{
					input: lightBox,
					oldValue: value,
					newValue: 'raw'
				}
			];
		}
	};

	Inspector.sceneTilemap = SceneTilemap;
}
