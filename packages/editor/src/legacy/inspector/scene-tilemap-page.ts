import { $, getElementWriter } from '@/util/dom.ts';
import { clear, read, write } from '@/util/element-utils';
import { Codec } from '@/codec/codec.ts';
import { selectBoxSetItemNames } from '@/components/select-box.ts';
import { Inspector } from './inspector.ts';
import { Scene } from '@/scene/scene-window.ts';
import { ConditionListInterface } from '@/tools/condition-list.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	interface SceneTilemapLightItem {
		name?: string;
		tip?: string;
		value: string | number;
	}
	interface SceneTilemapLightBox {
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
	}
	interface SceneTilemapShape {
		nameBox: HTMLElement | null;
		lightBox: SceneTilemapLightBox | null;
		target: Record<string, unknown> | null;
		update: ((tilemap: Record<string, unknown>, key: string, value: unknown) => void) | null;
		layerWrite: ((event: Event & { value: unknown }) => void) | null;
		layerInput: ((event: Event) => void) | null;
		paramInput: ((event: Event) => void) | null;
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
		layerInput: null,
		paramInput: null
	};

	SceneTilemap.initialize = function (this: typeof SceneTilemap) {
		if (!$('#sceneTilemap-name')) return;
		this.nameBox = $('#sceneTilemap-name');
		this.lightBox = $('#sceneTilemap-light') as unknown as SceneTilemapLightBox;
		$('#sceneTilemap-layer')?.loadItems?.([
			{ name: 'Background', value: 'background' },
			{ name: 'Foreground', value: 'foreground' },
			{ name: 'Object', value: 'object' }
		]);

		const items = {
			raw: { name: 'Raw', value: 'raw' },
			global: { name: 'Global Sampling', value: 'global' },
			ambient: { name: 'Ambient Light', value: 'ambient' },
			anchor: { name: 'Anchor Sampling', value: 'anchor' }
		};
		this.lightBox!.lightItems = {
			all: Object.values(items),
			tile: [items.raw, items.global, items.ambient],
			sprite: [items.raw, items.global, items.anchor]
		};

		// 闂佺绻愰ˇ閬嶅吹鎼淬劍鐓傞柛銉ｅ妿婢瑰姊洪銏╂█闁?- 闂備焦褰冪粔鎾疮閹捐埖濯奸柛鎾楀懏鐎梻渚囧亜椤︾敻濡村澶婅Е鐎广儱鎳愰幗鐔兼煛閸屾繍娼愮痪?
		this.lightBox!.setItemNames = function (
			this: SceneTilemapLightBox,
			options: Record<string, string | { name?: string; tip?: string }>
		) {
			const backup = this.dataItems;
			this.dataItems = this.lightItems.all;
			selectBoxSetItemNames(this, options);
			this.dataItems = backup;
			if (this.dataValue !== null) {
				this.update();
			}
		};

		$('#sceneTilemap-blend')?.loadItems?.([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#sceneTilemap-conditions')?.bind?.(new ConditionListInterface(this, Scene));

		$('#sceneTilemap-events')?.bind?.(new EventListInterface(this, Scene));

		$('#sceneTilemap-scripts')?.bind?.(
			new ScriptListInterface(this as unknown as { target?: { id: string } }, Scene)
		);

		$('#sceneTilemap-parameter-pane')?.bind?.($('#sceneTilemap-scripts'));

		const elements =
			document.querySelectorAll(`#sceneTilemap-name, #sceneTilemap-layer, #sceneTilemap-order,
    #sceneTilemap-light, #sceneTilemap-blend, #sceneTilemap-x, #sceneTilemap-y,
    #sceneTilemap-anchorX, #sceneTilemap-anchorY, #sceneTilemap-offsetX, #sceneTilemap-offsetY,
    #sceneTilemap-parallaxFactorX, #sceneTilemap-parallaxFactorY, #sceneTilemap-opacity`);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('input', this.paramInput!)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, Scene))
		);
		$('#sceneTilemap-layer')?.addEventListener(
			'write',
			this.layerWrite! as unknown as EventListener
		);
		$('#sceneTilemap-layer')?.addEventListener('input', this.layerInput!);
		document
			.querySelectorAll('#sceneTilemap-width, #sceneTilemap-height')
			.forEach((el) => el.addEventListener('change', this.paramInput!));
		document
			.querySelectorAll(
				'#sceneTilemap-conditions, #sceneTilemap-events, #sceneTilemap-scripts'
			)
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	};

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
			write('name');
			write('layer');
			write('order');
			write('light');
			write('blend');
			write('x');
			write('y');
			write('width');
			write('height');
			write('anchorX');
			write('anchorY');
			write('offsetX');
			write('offsetY');
			write('parallaxFactorX');
			write('parallaxFactorY');
			write('opacity');
			write('conditions');
			write('events');
			write('scripts');
		}
	};

	SceneTilemap.close = function (this: typeof SceneTilemap) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear($('#sceneTilemap-conditions'));
			clear($('#sceneTilemap-events'));
			clear($('#sceneTilemap-scripts'));
			clear($('#sceneTilemap-parameter-pane'));
		}
	};

	SceneTilemap.write = function (this: typeof SceneTilemap, options: Record<string, unknown>) {
		if (options.x !== undefined) {
			write($('#sceneTilemap-x'), options.x);
		}
		if (options.y !== undefined) {
			write($('#sceneTilemap-y'), options.y);
		}
		if (options.width !== undefined) {
			write($('#sceneTilemap-width'), options.width);
		}
		if (options.height !== undefined) {
			write($('#sceneTilemap-height'), options.height);
		}
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
		const lightBox = SceneTilemap.lightBox!;
		const type = event.value === 'object' ? 'sprite' : 'tile';
		const items = lightBox.lightItems[type];
		if (lightBox.dataItems !== items) {
			lightBox.loadItems(items);
		}
	};

	SceneTilemap.layerInput = function (this: typeof SceneTilemap, event: Event) {
		if (Inspector.manager.focusing === this) {
			const lightBox = SceneTilemap.lightBox!;
			const value = read(lightBox);
			for (const item of lightBox.dataItems ?? []) {
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

	SceneTilemap.paramInput = function (this: typeof SceneTilemap, event: Event) {
		SceneTilemap.update!(
			SceneTilemap.target as Record<string, unknown>,
			Inspector.getKey!(this),
			read(this)
		);
	};

	Inspector.sceneTilemap = SceneTilemap;
}
