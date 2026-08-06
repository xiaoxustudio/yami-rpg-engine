import { $ } from '@/util/dom.ts';
import { addClass, removeClass, hasClass, css } from '@/util/element-utils.ts';
import { Timer } from '@/util/timer.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Scene } from './scene-window.ts';
import { GL } from '@/webgl/webgl-init.ts';
Scene.requestAnimation = function (this: any) {
	if (this.state === 'open' && this.showAnimation) {
		Timer.appendUpdater!('stageAnimation', this.updateAnimation);
	}
};

Scene.updateAnimation = function (this: any, deltaTime: any) {
	const { animationInterval } = Scene;
	if (animationInterval > 0) {
		Scene.animationElapsed += deltaTime;
		if (Scene.animationElapsed >= animationInterval) {
			Scene.animationElapsed -= animationInterval;
			Scene.animationFrame += 1;
		}
	}
	Scene.updateParallaxes!(deltaTime);
	Scene.updateAnimations!(deltaTime);
	Scene.updateParticles!(deltaTime);
	if (Timer.updaters.stageRendering !== Scene.renderingFunction) {
		Scene.drawScene!();
	}
};

Scene.stopAnimation = function (this: any) {
	Timer.removeUpdater!('stageAnimation', this.updateAnimation);
};

Scene.requestRendering = function (this: any) {
	if (this.state === 'open') {
		Timer.appendUpdater!('stageRendering', this.renderingFunction);
	}
};

Scene.renderingFunction = function (this: any) {
	Scene.updateAnimations!(0);
	Scene.drawScene!();
};

Scene.stopRendering = function (this: any) {
	Timer.removeUpdater!('stageRendering', this.renderingFunction);
};

Scene.switchLayer = (function IIFE() {
	let layerGroup: any = null;
	let items: any = null;
	let selection: any = undefined;
	const query = () => {
		layerGroup = $('#scene-layer');
		items = { tilemap: null as any };
		if (layerGroup) {
			for (const item of layerGroup.children) {
				const layer = item.getAttribute('value');
				items[layer] = item;
			}
		}
	};
	return function (this: any, layer: any) {
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
	let list: any = null;
	let items: any = null;
	let selection: any = null;
	const query = () => {
		list = $('#scene-brush');
		items = {} as Record<string, any>;
		if (list) {
			for (const item of list.children) {
				const brush = item.getAttribute('value');
				items[brush] = item;
			}
		}
	};
	return function (this: any, brush: any) {
		if (items === null || list === null) {
			query();
		}
		const element = items[brush];
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

Scene.switchGrid = function (this: any, enabled = !this.showGrid) {
	const item = $('#scene-switch-grid');
	if (enabled) {
		addClass(item, 'selected');
	} else {
		removeClass(item, 'selected');
	}
	this.showGrid = enabled;
	this.requestRendering!();
};

Scene.switchLight = function (this: any, enabled = !this.showLight) {
	const item = $('#scene-switch-light');
	if (enabled) {
		addClass(item, 'selected');
	} else {
		removeClass(item, 'selected');
	}
	this.showLight = enabled;
	this.requestRendering!();
};

Scene.switchAnimation = function (this: any, enabled = !this.showAnimation) {
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

Scene.switchSettings = function (this: any) {
	if (!hasClass(Inspector.fileScene.button, 'selected')) {
		Inspector.open!('fileScene', Scene.context.scene);
	} else {
		Inspector.close!();
	}
};

Scene.switchTerrain = function (this: any) {
	const context = this.marquee.key === 'terrain' ? this.marquee : this.marquee.saveData.terrain;
	context.terrain = (context.terrain + 2) % 3;
	if (this.brush === 'eraser') {
		this.switchBrush!('pencil');
	}
	if (this.marquee.visible) {
		this.requestRendering!();
	}
};

Scene.resetAnimations = function (this: any) {
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

Scene.updateFont = function (this: any) {
	const context = GL.context2d;
	const size = window.devicePixelRatio * 12;
	if (context.size !== size) {
		context.size = size;
		context.font = `${size}px ${css(document.body).fontFamily}`;
	}
};
