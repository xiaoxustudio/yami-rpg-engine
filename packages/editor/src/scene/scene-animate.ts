import { elementDataOf } from '@ui-kit';
import { sceneEls } from '@app/scene/element-registry';
import { addClass, removeClass, hasClass } from '@app/utils/element-utils.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from './scene-window.ts';
import { SceneAnimateEngine } from '@app/engine/scene/scene-animate-engine.ts';
import type { YamiElement } from '@app/types/element-api';

interface SceneMarqueeData {
	key: string | null;
	visible: boolean;
}
const marqueeData = (el: unknown): SceneMarqueeData => elementDataOf<SceneMarqueeData>(el);

Scene.requestAnimation = SceneAnimateEngine.requestAnimation!;
Scene.updateAnimation = SceneAnimateEngine.updateAnimation!;
Scene.stopAnimation = SceneAnimateEngine.stopAnimation!;
Scene.requestRendering = SceneAnimateEngine.requestRendering!;
Scene.renderingFunction = SceneAnimateEngine.renderingFunction!;
Scene.stopRendering = SceneAnimateEngine.stopRendering!;
Scene.updateFont = SceneAnimateEngine.updateFont!;

Scene.switchLayer = (function IIFE() {
	let layerGroup: HTMLElement | null = null;
	let items: Record<string, HTMLElement | null> = { tilemap: null };
	let selection: HTMLElement | null | undefined = undefined;
	const query = () => {
		layerGroup = sceneEls.get('scene-layer') as YamiElement;
		items = { tilemap: null };
		if (layerGroup) {
			for (const item of layerGroup.children) {
				const layer = item.getAttribute('value')!;
				items[layer] = item as HTMLElement;
			}
		}
	};
	return function (this: typeof Scene, layer: string) {
		if (items === null || layerGroup === null) {
			query();
		}
		const element = items[layer];
		if (selection === element) {
			return;
		}

		if (selection === null) {
			this.closeTilemap!(false);
			this.computeActiveTilemapId!();
		}

		if (selection) removeClass(selection, 'selected');
		if (element) addClass(element, 'selected');
		selection = element;

		const marquee = this.marquee;
		switch ((this.layer = layer)) {
			case 'object':
				if (typeof marquee?.switch === 'function') marquee.switch('object');
				this.updateTargetInfo!();
				break;
			case 'tilemap':
				if (typeof marquee?.switch === 'function') {
					marquee.switch(this.brush === 'eraser' ? 'eraser' : 'tile');
				}
				if (typeof marquee?.clear === 'function') marquee.clear();
				break;
			case 'terrain':
				if (typeof marquee?.switch === 'function') {
					marquee.switch(this.brush === 'eraser' ? 'eraser' : 'terrain');
				}
				if (typeof marquee?.clear === 'function') marquee.clear();
				break;
		}
		if (typeof marquee?.resize === 'function') marquee.resize();
		if (this.state === 'open') {
			Scene.requestRendering!();
		}
	};
})();

Scene.switchBrush = (function IIFE() {
	let list: HTMLElement | null = null;
	let items: Record<string, HTMLElement> | null = null;
	let selection: HTMLElement | null | undefined = null;
	const query = () => {
		list = sceneEls.get('scene-brush') as YamiElement;
		items = {} as Record<string, HTMLElement>;
		if (list) {
			for (const item of list.children) {
				const brush = item.getAttribute('value')!;
				items[brush] = item as HTMLElement;
			}
		}
	};
	return function (this: typeof Scene, brush: string) {
		if (items === null || list === null) {
			query();
		}
		const element = items![brush];
		if (selection === element) {
			return;
		}

		if (selection) removeClass(selection, 'selected');
		addClass(element, 'selected');
		selection = element;

		const marquee = this.marquee;
		switch ((this.brush = brush)) {
			case 'eraser':
				if (typeof marquee?.switch === 'function') marquee.switch('eraser');
				break;
			case 'pencil':
			case 'rect':
			case 'oval':
			case 'fill':
				if (typeof marquee?.switch === 'function') {
					marquee.switch(this.layer === 'terrain' ? 'terrain' : 'tile');
				}
				break;
		}
		if (typeof marquee?.clear === 'function') marquee.clear();
		if (typeof marquee?.resize === 'function') marquee.resize();
	};
})();

Scene.switchGrid = function (this: typeof Scene, enabled = !this.showGrid) {
	const item = sceneEls.get('scene-switch-grid') as YamiElement;
	if (enabled) {
		addClass(item, 'selected');
	} else {
		removeClass(item, 'selected');
	}
	this.showGrid = enabled;
	this.requestRendering!();
};

Scene.switchLight = function (this: typeof Scene, enabled = !this.showLight) {
	const item = sceneEls.get('scene-switch-light') as YamiElement;
	if (enabled) {
		addClass(item, 'selected');
	} else {
		removeClass(item, 'selected');
	}
	this.showLight = enabled;
	this.requestRendering!();
};

Scene.switchAnimation = function (this: typeof Scene, enabled = !this.showAnimation) {
	const item = sceneEls.get('scene-switch-animation') as YamiElement;
	this.showAnimation = enabled;
	if (enabled) {
		addClass(item, 'selected');
		this.requestAnimation!();
	} else {
		removeClass(item, 'selected');
		this.stopAnimation!();
		this.resetAnimations!();
	}
	this.requestRendering!();
};

Scene.switchSettings = function (this: typeof Scene) {
	if (!hasClass(Inspector.fileScene.button, 'selected')) {
		Inspector.open!('fileScene', Scene.context.scene);
	} else {
		Inspector.close!();
	}
};

Scene.switchTerrain = function (this: typeof Scene) {
	const context =
		marqueeData(this.marquee).key === 'terrain' ? this.marquee : this.marquee.saveData.terrain!;
	context.terrain = (context.terrain! + 2) % 3;
	if (this.brush === 'eraser') {
		this.switchBrush!('pencil');
	}
	if (marqueeData(this.marquee).visible) {
		this.requestRendering!();
	}
};

Scene.resetAnimations = function (this: typeof Scene) {
	if (this.state === 'open') {
		for (const { player } of this.actors) {
			player.clearParticles();
			player.restart();
		}
		for (const { player } of this.animations) {
			player.clearParticles();
			player.restart();
		}
		for (const { emitter } of this.particles) {
			emitter?.clear();
		}
	}
};
