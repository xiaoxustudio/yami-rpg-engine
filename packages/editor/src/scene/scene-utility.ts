import { Data } from '@app/data/data-object.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { Scene } from './scene-window.ts';
import { StageColor } from '@app/utils/stage-color';
import type { EditorConfigShape, EditorProjectShape } from '@app/stores/editor';

interface SceneObjectShape {
	class?: string;
	data?: { guid?: string };
	emitter?: { data: { guid: string } };
	image?: string;
}

interface SceneStateShape {
	grid?: unknown;
	light?: unknown;
	animation?: unknown;
	layer?: unknown;
	brush?: unknown;
	zoom?: unknown;
}

Scene.getObjectFile = function (this: typeof Scene, sceneObject: SceneObjectShape) {
	switch (sceneObject?.class) {
		case 'actor':
		case 'animation': {
			const guid = sceneObject.data?.guid;
			return Data.manifest.guidMap[guid!]?.file ?? null;
		}
		case 'particle': {
			const guid = sceneObject.emitter?.data.guid;
			return Data.manifest.guidMap[guid!]?.file ?? null;
		}
		case 'parallax': {
			const guid = sceneObject.image;
			return Data.manifest.guidMap[guid!]?.file ?? null;
		}
		default:
			return undefined;
	}
};

Scene.openFileLocation = function (this: typeof Scene, sceneObject: SceneObjectShape) {
	const file = Scene.getObjectFile!(sceneObject);
	if (file instanceof FileItem) {
		getBrowserInstance()?.body?.openFileLocation?.(file);
		getBrowserInstance()?.body?.select?.(file);
		getBrowserInstance()?.body?.content?.getFocus?.();
	}
};

Scene.saveToConfig = function (this: typeof Scene, config: EditorConfigShape) {
	config.colors!.sceneBackground = this.background.hex;
};

Scene.loadFromConfig = function (this: typeof Scene, config: EditorConfigShape) {
	this.background = new StageColor(config.colors!.sceneBackground!, () =>
		this.requestRendering!()
	);
};

Scene.saveToProject = function (this: typeof Scene, project: EditorProjectShape) {
	const scene = project.scene as SceneStateShape;
	this.closeTilemap();
	scene.grid = this.showGrid ?? scene.grid;
	scene.light = this.showLight ?? scene.light;
	scene.animation = this.showAnimation ?? scene.animation;
	scene.layer = this.layer ?? scene.layer;
	scene.brush = this.brush ?? scene.brush;
	scene.zoom = this.zoom ?? scene.zoom;
};

Scene.loadFromProject = function (this: typeof Scene, project: EditorProjectShape) {
	const scene = project.scene as SceneStateShape;
	this.switchGrid(scene.grid);
	this.switchLight(scene.light);
	this.switchAnimation(scene.animation);
	this.switchLayer(scene.layer);
	this.switchBrush(scene.brush);
	this.setZoom(scene.zoom);
};
