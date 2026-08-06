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
	const SceneTilemap = {
		owner: Scene,
		target: null as any,
		nameBox: null as any,
		lightBox: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		write: null as any,
		update: null as any,
		layerWrite: null as any,
		layerInput: null as any,
		paramInput: null as any
	};

	SceneTilemap.initialize = function (this: any) {
		if (!$('#sceneTilemap-name')) return;
		this.nameBox = $('#sceneTilemap-name');
		this.lightBox = $('#sceneTilemap-light');
		$('#sceneTilemap-layer').loadItems([
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
		this.lightBox.lightItems = {
			all: Object.values(items),
			tile: [items.raw, items.global, items.ambient],
			sprite: [items.raw, items.global, items.anchor]
		};

		// 光线采样选项 - 重写设置选项名字方法
		this.lightBox.setItemNames = function (this: any, options: any) {
			const backup = this.dataItems;
			this.dataItems = this.lightItems.all;
			selectBoxSetItemNames(this, options);
			this.dataItems = backup;
			if (this.dataValue !== null) {
				this.update();
			}
		};

		$('#sceneTilemap-blend').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#sceneTilemap-conditions').bind(new ConditionListInterface(this, Scene));

		$('#sceneTilemap-events').bind(new EventListInterface(this, Scene));

		$('#sceneTilemap-scripts').bind(new ScriptListInterface(this, Scene));

		$('#sceneTilemap-parameter-pane').bind($('#sceneTilemap-scripts'));

		const elements = $(`#sceneTilemap-name, #sceneTilemap-layer, #sceneTilemap-order,
    #sceneTilemap-light, #sceneTilemap-blend, #sceneTilemap-x, #sceneTilemap-y,
    #sceneTilemap-anchorX, #sceneTilemap-anchorY, #sceneTilemap-offsetX, #sceneTilemap-offsetY,
    #sceneTilemap-parallaxFactorX, #sceneTilemap-parallaxFactorY, #sceneTilemap-opacity`);
		elements.forEach((el: HTMLElement) => el.addEventListener('input', this.paramInput!));
		elements.forEach((el: HTMLElement) => el.addEventListener('focus', Inspector.inputFocus));
		elements.forEach((el: HTMLElement) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, Scene))
		);
		$('#sceneTilemap-layer').addEventListener('write', this.layerWrite);
		$('#sceneTilemap-layer').addEventListener('input', this.layerInput);
		$('#sceneTilemap-width, #sceneTilemap-height').forEach((el: HTMLElement) =>
			el.addEventListener('change', this.paramInput!)
		);
		$('#sceneTilemap-conditions, #sceneTilemap-events, #sceneTilemap-scripts').forEach(
			(el: HTMLElement) => el.addEventListener('change', Scene.listChange)
		);
	};

	SceneTilemap.create = function (this: any, width = 4, height = 4) {
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

	SceneTilemap.open = function (this: any, tilemap: any) {
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

	SceneTilemap.close = function (this: any) {
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

	SceneTilemap.write = function (this: any, options: any) {
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

	SceneTilemap.update = function (this: any, tilemap: any, key: any, value: any) {
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

	SceneTilemap.layerWrite = function (this: any, event: any) {
		const lightBox = SceneTilemap.lightBox;
		const type = event.value === 'object' ? 'sprite' : 'tile';
		const items = lightBox.lightItems[type];
		if (lightBox.dataItems !== items) {
			lightBox.loadItems(items);
		}
	};

	SceneTilemap.layerInput = function (this: any, event: any) {
		if (Inspector.manager.focusing === this) {
			const lightBox = SceneTilemap.lightBox;
			const value = read(lightBox);
			for (const item of lightBox.dataItems) {
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

	SceneTilemap.paramInput = function (this: any, event: any) {
		SceneTilemap.update(SceneTilemap.target, Inspector.getKey!(this), read(this));
	};

	Inspector.sceneTilemap = SceneTilemap;
}
