import { $, getElementWriter } from '@app/utils/dom';
import { addClass, clear, removeClass, write } from '@app/utils/element-utils';
import { Codec } from '@app/engine/codec/codec.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

{
	interface FileSceneShape {
		// oxlint-disable-next-line no-explicit-any
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
		update: null
	};

	FileScene.initialize = function () {};
	FileScene.button = $('#scene-switch-settings');
	FileScene.owner = {
		setTarget: (target: unknown) => {
			if (FileScene.target !== target) {
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
			write('events');
			write('scripts');
			($('#fileScene-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
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

	Inspector.fileScene = FileScene;
}
