import { Data } from '@/data/data-object.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { FileItem } from '@/file/file-item.ts';
import { Scene } from './scene-window.ts';
import { StageColor } from '@/util/stage-color.ts';
Scene.getObjectFile = function (this: any, sceneObject: any) {
	switch (sceneObject?.class) {
		case 'actor':
		case 'animation': {
			const guid = sceneObject.data?.guid;
			return Data.manifest.guidMap[guid]?.file ?? null;
		}
		case 'particle': {
			const guid = sceneObject.emitter?.data.guid;
			return Data.manifest.guidMap[guid]?.file ?? null;
		}
		case 'parallax': {
			const guid = sceneObject.image;
			return Data.manifest.guidMap[guid]?.file ?? null;
		}
		default:
			return undefined;
	}
};

Scene.openFileLocation = function (this: any, sceneObject: any) {
	const file = Scene.getObjectFile!(sceneObject);
	if (file instanceof FileItem) {
		getBrowserInstance()?.body?.openFileLocation?.(file);
		getBrowserInstance()?.body?.select?.(file);
		getBrowserInstance()?.body?.content?.getFocus?.();
	}
};

Scene.saveToConfig = function (this: any, config: any) {
	config.colors.sceneBackground = this.background.hex;
};

Scene.loadFromConfig = function (this: any, config: any) {
	this.background = new StageColor(config.colors.sceneBackground, () => this.requestRendering());
};

Scene.saveToProject = function (this: any, project: any) {
	const { scene } = project;
	this.closeTilemap();
	scene.grid = this.showGrid ?? scene.grid;
	scene.light = this.showLight ?? scene.light;
	scene.animation = this.showAnimation ?? scene.animation;
	scene.layer = this.layer ?? scene.layer;
	scene.brush = this.brush ?? scene.brush;
	scene.zoom = this.zoom ?? scene.zoom;
};

Scene.loadFromProject = function (this: any, project: any) {
	const { scene } = project;
	this.switchGrid(scene.grid);
	this.switchLight(scene.light);
	this.switchAnimation(scene.animation);
	this.switchLayer(scene.layer);
	this.switchBrush(scene.brush);
	this.setZoom(scene.zoom);
};
