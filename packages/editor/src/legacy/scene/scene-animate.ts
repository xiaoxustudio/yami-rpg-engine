import { $ } from '@app/utils/dom';
import { addClass, removeClass, hasClass } from '@app/utils/element-utils.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Scene } from './scene-window.ts';
import { SceneAnimateEngine } from '@app/engine/scene/scene-animate-engine.ts';

Scene.requestAnimation = SceneAnimateEngine.requestAnimation;
Scene.updateAnimation = SceneAnimateEngine.updateAnimation;
Scene.stopAnimation = SceneAnimateEngine.stopAnimation;
Scene.requestRendering = SceneAnimateEngine.requestRendering;
Scene.renderingFunction = SceneAnimateEngine.renderingFunction;
Scene.stopRendering = SceneAnimateEngine.stopRendering;
Scene.updateFont = SceneAnimateEngine.updateFont;

Scene.switchLayer = (function IIFE() {
	let layerGroup: HTMLElement | null = null;
	let items: Record<string, HTMLElement> = { tilemap: null as unknown as HTMLElement };
	let selection: HTMLElement | null | undefined = undefined;
	const query = () => {
		layerGroup = $('#scene-layer');
		items = { tilemap: null as unknown as HTMLElement };
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
				typeof marquee?.switch === 'function' && marquee.switch('object');
				this.updateTargetInfo!();
				break;
			case 'tilemap':
				typeof marquee?.switch === 'function' &&
					marquee.switch(this.brush === 'eraser' ? 'eraser' : 'tile');
				typeof marquee?.clear === 'function' && marquee.clear();
				break;
			case 'terrain':
				typeof marquee?.switch === 'function' &&
					marquee.switch(this.brush === 'eraser' ? 'eraser' : 'terrain');
				typeof marquee?.clear === 'function' && marquee.clear();
				break;
		}
		typeof marquee?.resize === 'function' && marquee.resize();
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
		list = $('#scene-brush');
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
				typeof marquee?.switch === 'function' && marquee.switch('eraser');
				break;
			case 'pencil':
			case 'rect':
			case 'oval':
			case 'fill':
				typeof marquee?.switch === 'function' &&
					marquee.switch(this.layer === 'terrain' ? 'terrain' : 'tile');
				break;
		}
		typeof marquee?.clear === 'function' && marquee.clear();
		typeof marquee?.resize === 'function' && marquee.resize();
	};
})();

Scene.switchGrid = function (this: typeof Scene, enabled = !this.showGrid) {
	const item = $('#scene-switch-grid');
	if (enabled) {
		addClass(item, 'selected');
	} else {
		removeClass(item, 'selected');
	}
	this.showGrid = enabled;
	this.requestRendering!();
};

Scene.switchLight = function (this: typeof Scene, enabled = !this.showLight) {
	const item = $('#scene-switch-light');
	if (enabled) {
		addClass(item, 'selected');
	} else {
		removeClass(item, 'selected');
	}
	this.showLight = enabled;
	this.requestRendering!();
};

Scene.switchAnimation = function (this: typeof Scene, enabled = !this.showAnimation) {
	const item = $('#scene-switch-animation');
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
	const context = this.marquee.key === 'terrain' ? this.marquee : this.marquee.saveData.terrain;
	context.terrain = (context.terrain + 2) % 3;
	if (this.brush === 'eraser') {
		this.switchBrush!('pencil');
	}
	if (this.marquee.visible) {
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
