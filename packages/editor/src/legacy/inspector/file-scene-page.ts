import { $, getElementWriter } from '@/util/dom.ts';
import { addClass, clear, read, removeClass, write } from '@/util/element-utils';
import { Codec } from '@/codec/codec.ts';
import { Inspector } from './inspector.ts';
import { Editor } from '@/main/editor.ts';
import { Scene } from '@/scene/scene-window.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';
import { GL } from '@/webgl/webgl-init.ts';

{
	interface FileSceneShape {
		[k: string]: any;
	}
	interface FileSceneData {
		width: number;
		height: number;
		tileWidth: number;
		tileHeight: number;
		[k: string]: unknown;
	}
	const FileScene: FileSceneShape = {
		button: null,
		owner: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		paramInput: null
	};

	FileScene.initialize = function (this: typeof FileScene) {
		if (!$('#scene-switch-settings')) return;
		this.button = $('#scene-switch-settings');
		this.owner = {
			setTarget: (target: unknown) => {
				if (this.target !== target) {
					Inspector.open!('fileScene', target);
				}
			},
			planToSave: () => {
				Scene.planToSave!();
			},
			get history() {
				return Scene.history;
			}
		};

		$('#fileScene-ambient-red-slider')?.synchronize?.($('#fileScene-ambient-red'));
		$('#fileScene-ambient-green-slider')?.synchronize?.($('#fileScene-ambient-green'));
		$('#fileScene-ambient-blue-slider')?.synchronize?.($('#fileScene-ambient-blue'));
		$('#fileScene-ambient-direct-slider')?.synchronize?.($('#fileScene-ambient-direct'));

		$('#fileScene-events')?.bind?.(new EventListInterface(this, this.owner));

		$('#fileScene-scripts')?.bind?.(new ScriptListInterface(this, this.owner));

		$('#fileScene-parameter-pane')?.bind?.($('#fileScene-scripts'));

		const elements = document.querySelectorAll(`#fileScene-tileWidth, #fileScene-tileHeight,
    #fileScene-ambient-red, #fileScene-ambient-green, #fileScene-ambient-blue, #fileScene-ambient-direct`);
		const sliders =
			document.querySelectorAll(`#fileScene-ambient-red-slider, #fileScene-ambient-green-slider,
    #fileScene-ambient-blue-slider, #fileScene-ambient-direct-slider`);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, this.owner))
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.sliderFocus)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.sliderBlur)
		);
		document
			.querySelectorAll('#fileScene-events, #fileScene-scripts')
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	};

	FileScene.create = function (this: typeof FileScene) {
		const objects: {
			class: string;
			name: string;
			expanded: boolean;
			hidden: boolean;
			locked: boolean;
			children: unknown[];
		}[] = [];
		const filters = {} as Record<string, unknown>;
		const folders = (Editor.project!.scene as { defaultFolders: Record<string, unknown> })
			.defaultFolders;
		for (const name of Object.values(folders)) {
			if (name && filters[name as string] === undefined) {
				filters[name as string] = true;
				objects.push({
					class: 'folder',
					name: name as string,
					expanded: true,
					hidden: false,
					locked: false,
					children: []
				});
			}
		}
		const WIDTH = 20;
		const HEIGHT = 20;
		return Codec.encodeScene!(
			Object.defineProperties(
				{
					width: WIDTH,
					height: HEIGHT,
					tileWidth: 32,
					tileHeight: 32,
					ambient: { red: 255, green: 255, blue: 255, direct: 0 },
					terrains: '',
					events: [],
					scripts: [],
					objects: objects
				},
				{
					terrainArray: {
						writable: true,
						value: Scene.createTerrains!(WIDTH, HEIGHT)
					},
					terrainChanged: {
						writable: true,
						value: true
					}
				}
			)
		);
	};

	FileScene.open = function (this: typeof FileScene, scene: FileSceneData) {
		if (this.target !== scene) {
			this.target = scene;

			addClass(this.button, 'selected');

			const write = getElementWriter('fileScene', Scene);
			write('width');
			write('height');
			write('tileWidth');
			write('tileHeight');
			write('ambient-red');
			write('ambient-green');
			write('ambient-blue');
			write('ambient-direct');
			write('events');
			write('scripts');
		}
	};

	FileScene.close = function (this: typeof FileScene) {
		if (this.target) {
			this.target = null;

			removeClass(this.button, 'selected');
			clear($('#fileScene-events'));
			clear($('#fileScene-scripts'));
			clear($('#fileScene-parameter-pane'));
		}
	};

	FileScene.write = function (
		this: typeof FileScene,
		options: { width?: number; height?: number }
	) {
		if (options.width !== undefined) {
			write($('#fileScene-width'), options.width);
		}
		if (options.height !== undefined) {
			write($('#fileScene-height'), options.height);
		}
	};

	FileScene.update = function (
		this: typeof FileScene,
		_: FileSceneData,
		key: string,
		value: unknown
	) {
		Scene.planToSave!();
		switch (key) {
			case 'width':
				if (Scene.width !== value) {
					Scene.setSize!(value, Scene.height);
				}
				break;
			case 'height':
				if (Scene.height !== value) {
					Scene.setSize!(Scene.width, value);
				}
				break;
			case 'tileWidth':
				if (Scene.tileWidth !== value) {
					Scene.setTileSize!(value, Scene.tileHeight);
				}
				break;
			case 'tileHeight':
				if (Scene.tileHeight !== value) {
					Scene.setTileSize!(Scene.tileWidth, value);
				}
				break;
			case 'ambient-red':
			case 'ambient-green':
			case 'ambient-blue':
			case 'ambient-direct': {
				const index = key.indexOf('-') + 1;
				const color = key.slice(index);
				if (Scene.ambient[color] !== value) {
					Scene.ambient[color] = value;
					Scene.requestRendering!();
					GL.setAmbientLight!(Scene.ambient);
				}
				break;
			}
		}
	};

	FileScene.paramInput = function (this: typeof FileScene, event: Event) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileScene-').test(element.id)) break;
			element = element.parentElement;
		}
		FileScene.update!(
			FileScene.target,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	Inspector.fileScene = FileScene;
}
